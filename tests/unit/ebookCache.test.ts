import { describe, it, expect, vi } from 'vitest';
import { IDBFactory } from 'fake-indexeddb';
import {
  assembleChunks, b64ToBytes, cacheKey, EXPIRED_TICKET_MSG, forgetEbook, isExpiredTicket, loadEbook, staleKeys, type GasFn,
} from '../../src/lib/ebookCache';
import { ApiError } from '../../src/lib/errors';

const ID = '00000000-0000-4000-8000-000000000001';
const b64 = (bytes: number[]) => btoa(String.fromCharCode(...bytes));

/** Fake Apps Script: file split into `size`-byte chunks, each padded base64 on its own. */
function fakeGas(file: number[], size: number, opts: { expireOnce?: number; alwaysExpire?: boolean } = {}) {
  const calls: { action: string; ticket: unknown; index?: unknown }[] = [];
  let expired = false;
  const chunks = Math.ceil(file.length / size);
  const fn = (async (action: string, p: Record<string, unknown>) => {
    calls.push({ action, ticket: p.ticket, index: p.index });
    const stale = opts.alwaysExpire
      || (opts.expireOnce !== undefined && !expired && action === 'ebook.chunk' && p.index === opts.expireOnce);
    if (stale) {
      expired = true;
      throw new ApiError('ralat_pelayan', EXPIRED_TICKET_MSG, 200);
    }
    if (action === 'ebook.meta') return { chunks, bytes: file.length, updatedAt: '2026-11-01T00:00:00.000Z' };
    const i = p.index as number;
    return { b64: b64(file.slice(i * size, (i + 1) * size)) };
  }) as GasFn;
  return { fn, calls };
}

const tickets = () => {
  let n = 0;
  const get = vi.fn(async () => `t${++n}`);
  return get;
};

describe('chunk assembly', () => {
  it('decodes each padded chunk separately (never concatenating b64)', () => {
    // 5-byte chunks -> each b64 ends with padding; concatenating the strings would corrupt the bytes
    const file = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    const parts = [b64(file.slice(0, 5)), b64(file.slice(5, 10)), b64(file.slice(10))];
    expect(parts[0].endsWith('=')).toBe(true);
    const buf = assembleChunks(parts.map(b64ToBytes), file.length);
    expect([...new Uint8Array(buf)]).toEqual(file);
  });
  it('rejects a short / long file', () => {
    expect(() => assembleChunks([new Uint8Array([1, 2])], 3)).toThrow(ApiError);
    expect(() => assembleChunks([new Uint8Array([1, 2, 3, 4])], 3)).toThrow(ApiError);
  });
  it('b64ToBytes handles binary bytes 0..255', () => {
    const all = Array.from({ length: 256 }, (_, i) => i);
    expect([...b64ToBytes(b64(all))]).toEqual(all);
  });
});

describe('cache key + version cleanup', () => {
  it('key is id:updatedAt', () => {
    expect(cacheKey(ID, '2026-11-01T00:00:00Z')).toBe(`${ID}:2026-11-01T00:00:00Z`);
    expect(cacheKey(ID, null)).toBe(`${ID}:0`);
  });
  it('only older versions of the same id are stale', () => {
    const other = '00000000-0000-4000-8000-000000000002';
    const keys = [`${ID}:a`, `${ID}:b`, `${other}:a`, `${ID}x:a`];
    expect(staleKeys(keys, ID, 'b')).toEqual([`${ID}:a`]);
    expect(staleKeys([`${ID}:b`], ID, 'b')).toEqual([]);
  });
});

describe('expired ticket policy', () => {
  it('recognises only the Apps Script expiry message', () => {
    expect(isExpiredTicket(new ApiError('ralat_pelayan', EXPIRED_TICKET_MSG))).toBe(true);
    expect(isExpiredTicket(new ApiError('ralat_pelayan', 'Bahagian ebook tidak sah.'))).toBe(false);
    expect(isExpiredTicket(new Error(EXPIRED_TICKET_MSG))).toBe(false);
  });
});

