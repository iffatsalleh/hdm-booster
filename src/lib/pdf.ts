// pdf.js, loaded lazily on the reader route only, from jsDelivr's npm mirror at the EXACT installed version
// (__PDFJS_VERSION__ is defined by vite.config.ts from node_modules/pdfjs-dist/package.json). Not bundled:
// vite inlines dynamic imports into the single app.js, which would add ~430 kB to every page load; the worker
// has to come from the CDN anyway, so the module comes from the same place. Legacy build (polyfills
// Promise.withResolvers etc. for older iOS Safari). pdf.js wraps the cross-origin worker URL in a blob worker.
declare const __PDFJS_VERSION__: string | undefined;

const CDN = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@';

export function pdfModuleUrl(version: string): string {
  return `${CDN}${version}/legacy/build/pdf.min.mjs`;
}

export function pdfWorkerUrl(version: string): string {
  return `${CDN}${version}/legacy/build/pdf.worker.min.mjs`;
}

/** Standard-font and CMap data for PDFs that do not embed their fonts (same CDN + version). */
export function pdfDataUrls(version: string) {
  const base = `${CDN}${version}/`;
  return { standardFontDataUrl: base + 'standard_fonts/', cMapUrl: base + 'cmaps/', cMapPacked: true };
}

type Pdfjs = typeof import('pdfjs-dist/legacy/build/pdf.mjs');
let loading: Promise<Pdfjs> | null = null;

const version = () => (typeof __PDFJS_VERSION__ === 'string' ? __PDFJS_VERSION__ : '');

export function loadPdfjs(): Promise<Pdfjs> {
  loading ??= (import(/* @vite-ignore */ pdfModuleUrl(version())) as Promise<Pdfjs>).then((m) => {
    m.GlobalWorkerOptions.workerSrc = pdfWorkerUrl(version());
    return m;
  });
  loading.catch(() => {
    loading = null; // e.g. offline: the next open tries again
  });
  return loading;
}

/** Open PDF bytes. pdf.js transfers (detaches) the buffer it is given, so it gets a copy. */
export async function openPdf(buf: ArrayBuffer) {
  const m = await loadPdfjs();
  return m.getDocument({ data: new Uint8Array(buf.slice(0)), isEvalSupported: false, ...pdfDataUrls(version()) }).promise;
}

export type PdfDoc = Awaited<ReturnType<typeof openPdf>>;
