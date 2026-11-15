// DEV MOCK ONLY: Apps Script ebook API (ebook.meta / ebook.chunk) over a generated PDF, with the real contract:
// padded base64 per chunk, {ok:false, message} errors. The FIRST ticket of a page load expires after two calls
// (meta + chunk 0), so the reader exercises its fresh-ticket retry once.
import { ApiError } from '../lib/errors';
import { catalog } from './fixtures';
import { buildMockPdf } from './pdfFixture';
import { delay } from './db';

const CHUNK = 2048; // real: 4 MiB; small here so a mock ebook has several chunks
const EXPIRED = 'Sesi ebook tamat. Sila buka semula ebook.';

const tickets = new Map<string, { ebookId: string; uses: number; limit: number }>();
let seq = 0;

/** Called by the mock Worker route POST /api/ebook/:id/ticket. */
export function issueTicket(ebookId: string): string {
  const t = `mock-ticket-${++seq}`;
  tickets.set(t, { ebookId, uses: 0, limit: seq === 1 ? 2 : Infinity });
  return t;
}

const files = new Map<string, Uint8Array>();
function fileFor(ebookId: string): Uint8Array {
  let f = files.get(ebookId);
  if (!f) {
    const e = catalog.ebooks.find((x) => x.id === ebookId);
    f = buildMockPdf(e?.title ?? 'Ebook', 6 + (e?.sort ?? 0));
    files.set(ebookId, f);
  }
  return f;
}

function b64(bytes: Uint8Array): string {
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}

const fail = (message: string): never => {
  throw new ApiError('ralat_pelayan', message, 200);
};

export async function mockGas<T>(action: string, payload: Record<string, unknown>): Promise<T> {
  await delay(250);
  if (action !== 'ebook.meta' && action !== 'ebook.chunk') return fail('Tindakan tidak dikenali.');
  const t = tickets.get(String(payload.ticket));
  if (!t || t.uses >= t.limit) return fail(EXPIRED);
  t.uses++;
  const file = fileFor(t.ebookId);
  const chunks = Math.ceil(file.length / CHUNK);
  const updatedAt = catalog.ebooks.find((x) => x.id === t.ebookId)?.file_updated_at ?? null;
  if (action === 'ebook.meta') return { chunks, bytes: file.length, updatedAt } as T;
  const i = payload.index;
  if (typeof i !== 'number' || !Number.isInteger(i) || i < 0 || i >= chunks) return fail('Bahagian ebook tidak sah.');
  return { b64: b64(file.subarray(i * CHUNK, Math.min(file.length, (i + 1) * CHUNK))) } as T;
}