describe('loadEbook', () => {
  const file = Array.from({ length: 23 }, (_, i) => (i * 37) % 256);

  it('downloads all chunks in order with progress, using one ticket', async () => {
    const g = fakeGas(file, 10);
    const get = tickets();
    const seen: string[] = [];
    const buf = await loadEbook(ID, 'v1', get, (p) => seen.push(`${p.done}/${p.total}`), { gas: g.fn, idb: null });
    expect([...new Uint8Array(buf)]).toEqual(file);
    expect(get).toHaveBeenCalledTimes(1);
    expect(g.calls.map((c) => `${c.action}${c.index ?? ''}`)).toEqual(['ebook.meta', 'ebook.chunk0', 'ebook.chunk1', 'ebook.chunk2']);
    expect(seen).toEqual(['0/3', '1/3', '2/3', '3/3']);
  });

  it('expired ticket on a chunk: fetches a fresh ticket once and retries that chunk', async () => {
    const g = fakeGas(file, 10, { expireOnce: 1 });
    const get = tickets();
    const buf = await loadEbook(ID, 'v1', get, undefined, { gas: g.fn, idb: null });
    expect([...new Uint8Array(buf)]).toEqual(file);
    expect(get).toHaveBeenCalledTimes(2);
    expect(g.calls.map((c) => `${c.action}${c.index ?? ''}:${c.ticket}`)).toEqual([
      'ebook.meta:t1', 'ebook.chunk0:t1', 'ebook.chunk1:t1', 'ebook.chunk1:t2', 'ebook.chunk2:t2',
    ]);
  });

  it('a second expiry on the same call is surfaced (no loop)', async () => {
    const g = fakeGas(file, 10, { alwaysExpire: true });
    const get = tickets();
    await expect(loadEbook(ID, 'v1', get, undefined, { gas: g.fn, idb: null })).rejects.toMatchObject({ message: EXPIRED_TICKET_MSG });
    expect(get).toHaveBeenCalledTimes(2);
    expect(g.calls).toHaveLength(2);
  });

  it('other GAS errors are not retried', async () => {
    const get = tickets();
    const gas = (async () => {
      throw new ApiError('ralat_pelayan', 'Ebook tidak dapat dimuatkan. Sila cuba lagi.');
    }) as GasFn;
    await expect(loadEbook(ID, 'v1', get, undefined, { gas, idb: null })).rejects.toBeInstanceOf(ApiError);
    expect(get).toHaveBeenCalledTimes(1);
  });

  it('caches in IndexedDB: second open needs no ticket and no network', async () => {
    const idb = new IDBFactory();
    const g = fakeGas(file, 10);
    const get = tickets();
    await loadEbook(ID, 'v1', get, undefined, { gas: g.fn, idb });
    const n = g.calls.length;
    const progress = vi.fn();
    const again = await loadEbook(ID, 'v1', get, progress, { gas: g.fn, idb });
    expect([...new Uint8Array(again)]).toEqual(file);
    expect(g.calls.length).toBe(n);
    expect(get).toHaveBeenCalledTimes(1);
    expect(progress).toHaveBeenLastCalledWith({ done: 1, total: 1, cached: true });
  });

  it('a new version is downloaded and older versions of the same id are deleted', async () => {
    const idb = new IDBFactory();
    const other = '00000000-0000-4000-8000-000000000002';
    await loadEbook(ID, 'v1', tickets(), undefined, { gas: fakeGas(file, 10).fn, idb });
    await loadEbook(other, 'v1', tickets(), undefined, { gas: fakeGas([9, 9], 10).fn, idb });
    const g2 = fakeGas([7, 7, 7], 10);
    const buf = await loadEbook(ID, 'v2', tickets(), undefined, { gas: g2.fn, idb });
    expect([...new Uint8Array(buf)]).toEqual([7, 7, 7]);
    const keys = await new Promise<string[]>((resolve, reject) => {
      const req = idb.open('hdm_ebooks', 1);
      req.onsuccess = () => {
        const r = req.result.transaction('files').objectStore('files').getAllKeys();
        r.onsuccess = () => resolve((r.result as string[]).sort());
        r.onerror = () => reject(r.error);
      };
    });
    expect(keys).toEqual([`${ID}:v2`, `${other}:v1`].sort());
  });

  it('forgetEbook drops every cached version of that ebook only', async () => {
    const idb = new IDBFactory();
    const other = '00000000-0000-4000-8000-000000000002';
    await loadEbook(ID, 'v1', tickets(), undefined, { gas: fakeGas(file, 10).fn, idb });
    await loadEbook(other, 'v1', tickets(), undefined, { gas: fakeGas([9], 10).fn, idb });
    await forgetEbook(ID, idb);
    const g = fakeGas(file, 10);
    await loadEbook(ID, 'v1', tickets(), undefined, { gas: g.fn, idb });
    expect(g.calls.length).toBeGreaterThan(0); // had to download again
    const g2 = fakeGas([9], 10);
    await loadEbook(other, 'v1', tickets(), undefined, { gas: g2.fn, idb });
    expect(g2.calls).toHaveLength(0); // still cached
  });

  it('falls back to the network when IndexedDB throws', async () => {
    const broken = { open: () => { throw new Error('SecurityError'); } } as unknown as IDBFactory;
    const g = fakeGas(file, 10);
    const buf = await loadEbook(ID, 'v1', tickets(), undefined, { gas: g.fn, idb: broken });
    expect([...new Uint8Array(buf)]).toEqual(file);
  });
});
