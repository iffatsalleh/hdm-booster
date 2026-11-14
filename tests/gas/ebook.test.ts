import { describe, it, expect } from 'vitest';
import { loadGas } from './load';
import { signTicket } from '../../worker/src/hmac';

const g = loadGas(['Hmac.gs.js', 'Ebook.gs.js'], { Date });
const MSG = 'Sesi ebook tamat. Sila buka semula ebook.';
const now = 1_800_000_000;
const SECRET = 'tk';
const MB4 = 4 * 1024 * 1024;

function store(bytes: number) {
  const calls: any[] = [];
  return {
    calls,
    stat(fileId: string) {
      calls.push(['stat', fileId]);
      return { bytes, updatedAt: '2026-11-01T00:00:00.000Z' };
    },
    readChunk(fileId: string, start: number, end: number) {
      calls.push(['read', fileId, start, end]);
      return 'b64:' + start + '-' + end;
    },
  };
}

describe('ebookChunkCount', () => {
  it('uses 4 MB chunks', () => {
    expect(g.EBOOK_CHUNK_BYTES).toBe(MB4);
    expect(g.ebookChunkCount(0)).toBe(0);
    expect(g.ebookChunkCount(1)).toBe(1);
    expect(g.ebookChunkCount(MB4)).toBe(1);
    expect(g.ebookChunkCount(MB4 + 1)).toBe(2);
    expect(g.ebookChunkCount(10 * 1024 * 1024)).toBe(3);
  });
});

describe('ebookRespond_', () => {
  it('valid ticket -> meta from the ticket fileId', async () => {
    const t = await signTicket(SECRET, { ebookId: 'e1', fileId: 'FILE1', uid: 'u' }, now);
    const s = store(10 * 1024 * 1024);
    const r = g.ebookRespond_({ action: 'ebook.meta', ticket: t, fileId: 'EVIL' }, SECRET, now + 5, s);
    expect(r).toEqual({ ok: true, data: { chunks: 3, bytes: 10 * 1024 * 1024, updatedAt: '2026-11-01T00:00:00.000Z' } });
    expect(s.calls).toEqual([['stat', 'FILE1']]);
  });

  it('chunk returns the right slice, last chunk clamped to file size', async () => {
    const t = await signTicket(SECRET, { fileId: 'F', uid: 'u' }, now);
    const size = 10 * 1024 * 1024;
    const s = store(size);
    expect(g.ebookRespond_({ action: 'ebook.chunk', ticket: t, index: 1 }, SECRET, now, s)).toEqual({ ok: true, data: { b64: `b64:${MB4}-${2 * MB4}` } });
    expect(g.ebookRespond_({ action: 'ebook.chunk', ticket: t, index: 2 }, SECRET, now, s)).toEqual({ ok: true, data: { b64: `b64:${2 * MB4}-${size}` } });
  });

  it('rejects out-of-range or non-integer chunk index', async () => {
    const t = await signTicket(SECRET, { fileId: 'F', uid: 'u' }, now);
    const s = store(10 * 1024 * 1024);
    for (const index of [-1, 3, 99, 1.5, '1', null, undefined, NaN]) {
      const r = g.ebookRespond_({ action: 'ebook.chunk', ticket: t, index }, SECRET, now, s);
      expect(r.ok).toBe(false);
      expect(r.message).not.toBe(MSG);
    }
    expect(s.calls.filter((c: any[]) => c[0] === 'read')).toEqual([]);
  });

  it('tampered, expired, missing, wrong-secret tickets give the exact BM message', async () => {
    const t = await signTicket(SECRET, { fileId: 'F', uid: 'u' }, now);
    const flipped = t.slice(0, -1) + (t.endsWith('A') ? 'B' : 'A');
    const expired = await signTicket(SECRET, { fileId: 'F', uid: 'u' }, now - 1000);
    const s = store(100);
    for (const ticket of [flipped, expired, '', undefined, null, 'abc', 123]) {
      expect(g.ebookRespond_({ action: 'ebook.meta', ticket }, SECRET, now, s)).toEqual({ ok: false, message: MSG });
      expect(g.ebookRespond_({ action: 'ebook.chunk', ticket, index: 0 }, SECRET, now, s)).toEqual({ ok: false, message: MSG });
    }
    expect(g.ebookRespond_({ action: 'ebook.meta', ticket: t }, 'other', now, s)).toEqual({ ok: false, message: MSG });
    expect(s.calls).toEqual([]);
  });

  it('ticket without fileId is refused; unknown action and null body are handled', async () => {
    const t = await signTicket(SECRET, { uid: 'u' }, now);
    const s = store(100);
    expect(g.ebookRespond_({ action: 'ebook.meta', ticket: t }, SECRET, now, s)).toEqual({ ok: false, message: MSG });
    const ok = await signTicket(SECRET, { fileId: 'F' }, now);
    expect(g.ebookRespond_({ action: 'nope', ticket: ok }, SECRET, now, s).ok).toBe(false);
    expect(g.ebookRespond_(null, SECRET, now, s).ok).toBe(false);
  });

  it('store errors become a generic failure (no leak)', async () => {
    const t = await signTicket(SECRET, { fileId: 'F' }, now);
    const bad = { stat() { throw new Error('secret drive detail'); }, readChunk() { throw new Error('x'); } };
    const r = g.ebookRespond_({ action: 'ebook.meta', ticket: t }, SECRET, now, bad);
    expect(r.ok).toBe(false);
    expect(JSON.stringify(r)).not.toContain('secret drive detail');
  });
});

