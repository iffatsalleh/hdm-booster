import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  createDebouncer, ebookFilename, ebookNo, isEbookOpen, slugify, watermarkGrid, watermarkText, WM_ALPHA,
} from '../../src/lib/reader';
import { pdfModuleUrl, pdfWorkerUrl } from '../../src/lib/pdf';

describe('watermark', () => {
  it('text is "full_name · phone"', () => {
    expect(watermarkText({ full_name: 'Ali Bin Abu', phone: '60123456789', email: 'ali@gmail.com' })).toBe('Ali Bin Abu · 60123456789');
    expect(watermarkText({ full_name: null, phone: '60123456789', email: 'ali@gmail.com' })).toBe('ali@gmail.com · 60123456789');
    expect(watermarkText({ full_name: 'Ali', phone: null, email: 'ali@gmail.com' })).toBe('Ali · ali@gmail.com');
  });

  it('opacity ~0.12, diagonal, font scales with page width', () => {
    expect(WM_ALPHA).toBeCloseTo(0.12);
    const g = watermarkGrid(800, 1131, 240);
    expect(g.angle).toBeCloseTo(-Math.PI / 6);
    expect(g.fontPx).toBeGreaterThanOrEqual(10);
    expect(watermarkGrid(1600, 2262, 480).fontPx).toBeGreaterThan(g.fontPx);
  });

  it('repeats over the whole page (every corner is covered by the rotated grid)', () => {
    const [w, h, tw] = [800, 1131, 240];
    const g = watermarkGrid(w, h, tw);
    expect(g.points.length).toBeGreaterThan(12);
    // a page corner, rotated into the grid frame, lies inside the grid's extent
    const xs = g.points.map((p) => p.x);
    const ys = g.points.map((p) => p.y);
    for (const [cx, cy] of [[-w / 2, -h / 2], [w / 2, -h / 2], [-w / 2, h / 2], [w / 2, h / 2]]) {
      const rx = cx * Math.cos(-g.angle) - cy * Math.sin(-g.angle);
      const ry = cx * Math.sin(-g.angle) + cy * Math.cos(-g.angle);
      expect(rx).toBeGreaterThanOrEqual(Math.min(...xs));
      expect(rx).toBeLessThanOrEqual(Math.max(...xs) + tw);
      expect(ry).toBeGreaterThanOrEqual(Math.min(...ys) - g.fontPx);
      expect(ry).toBeLessThanOrEqual(Math.max(...ys) + g.fontPx);
    }
  });

  it('point count stays bounded for huge canvases', () => {
    expect(watermarkGrid(4000, 5656, 900).points.length).toBeLessThan(400);
  });
});

describe('debounce', () => {
  afterEach(() => vi.useRealTimers());

  it('saves once, with the last value, 2 s after the last change', () => {
    vi.useFakeTimers();
    const save = vi.fn();
    const d = createDebouncer(save, 2000);
    d.call(3);
    vi.advanceTimersByTime(1500);
    d.call(4);
    vi.advanceTimersByTime(1999);
    expect(save).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith(4);
  });

  it('flush runs a pending save now; cancel drops it', () => {
    vi.useFakeTimers();
    const save = vi.fn();
    const d = createDebouncer(save, 2000);
    d.flush();
    expect(save).not.toHaveBeenCalled();
    d.call(7);
    d.flush();
    expect(save).toHaveBeenCalledWith(7);
    vi.advanceTimersByTime(5000);
    expect(save).toHaveBeenCalledTimes(1);
    d.call(8);
    d.cancel();
    vi.advanceTimersByTime(5000);
    expect(save).toHaveBeenCalledTimes(1);
  });
});

describe('ebook helpers', () => {
  it('numbers are two digits', () => {
    expect(ebookNo({ number: 1, sort: 9 })).toBe('01');
    expect(ebookNo({ number: null, sort: 7 })).toBe('07');
  });
  it('download filename HDM-<number>-<slug>.pdf', () => {
    expect(slugify('Ebook Strategi HDM BOOSTER (Updated Version)')).toBe('ebook-strategi-hdm-booster-updated-version');
    expect(ebookFilename({ number: 1, sort: 1, title: 'Ebook Strategi HDM BOOSTER (Updated Version)' }))
      .toBe('HDM-01-ebook-strategi-hdm-booster-updated-version.pdf');
    expect(ebookFilename({ number: 5, sort: 5, title: '  ' })).toBe('HDM-05-ebook.pdf');
  });
  it('open iff the item is in entitlements', () => {
    expect(isEbookOpen({ item_key: 'ebook_tas' }, new Set(['ebook_tas']))).toBe(true);
    expect(isEbookOpen({ item_key: 'ebook_tas' }, new Set(['ebook_strategi']))).toBe(false);
  });
  it('pdf.js worker is loaded from jsDelivr at the exact installed version', () => {
    expect(pdfWorkerUrl('4.10.38')).toBe('https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/legacy/build/pdf.worker.min.mjs');
    expect(pdfModuleUrl('4.10.38')).toBe('https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/legacy/build/pdf.min.mjs');
  });
});

