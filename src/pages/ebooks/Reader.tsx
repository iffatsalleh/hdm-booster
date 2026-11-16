// Ebook reader (mockup pembaca-ebook.html). Ticket from the Worker (403 -> lock card, Apps Script never called),
// PDF bytes via loadEbook (IndexedDB cache / Apps Script chunks), pdf.js canvases rendered lazily with the
// participant's watermark drawn into each canvas. Progress: PUT /api/ebook/:id/progress (debounced 2 s).
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks';
import { api } from '../../lib/api';
import { ApiError, bm } from '../../lib/errors';
import { forgetEbook, loadEbook } from '../../lib/ebookCache';
import { openPdf, type PdfDoc } from '../../lib/pdf';
import {
  createDebouncer, drawWatermark, ebookFilename, ebookNo, noteProgress, openEbookDoc, recentProgress, rememberPages,
  watermarkText,
} from '../../lib/reader';
import { useSession, type CatalogEbook } from '../../state/session';
import { Layout } from '../../ui/Layout';
import { Button } from '../../ui/Button';
import { Empty } from '../../ui/Empty';
import { LockBadge } from '../../ui/LockBadge';
import { UpgradeButton } from '../../ui/Upgrade';
import { toast } from '../../ui/Toast';
import { Cover } from './Library';

type TicketRes = { ticket: string; updatedAt: string | null; allowDownload: boolean };
type Size = { w: number; h: number };
type Stage =
  | { k: 'ticket' }
  | { k: 'locked'; msg: string }
  | { k: 'error'; msg: string }
  | { k: 'loading'; done: number; total: number; cached: boolean }
  | { k: 'ready'; doc: PdfDoc; buf: ArrayBuffer; allowDownload: boolean; sizes: Size[] };

const SAVE_MS = 2000;
const ZOOMS = [1, 1.25, 1.5, 2, 2.5];
const progressPath = (id: string) => `/api/ebook/${encodeURIComponent(id)}/progress`;

export function Reader({ id }: { id: string }) {
  const s = useSession();
  const e = s.catalog?.ebooks.find((x) => x.id === id) ?? null;
  const [stage, setStage] = useState<Stage>({ k: 'ticket' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let live = true;
    let doc: PdfDoc | null = null;
    setStage({ k: 'ticket' });
    const ticketOnce = () => api<TicketRes>('POST', `/api/ebook/${encodeURIComponent(id)}/ticket`);
    (async () => {
      let first: TicketRes;
      try {
        first = await ticketOnce();
      } catch (err) {
        if (!live) return;
        const locked = err instanceof ApiError && err.reason === 'tiada_akses';
        setStage({ k: locked ? 'locked' : 'error', msg: bm(err) });
        return;
      }
      let used = false;
      const getTicket = async () => {
        if (!used) {
          used = true;
          return first.ticket;
        }
        return (await ticketOnce()).ticket;
      };
      try {
        const updatedAt = first.updatedAt ?? e?.file_updated_at ?? null;
        const buf = await loadEbook(id, updatedAt, getTicket, (p) => live && setStage({ k: 'loading', ...p }));
        if (!live) return;
        // destroys the pdf.js doc itself when we unmount mid-way; any open failure drops the cached file
        const opened = await openEbookDoc(buf, { open: openPdf, forget: () => forgetEbook(id), live: () => live });
        if (!opened) return;
        if (!live) {
          void opened.doc.destroy();
          return;
        }
        doc = opened.doc;
        rememberPages(id, doc.numPages);
        setStage({ k: 'ready', doc, buf, allowDownload: first.allowDownload === true, sizes: opened.sizes });
      } catch (err) {
        if (live) setStage({ k: 'error', msg: bm(err) });
      }
    })();
    return () => {
      live = false;
      void doc?.destroy();
    };
  }, [id, attempt]);

  const title = e ? `${ebookNo(e)} ${e.title}` : 'Ebook';

  if (stage.k === 'ready') {
    const row = s.reading.find((r) => r.ebook_id === id);
    const mine = recentProgress(id);
    return (
      <ReadyView id={id} e={e} title={title} doc={stage.doc} buf={stage.buf} sizes={stage.sizes}
        allowDownload={stage.allowDownload} startPage={mine?.last_page ?? row?.last_page ?? 1}
        finishedInit={!!mine?.finished || !!row?.finished_at} wm={watermarkText(s.profile ?? { full_name: null, phone: null, email: null })} />
    );
  }

  return (
    <Layout route="ebook_read" title={title} back="#/ebook">
      {stage.k === 'locked' ? (
        <section class="card locked" style="text-align:center;padding:24px 18px">
          {e ? <div class="dim" style="max-width:150px;margin:0 auto"><Cover e={e} /></div> : null}
          <h2 style="font-size:18px;margin-top:12px">{e?.title ?? 'Ebook'}</h2>
          <div style="margin-top:8px"><LockBadge /></div>
          <p class="small muted" style="margin-top:8px">{stage.msg}</p>
          <UpgradeButton style="margin-top:14px" />
          <Button href="#/ebook" variant="ghost" block style="margin-top:8px">Kembali ke Ebook</Button>
        </section>
      ) : stage.k === 'error' ? (
        <Empty icon="ph-bold ph-warning-circle" tone="yellow" title="Ebook tidak dapat dimuatkan" text={stage.msg}>
          <Button block onClick={() => setAttempt((n) => n + 1)}>Cuba lagi</Button>
          <Button href="#/ebook" variant="ghost" block style="margin-top:8px">Kembali ke Ebook</Button>
        </Empty>
      ) : (
        <section class="card" style="text-align:center;padding:28px 18px" aria-busy="true">
          <span class="ic blue" style="margin:0 auto"><i class="ph-bold ph-book-open-text" aria-hidden="true" /></span>
          <h2 style="font-size:18px;margin-top:12px">
            {stage.k === 'loading' && !stage.cached ? 'Memuat turun ebook…' : 'Membuka ebook…'}
          </h2>
          {stage.k === 'loading' && !stage.cached ? (
            <>
              <div class="bar" style="margin-top:14px" role="progressbar" aria-valuemin={0} aria-valuemax={stage.total} aria-valuenow={stage.done}>
                <span style={`width:${Math.round((stage.done / Math.max(1, stage.total)) * 100)}%`} />
              </div>
              <p class="tiny muted" style="margin-top:6px">{Math.round((stage.done / Math.max(1, stage.total)) * 100)}%</p>
              <p class="tiny muted" style="margin-top:10px">Muat turun sekali sahaja. Selepas ini ebook dibuka terus dari peranti anda.</p>
            </>
          ) : (
            <p class="tiny muted" style="margin-top:8px"><i class="ph-bold ph-spinner spin" aria-hidden="true" /> Sila tunggu…</p>
          )}
        </section>
      )}
    </Layout>
  );
}