describe('handleAppApi', () => {
  it('wraps the response with jsonOut using Script Properties + Drive', async () => {
    const t = await signTicket(SECRET, { fileId: 'FILE9', uid: 'u' }, Math.floor(Date.now() / 1000));
    const bytes = new Array(5 * 1024 * 1024);
    const file = {
      getSize: () => bytes.length,
      getLastUpdated: () => new Date('2026-11-02T00:00:00Z'),
    };
    let asked = '';
    const gg = loadGas(['Hmac.gs.js', 'Config.gs.js', 'Ebook.gs.js'], {
      Date,
      PropertiesService: { getScriptProperties: () => ({ getProperty: (k: string) => (k === 'TICKET_SECRET' ? SECRET : null) }) },
      DriveApp: { getFileById: (id: string) => ((asked = id), file) },
      jsonOut: (o: any) => ({ out: o }),
      resolveFieldMap: () => ({}),
    });
    const meta = gg.handleAppApi({ action: 'ebook.meta', ticket: t }, {});
    expect(meta.out).toMatchObject({ ok: true, data: { chunks: 2, bytes: 5 * 1024 * 1024, updatedAt: '2026-11-02T00:00:00.000Z' } });
    expect(asked).toBe('FILE9');
    expect(gg.handleAppApi({ action: 'ebook.meta', ticket: 'x' }, {}).out).toEqual({ ok: false, message: MSG });
  });
});

describe('driveRangeRead_', () => {
  function mk(size: number, code = 206, shortBy = 0) {
    const reqs: any[] = [];
    const gg = loadGas(['Hmac.gs.js', 'Ebook.gs.js'], {
      Date,
      ScriptApp: { getOAuthToken: () => 'TOK' },
      UrlFetchApp: {
        fetch: (url: string, opts: any) => {
          reqs.push({ url, opts });
          const m = /bytes=(\d+)-(\d+)/.exec(opts.headers.Range)!;
          const n = Number(m[2]) - Number(m[1]) + 1 - shortBy;
          return { getResponseCode: () => code, getContent: () => new Array(n).fill(65) };
        },
      },
    });
    return { gg, reqs, size };
  }
  const size = 10 * 1024 * 1024;

  it('requests first / middle / last ranges with bearer token', () => {
    const { gg, reqs } = mk(size);
    const first = gg.driveRangeRead_('F/1', 0, MB4);
    gg.driveRangeRead_('F/1', MB4, 2 * MB4);
    const last = gg.driveRangeRead_('F/1', 2 * MB4, size);
    expect(reqs.map((r) => r.opts.headers.Range)).toEqual([`bytes=0-${MB4 - 1}`, `bytes=${MB4}-${2 * MB4 - 1}`, `bytes=${2 * MB4}-${size - 1}`]);
    expect(reqs[0].url).toBe('https://www.googleapis.com/drive/v3/files/F%2F1?alt=media');
    expect(reqs[0].opts.headers.Authorization).toBe('Bearer TOK');
    expect(Buffer.from(first, 'base64').length).toBe(MB4);
    expect(Buffer.from(last, 'base64').length).toBe(size - 2 * MB4);
  });
  it('accepts 200, rejects other codes and wrong lengths', () => {
    expect(mk(100, 200).gg.driveRangeRead_('F', 0, 10)).toBe(Buffer.alloc(10, 65).toString('base64'));
    expect(() => mk(100, 403).gg.driveRangeRead_('F', 0, 10)).toThrow(/HTTP 403/);
    expect(() => mk(100, 206, 1).gg.driveRangeRead_('F', 0, 10)).toThrow(/length/);
  });
});