describe('openEbookDoc (Reader open + page sizes)', () => {
  type Doc = { numPages: number; destroyed: number; getPage(i: number): Promise<{ getViewport(o: { scale: number }): { width: number; height: number } }>; destroy(): Promise<void> };
  const fakeDoc = (n: number, opts: { failPage?: number; onPage?: (i: number) => void } = {}): Doc => {
    const d: Doc = {
      numPages: n,
      destroyed: 0,
      async getPage(i) {
        opts.onPage?.(i);
        if (i === opts.failPage) throw new Error('bad page');
        return { getViewport: () => ({ width: 100 * i, height: 200 }) };
      },
      async destroy() { d.destroyed++; },
    };
    return d;
  };

  it('returns the doc and every page size while live', async () => {
    const { openEbookDoc } = await import('../../src/lib/reader');
    const doc = fakeDoc(3);
    const forget = vi.fn(async () => {});
    const r = await openEbookDoc(new ArrayBuffer(1), { open: async () => doc, forget, live: () => true });
    expect(r?.doc).toBe(doc);
    expect(r?.sizes).toEqual([{ w: 100, h: 200 }, { w: 200, h: 200 }, { w: 300, h: 200 }]);
    expect(doc.destroyed).toBe(0);
    expect(forget).not.toHaveBeenCalled();
  });

  it('unmounted while opening -> destroys the doc, returns null', async () => {
    const { openEbookDoc } = await import('../../src/lib/reader');
    const doc = fakeDoc(3);
    let live = true;
    const r = await openEbookDoc(new ArrayBuffer(1), { open: async () => { live = false; return doc; }, forget: async () => {}, live: () => live });
    expect(r).toBeNull();
    expect(doc.destroyed).toBe(1);
  });

  it('unmounted during the size loop -> destroys the doc, stops reading pages', async () => {
    const { openEbookDoc } = await import('../../src/lib/reader');
    let live = true;
    const seen: number[] = [];
    const doc = fakeDoc(50, { onPage: (i) => { seen.push(i); if (i === 2) live = false; } });
    const r = await openEbookDoc(new ArrayBuffer(1), { open: async () => doc, forget: async () => {}, live: () => live });
    expect(r).toBeNull();
    expect(doc.destroyed).toBe(1);
    expect(seen).toEqual([1, 2]);
  });

  it('ANY open failure forgets the cached file and throws the BM message', async () => {
    const { openEbookDoc } = await import('../../src/lib/reader');
    for (const err of [Object.assign(new Error('x'), { name: 'InvalidPDFException' }), new Error('worker failed'), 'odd']) {
      const forget = vi.fn(async () => {});
      await expect(openEbookDoc(new ArrayBuffer(1), { open: async () => { throw err; }, forget, live: () => true }))
        .rejects.toMatchObject({ reason: 'ralat_pelayan', message: 'Ebook tidak dapat dibuka. Sila cuba lagi.' });
      expect(forget).toHaveBeenCalledTimes(1);
    }
  });

  it('a page that cannot be read -> doc destroyed, cache forgotten, BM error; a failing forget is ignored', async () => {
    const { openEbookDoc } = await import('../../src/lib/reader');
    const doc = fakeDoc(3, { failPage: 2 });
    const forget = vi.fn(async () => { throw new Error('idb gone'); });
    await expect(openEbookDoc(new ArrayBuffer(1), { open: async () => doc, forget, live: () => true }))
      .rejects.toMatchObject({ message: 'Ebook tidak dapat dibuka. Sila cuba lagi.' });
    expect(doc.destroyed).toBe(1);
    expect(forget).toHaveBeenCalledTimes(1);
  });
});
