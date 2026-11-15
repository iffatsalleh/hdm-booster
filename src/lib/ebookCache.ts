// Ebook file loader: IndexedDB cache (key `${id}:${updatedAt}`) in front of the Apps Script chunk API.
// Network path: ticket (from the Worker) -> ebook.meta -> ebook.chunk 0..n-1, each chunk decoded on its own
// (padded base64 per chunk, never concatenate b64 strings). An expired ticket is replaced once per call.
import { ApiError } from './errors';
import { gas as realGas } from './gas';

export const EXPIRED_TICKET_MSG = 'Sesi ebook tamat. Sila buka semula ebook.';
const DB_NAME = 'hdm_ebooks';
const STORE = 'files';

export type GasFn = <T>(action: string, payload: Record<string, unknown>) => Promise<T>;
export type LoadProgress = { done: number; total: number; cached: boolean };
export type LoadDeps = {
  gas?: GasFn;
  /** IndexedDB factory; null disables the cache. Defaults to globalThis.indexedDB. */
  idb?: IDBFactory | null;
};

export const cacheKey = (id: string, updatedAt: string | null | undefined): string => `${id}:${updatedAt || '0'}`;

/** Cached keys of OTHER versions of this ebook (to delete). */
export function staleKeys(keys: readonly string[], id: string, updatedAt: string | null | undefined): string[] {
  const keep = cacheKey(id, updatedAt);
  return keys.filter((k) => k.startsWith(id + ':') && k !== keep);
}

export function isExpiredTicket(e: unknown): boolean {
  return e instanceof ApiError && e.message === EXPIRED_TICKET_MSG;
}

export function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

const INCOMPLETE = 'Ebook tidak lengkap. Sila cuba lagi.';

export function assembleChunks(parts: readonly Uint8Array[], bytes: number): ArrayBuffer {
  const total = parts.reduce((n, p) => n + p.length, 0);
  if (total !== bytes) throw new ApiError('ralat_pelayan', INCOMPLETE);
  const out = new Uint8Array(total);
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.length;
  }
  return out.buffer;
}

// ---------- IndexedDB (promisified, every failure -> caller falls back to the network) ----------

type Store = {
  get(key: string): Promise<ArrayBuffer | null>;
  put(key: string, buf: ArrayBuffer): Promise<void>;
  keys(): Promise<string[]>;
  del(key: string): Promise<void>;
};

const req = <T>(r: IDBRequest<T>) =>
  new Promise<T>((resolve, reject) => {
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });

function openStore(idb: IDBFactory): Promise<Store> {
  return new Promise<Store>((resolve, reject) => {
    const open = idb.open(DB_NAME, 1);
    open.onupgradeneeded = () => {
      if (!open.result.objectStoreNames.contains(STORE)) open.result.createObjectStore(STORE);
    };
    open.onblocked = () => reject(new Error('idb blocked'));
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const db = open.result;
      const tx = (mode: IDBTransactionMode) => db.transaction(STORE, mode).objectStore(STORE);
      resolve({
        get: async (k) => {
          const v = await req(tx('readonly').get(k));
          return v instanceof ArrayBuffer ? v : null;
        },
        put: async (k, buf) => {
          await req(tx('readwrite').put(buf, k));
        },
        keys: async () => (await req(tx('readonly').getAllKeys())).map(String),
        del: async (k) => {
          await req(tx('readwrite').delete(k));
        },
      });
    };
  });
}

async function dropStale(store: Store, id: string, updatedAt: string | null) {
  try {
    for (const k of staleKeys(await store.keys(), id, updatedAt)) await store.del(k);
  } catch {
    /* best effort */
  }
}

// ---------- network ----------

async function download(gas: GasFn, getTicket: () => Promise<string>, onProgress?: (p: LoadProgress) => void) {
  let ticket = await getTicket();
  const call = async <T>(action: string, extra: Record<string, unknown>): Promise<T> => {
    try {
      return await gas<T>(action, { ticket, ...extra });
    } catch (e) {
      if (!isExpiredTicket(e)) throw e;
      ticket = await getTicket(); // one fresh ticket, one retry of this call
      return gas<T>(action, { ticket, ...extra });
    }
  };
  const meta = await call<{ chunks: number; bytes: number }>('ebook.meta', {});
  const total = Number(meta?.chunks);
  if (!Number.isInteger(total) || total <= 0) throw new ApiError('tiada_fail');
  onProgress?.({ done: 0, total, cached: false });
  const parts: Uint8Array[] = [];
  for (let index = 0; index < total; index++) {
    const { b64 } = await call<{ b64: string }>('ebook.chunk', { index });
    parts.push(b64ToBytes(b64));
    onProgress?.({ done: index + 1, total, cached: false });
  }
  return assembleChunks(parts, Number(meta.bytes));
}

const defaultIdb = (idb: IDBFactory | null | undefined) =>
  idb === undefined ? (typeof indexedDB === 'undefined' ? null : indexedDB) : idb;

/** Delete every cached version of this ebook (e.g. a cached file pdf.js cannot open). */
export async function forgetEbook(id: string, idb?: IDBFactory | null): Promise<void> {
  const f = defaultIdb(idb);
  if (!f) return;
  try {
    const store = await openStore(f);
    for (const k of await store.keys()) if (k.startsWith(id + ':')) await store.del(k);
  } catch {
    /* nothing cached / unavailable */
  }
}

/**
 * The ebook's PDF bytes: from IndexedDB when this version is cached, else downloaded (then cached, and older
 * versions of the same ebook deleted). `getTicket` is only called on a cache miss / expired ticket.
 */
export async function loadEbook(
  id: string,
  updatedAt: string | null,
  getTicket: () => Promise<string>,
  onProgress?: (p: LoadProgress) => void,
  deps: LoadDeps = {},
): Promise<ArrayBuffer> {
  const key = cacheKey(id, updatedAt);
  const idb = defaultIdb(deps.idb);
  let store: Store | null = null;
  if (idb) {
    try {
      store = await openStore(idb);
      const hit = await store.get(key);
      if (hit) {
        onProgress?.({ done: 1, total: 1, cached: true });
        void dropStale(store, id, updatedAt);
        return hit;
      }
    } catch {
      store = null; // private mode / blocked / corrupt: network only
    }
  }
  const buf = await download(deps.gas ?? (realGas as GasFn), getTicket, onProgress);
  if (store) {
    try {
      await store.put(key, buf);
    } catch {
      /* quota: still readable this session */
    }
    await dropStale(store, id, updatedAt);
  }
  return buf;
}
