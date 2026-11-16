// Pure helpers for the ebook library + reader (unit-tested): watermark text/layout, debounce, names.
import { ApiError } from './errors';

export const WM_ALPHA = 0.12;
const WM_ANGLE = -Math.PI / 6; // -30deg, like the mockup

export function watermarkText(p: { full_name: string | null; phone: string | null; email: string | null }): string {
  const name = p.full_name?.trim() || p.email || '';
  const second = p.phone?.trim() || (p.full_name?.trim() ? p.email ?? '' : '');
  return second ? `${name} · ${second}` : name;
}

/** Font size for a canvas `w` px wide (about 3.2% of the width, 10..64 px). */
export const watermarkFont = (w: number) => Math.round(Math.min(64, Math.max(10, w * 0.032)));

/**
 * Text origins for a watermark repeated over a `w`x`h` canvas, in a frame centred on the canvas and rotated by
 * `angle` (ctx.translate(w/2,h/2); ctx.rotate(angle); fillText(text, x, y)). `textW` = measured text width.
 */
export function watermarkGrid(w: number, h: number, textW: number) {
  const fontPx = watermarkFont(w);
  const half = Math.hypot(w, h) / 2; // the rotated page fits inside this circle
  const stepX = Math.max(textW, fontPx) + fontPx * 3;
  const stepY = fontPx * 4.5;
  const points: { x: number; y: number }[] = [];
  const rows = Math.ceil(half / stepY);
  const cols = Math.ceil((half + stepX) / stepX);
  for (let r = -rows; r <= rows; r++) {
    const shift = (r & 1) * (stepX / 2); // stagger alternate rows
    for (let c = -cols; c <= cols; c++) points.push({ x: c * stepX - shift, y: r * stepY });
  }
  return { angle: WM_ANGLE, fontPx, points };
}

/** Draw the watermark INTO a rendered page canvas (not a DOM overlay). */
export function drawWatermark(ctx: CanvasRenderingContext2D, w: number, h: number, text: string) {
  if (!text) return;
  ctx.save();
  const fontPx = watermarkFont(w);
  ctx.font = `700 ${fontPx}px Quicksand, system-ui, sans-serif`;
  const g = watermarkGrid(w, h, ctx.measureText(text).width);
  ctx.globalAlpha = WM_ALPHA;
  ctx.fillStyle = '#0b1f4b';
  ctx.textBaseline = 'middle';
  ctx.translate(w / 2, h / 2);
  ctx.rotate(g.angle);
  for (const p of g.points) ctx.fillText(text, p.x, p.y);
  ctx.restore();
}

export type Debouncer<A> = { call(a: A): void; flush(): void; cancel(): void };

/** Runs `fn` with the latest value `ms` after the last call; flush() runs a pending call now. */
export function createDebouncer<A>(fn: (a: A) => void, ms: number): Debouncer<A> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pending: { a: A } | null = null;
  const run = () => {
    clearTimeout(timer);
    timer = undefined;
    const p = pending;
    pending = null;
    if (p) fn(p.a);
  };
  return {
    call(a) {
      pending = { a };
      clearTimeout(timer);
      timer = setTimeout(run, ms);
    },
    flush: run,
    cancel() {
      clearTimeout(timer);
      timer = undefined;
      pending = null;
    },
  };
}

export const ebookNo = (e: { number: number | null; sort: number }) => String(e.number ?? e.sort).padStart(2, '0');

export function slugify(s: string): string {
  return s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function ebookFilename(e: { number: number | null; sort: number; title: string }): string {
  return `HDM-${ebookNo(e)}-${slugify(e.title) || 'ebook'}.pdf`;
}

export const isEbookOpen = (e: { item_key: string }, ent: Set<string>) => ent.has(e.item_key);

/** Cover title without the leading "Ebook " (mockup: "MUSCLE MANIA"). */
export const coverTitle = (t: string) => t.replace(/^ebook\s+/i, '').replace(/\s*\(.*\)\s*$/, '');

/** "2026-12-01T..." -> "01/12/2026" (Malaysia time). */
export function dmy(iso: string | null): string | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null;
  const d = new Date(t + 8 * 3600_000).toISOString().slice(0, 10).split('-');
  return `${d[2]}/${d[1]}/${d[0]}`;
}

// Page counts per ebook (per-device convenience for the library's "Hal. x/y" bar).
const K_PAGES = 'hdm_ebook_pages';
export function rememberPages(id: string, n: number) {
  try {
    const m = JSON.parse(localStorage.getItem(K_PAGES) || '{}') as Record<string, number>;
    m[id] = n;
    localStorage.setItem(K_PAGES, JSON.stringify(m));
  } catch {
    /* storage unavailable */
  }
}
export function knownPages(id: string): number | null {
  try {
    const n = (JSON.parse(localStorage.getItem(K_PAGES) || '{}') as Record<string, unknown>)[id];
    return typeof n === 'number' && n > 0 ? n : null;
  } catch {
    return null;
  }
}

// Progress saved during this session (GET /api/me is not re-fetched after each save).
const recent = new Map<string, { last_page: number; finished: boolean }>();
export function noteProgress(id: string, last_page: number, finished: boolean) {
  const prev = recent.get(id);
  recent.set(id, { last_page, finished: finished || !!prev?.finished });
}
export function recentProgress(id: string) {
  return recent.get(id) ?? null;
}

// ---------------- open a PDF for the reader ----------------
export const OPEN_FAILED = 'Ebook tidak dapat dibuka. Sila cuba lagi.';

type PageLike = { getViewport(o: { scale: number }): { width: number; height: number } };
type DocLike = { numPages: number; getPage(i: number): Promise<PageLike>; destroy(): unknown };

/**
 * Opens the PDF and reads every page size (scale 1). `live()` false (the reader unmounted or the id changed) at any
 * await -> the pdf.js document is destroyed and null is returned, so no worker / memory is left behind. ANY failure
 * (open or a page) drops the cached file (`forget`, its own errors ignored) and throws the BM error.
 */
export async function openEbookDoc<D extends DocLike>(
  buf: ArrayBuffer,
  o: { open: (buf: ArrayBuffer) => Promise<D>; forget: () => Promise<void>; live: () => boolean },
): Promise<{ doc: D; sizes: { w: number; h: number }[] } | null> {
  const failed = async () => {
    try {
      await o.forget();
    } catch {
      // the cache may already be gone; the error shown is the same
    }
    return new ApiError('ralat_pelayan', OPEN_FAILED);
  };
  let doc: D;
  try {
    doc = await o.open(buf);
  } catch {
    throw await failed();
  }
  const drop = () => {
    try {
      void Promise.resolve(doc.destroy()).catch(() => undefined);
    } catch {
      // destroy() threw synchronously: nothing else to release
    }
  };
  if (!o.live()) {
    drop();
    return null;
  }
  const sizes: { w: number; h: number }[] = [];
  try {
    for (let i = 1; i <= doc.numPages; i++) {
      const v = (await doc.getPage(i)).getViewport({ scale: 1 });
      if (!o.live()) {
        drop();
        return null;
      }
      sizes.push({ w: v.width, h: v.height });
    }
  } catch {
    drop();
    throw await failed();
  }
  return { doc, sizes };
}