type ReadyProps = {
  id: string;
  e: CatalogEbook | null;
  title: string;
  doc: PdfDoc;
  buf: ArrayBuffer;
  sizes: Size[];
  allowDownload: boolean;
  startPage: number;
  finishedInit: boolean;
  wm: string;
};

function ReadyView(p: ReadyProps) {
  const n = p.doc.numPages;
  const start = Math.min(Math.max(1, p.startPage || 1), n);
  const [page, setPage] = useState(start);
  const [zoom, setZoom] = useState(0);
  const [finished, setFinished] = useState(p.finishedInit);
  const [busy, setBusy] = useState(false);
  const pages = useRef<(HTMLDivElement | null)[]>([]);
  const pageRef = useRef(start);
  const lastSaved = useRef(start);

  const saver = useMemo(
    () =>
      createDebouncer((pg: number) => {
        if (pg === lastSaved.current) return;
        lastSaved.current = pg;
        noteProgress(p.id, pg, false);
        api('PUT', progressPath(p.id), { last_page: pg, finished: false }).catch(() => undefined);
      }, SAVE_MS),
    [p.id],
  );

  const scrollToPage = (i: number, smooth = false) => {
    const el = pages.current[i - 1];
    if (!el) return;
    const head = (document.querySelector('.reader-top') as HTMLElement | null)?.offsetHeight ?? 0;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - head - 8, behavior: smooth ? 'smooth' : 'auto' });
  };

  // resume at last_page; re-anchor the current page after a zoom change
  useLayoutEffect(() => scrollToPage(pageRef.current), [zoom]);

  // current page from scroll position -> header + debounced save
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.innerHeight * 0.35;
        let cur = 1;
        pages.current.forEach((el, i) => {
          if (el && el.getBoundingClientRect().top <= y) cur = i + 1;
        });
        pageRef.current = cur;
        setPage(cur);
        saver.call(cur);
      });
    };
    const onHide = () => {
      if (document.visibilityState === 'hidden') saver.flush();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', saver.flush);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', saver.flush);
      saver.flush();
    };
  }, [saver]);

  // lazy rendering: canvases near the viewport are rendered (watermark drawn into them), far ones released
  useEffect(() => {
    type St = { task?: { cancel(): void; promise: Promise<unknown> }; done: boolean };
    const state = new Map<number, St>();
    let live = true;
    const canvasOf = (i: number) => pages.current[i - 1]?.querySelector('canvas') ?? null;

    const render = async (i: number) => {
      const el = pages.current[i - 1];
      if (!el || state.has(i)) return;
      const st: St = { done: false };
      state.set(i, st);
      try {
        const pg = await p.doc.getPage(i);
        if (!live || state.get(i) !== st) return;
        const base = pg.getViewport({ scale: 1 });
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const scale = Math.min((el.clientWidth * dpr) / base.width, 2400 / base.width);
        const vp = pg.getViewport({ scale });
        // render + watermark off-screen, then copy: the visible canvas never shows an unwatermarked page
        const off = document.createElement('canvas');
        off.width = Math.floor(vp.width);
        off.height = Math.floor(vp.height);
        const octx = off.getContext('2d');
        if (!octx) return;
        st.task = pg.render({ canvasContext: octx, viewport: vp });
        await st.task.promise;
        st.task = undefined;
        const c = canvasOf(i);
        if (!live || state.get(i) !== st || !c) {
          off.width = 0;
          return;
        }
        drawWatermark(octx, off.width, off.height, p.wm);
        c.width = off.width;
        c.height = off.height;
        c.getContext('2d')?.drawImage(off, 0, 0);
        off.width = 0;
        st.done = true;
      } catch {
        if (state.get(i) === st) state.delete(i); // cancelled / failed: retried when it re-enters the viewport
      }
    };
    const release = (i: number) => {
      const st = state.get(i);
      if (!st) return;
      st.task?.cancel();
      state.delete(i);
      const c = canvasOf(i);
      if (c) {
        c.width = 0;
        c.height = 0;
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          const i = Number((en.target as HTMLElement).dataset.page);
          if (en.isIntersecting) void render(i);
          else release(i);
        }
      },
      { rootMargin: '150% 0px' },
    );
    pages.current.forEach((el) => el && io.observe(el));
    return () => {
      live = false;
      io.disconnect();
      [...state.keys()].forEach(release);
    };
  }, [p.doc, zoom, p.wm]);

  const go = (i: number) => {
    const t = Math.min(Math.max(1, i), n);
    pageRef.current = t;
    scrollToPage(t, true);
  };

  const finish = async () => {
    saver.cancel();
    setBusy(true);
    try {
      await api('PUT', progressPath(p.id), { last_page: pageRef.current, finished: true });
      lastSaved.current = pageRef.current;
      noteProgress(p.id, pageRef.current, true);
      setFinished(true);
      toast('Tahniah! Ebook ditandakan selesai dibaca.', 'green');
    } catch (err) {
      toast(bm(err), 'red');
    } finally {
      setBusy(false);
    }
  };

  const download = () => {
    const url = URL.createObjectURL(new Blob([p.buf], { type: 'application/pdf' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = ebookFilename(p.e ?? { number: null, sort: 0, title: 'ebook' });
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
  };

  const ctl = (label: string, icon: string, fn: () => void, disabled = false) => (
    <a href="#" role="button" aria-label={label} aria-disabled={disabled ? 'true' : undefined}
      style={disabled ? 'opacity:.4;pointer-events:none' : undefined}
      onClick={(ev) => {
        ev.preventDefault();
        fn();
      }}>
      <i class={icon} aria-hidden="true" />
    </a>
  );

  const z = ZOOMS[zoom];
  return (
    <div class="reader">
      <header class="reader-top">
        <div class="in">
          <a class="back" href="#/ebook" aria-label="Kembali"><i class="ph-bold ph-caret-left" aria-hidden="true" /></a>
          <div><b>{p.title}</b><span class="tiny muted">Hal. {page} / {n}</span></div>
        </div>
        <div class="bar"><span style={`width:${Math.round((page / n) * 100)}%`} /></div>
      </header>

      <div style="overflow-x:auto" onContextMenu={(ev) => ev.preventDefault()}>
        {p.sizes.map((sz, i) => (
          <div key={i} class="a4" data-page={i + 1} ref={(el) => { pages.current[i] = el; }}
            style={`padding:0;aspect-ratio:${sz.w}/${sz.h};width:calc((100% - 24px) * ${z})`}>
            <canvas aria-label={`Halaman ${i + 1}`} role="img"
              style="display:block;width:100%;height:100%;-webkit-touch-callout:none;user-select:none;-webkit-user-select:none" />
          </div>
        ))}
      </div>

      {p.allowDownload ? (
        <div style="padding:4px 12px 0">
          <Button variant="ghost" block sm icon="ph-bold ph-download-simple" onClick={download}>Muat turun PDF</Button>
        </div>
      ) : (
        <p class="tiny muted" style="text-align:center;padding:0 16px">
          <i class="ph ph-prohibit" aria-hidden="true" /> Muat turun tidak dibenarkan untuk ebook ini
        </p>
      )}

      <div class="reader-bar">
        <div class="ctl">
          {ctl('Halaman sebelum', 'ph-bold ph-caret-left', () => go(pageRef.current - 1), page <= 1)}
          {ctl('Halaman seterusnya', 'ph-bold ph-caret-right', () => go(pageRef.current + 1), page >= n)}
          {ctl('Zum keluar', 'ph-bold ph-minus', () => setZoom((v) => Math.max(0, v - 1)), zoom === 0)}
          {ctl('Zum masuk', 'ph-bold ph-plus', () => setZoom((v) => Math.min(ZOOMS.length - 1, v + 1)), zoom === ZOOMS.length - 1)}
        </div>
        {finished ? (
          <Button variant="green-o" block sm icon="ph-fill ph-check-circle" disabled>Selesai dibaca</Button>
        ) : (
          <Button variant="outline" block sm icon="ph-bold ph-check-circle" loading={busy} onClick={() => void finish()}>
            Tandakan selesai dibaca
          </Button>
        )}
      </div>
    </div>
  );
}
