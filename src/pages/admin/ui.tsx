// Admin shell (mockup admin-*.html sidebar; top scroll menu under 1024px) and shared admin widgets:
// in-app confirm dialog, modal, data loader, CSV download, clipboard, status badges.
import type { ComponentChildren } from 'preact';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { api, type Method } from '../../lib/api';
import { toCsv } from '../../lib/csv';
import {
  adminError, isSuperadmin, needsConfirm, sectionHref, visibleSections, type AdminSection,
} from '../../lib/admin';
import { todayMYT, formatDMY } from '../../lib/dates';
import { signOut, useSession } from '../../state/session';
import { toast } from '../../ui/Toast';
import { Button } from '../../ui/Button';
import { Empty } from '../../ui/Empty';

export type Row = Record<string, unknown>;

/** Admin API call; errors become BM text (403: "Tiada kebenaran untuk tindakan ini."). */
export async function adminApi<T>(method: Method, path: string, body?: unknown): Promise<T> {
  return api<T>(method, path, body);
}

export function useLoad<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const seq = useRef(0);
  const reload = useCallback(async () => {
    const my = ++seq.current;
    setLoading(true);
    try {
      const d = await fn();
      if (my === seq.current) {
        setData(d);
        setError(null);
      }
    } catch (e) {
      if (my === seq.current) setError(adminError(e));
    } finally {
      if (my === seq.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(() => {
    void reload();
  }, [reload]);
  return { data, error, loading, reload };
}

/** Runs a mutation with toast feedback; returns the result or null on error. */
export async function act<T>(fn: () => Promise<T>, okText?: string): Promise<T | null> {
  try {
    const r = await fn();
    if (okText) toast(okText, 'green');
    return r;
  } catch (e) {
    toast(adminError(e), 'red', 6000);
    return null;
  }
}

export function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  const blob = new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast('Disalin.', 'green', 2000);
  } catch {
    toast('Tidak dapat menyalin. Salin secara manual.', 'yellow');
  }
}

// ---------------- confirm dialog ----------------
type ConfirmOpts = { title: string; text: ComponentChildren; confirm: string; danger?: boolean };
type Pending = ConfirmOpts & { resolve: (v: boolean) => void };
let pending: Pending | null = null;
const confirmSubs = new Set<(p: Pending | null) => void>();
const emitConfirm = (p: Pending | null) => {
  pending = p;
  confirmSubs.forEach((f) => f(p));
};

export function confirmDialog(o: ConfirmOpts): Promise<boolean> {
  pending?.resolve(false);
  return new Promise((resolve) => emitConfirm({ ...o, resolve }));
}

/** Destructive actions (CONFIRM_ACTIONS) ask in the in-app dialog first; others run straight away. */
export async function confirmed(action: string, o: ConfirmOpts): Promise<boolean> {
  return needsConfirm(action) ? confirmDialog(o) : true;
}

function ConfirmHost() {
  const [p, setP] = useState<Pending | null>(pending);
  useEffect(() => {
    confirmSubs.add(setP);
    return () => {
      confirmSubs.delete(setP);
    };
  }, []);
  if (!p) return null;
  const done = (v: boolean) => {
    emitConfirm(null);
    p.resolve(v);
  };
  return (
    <Modal title={p.title} onClose={() => done(false)} role="alertdialog">
      <div class="small" style="font-size:15px;color:var(--text)">{p.text}</div>
      <div class="row" style="justify-content:flex-end;margin-top:18px;flex-wrap:wrap">
        <Button variant="outline" sm onClick={() => done(false)}>Tidak</Button>
        <Button sm style={p.danger ? 'background:var(--red)' : undefined} onClick={() => done(true)}>{p.confirm}</Button>
      </div>
    </Modal>
  );
}

// ---------------- modal ----------------
export function Modal(p: { title: string; onClose: () => void; children: ComponentChildren; role?: 'dialog' | 'alertdialog'; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const first = ref.current?.querySelector<HTMLElement>('input,select,textarea,button:not(.x)') ?? ref.current;
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') p.onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div class="modal-back" onClick={(e) => { if (e.target === e.currentTarget) p.onClose(); }}>
      <div class={'modal' + (p.wide ? ' wide' : '')} role={p.role ?? 'dialog'} aria-modal="true" aria-label={p.title} ref={ref} tabIndex={-1}>
        <div class="row between" style="margin-bottom:12px">
          <h2 style="font-size:19px">{p.title}</h2>
          <button type="button" class="kebab x" aria-label="Tutup" onClick={p.onClose}><i class="ph ph-x" aria-hidden="true" /></button>
        </div>
        {p.children}
      </div>
    </div>
  );
}

/** Action sheet for a table row (instead of a dropdown that a scrolling table would clip). */
export type RowAction = { label: string; icon: string; danger?: boolean; run: () => void | Promise<void>; hidden?: boolean };
export function ActionsButton(p: { title: string; actions: RowAction[] }) {
  const [open, setOpen] = useState(false);
  const list = p.actions.filter((a) => !a.hidden);
  if (!list.length) return null;
  return (
    <>
      <button type="button" class="kebab" aria-label={`Tindakan: ${p.title}`} onClick={() => setOpen(true)}>
        <i class="ph ph-dots-three-vertical" aria-hidden="true" />
      </button>
      {open ? (
        <Modal title={p.title} onClose={() => setOpen(false)}>
          <div class="sheet">
            {list.map((a) => (
              <button key={a.label} type="button" class={a.danger ? 'danger' : undefined}
                onClick={() => { setOpen(false); void a.run(); }}>
                <i class={`ph ph-${a.icon}`} aria-hidden="true" /> {a.label}
              </button>
            ))}
          </div>
        </Modal>
      ) : null}
    </>
  );
}

// ---------------- badges ----------------
const STATUS_TONE: Record<string, string> = {
  dituntut: 'green', belum_dituntut: 'yellow', perlu_semakan: 'red', dibatalkan: 'grey',
  aktif: 'green', belum_guna: 'grey', akan_datang: 'yellow', berjalan: 'green', tamat: 'grey',
};
export function StatusBadge({ s }: { s: unknown }) {
  const v = String(s ?? '—');
  const tone = v === 'dibatalkan' ? 'red' : STATUS_TONE[v] ?? 'grey';
  return <span class={`badge ${tone}`}>{v}</span>;
}
const PKG_TONE: Record<string, string> = { basic: 'blue', complete: 'navy', upgrade_a_b: 'violet' };
export function PkgBadge({ id, name }: { id: unknown; name?: unknown }) {
  if (!id) return <span class="badge grey">Tiada</span>;
  return <span class={`badge ${PKG_TONE[String(id)] ?? 'blue'}`}>{String(name ?? id)}</span>;
}

export function Loading() {
  return <p class="muted small" style="padding:16px 0"><i class="ph-bold ph-spinner spin" aria-hidden="true" /> Memuatkan…</p>;
}

export function ErrorBox({ text, retry }: { text: string; retry?: () => void }) {
  return (
    <div class="callout red" role="alert">
      <i class="ph-fill ph-warning-circle" aria-hidden="true" />
      <span>{text} {retry ? <button type="button" class="linkbtn" onClick={retry}>Cuba lagi</button> : null}</span>
    </div>
  );
}

export function NoAccess() {
  return (
    <Empty icon="ph-bold ph-lock-simple" tone="yellow" title="Tiada kebenaran"
      text="Bahagian ini untuk superadmin sahaja. Coach boleh melihat Ringkasan dan Peserta.">
      <Button href="#/admin" variant="outline" sm>Ke Ringkasan</Button>
    </Empty>
  );
}

// ---------------- shell ----------------
export function AdminShell(p: { section: AdminSection | null; title: string; head?: ComponentChildren; children: ComponentChildren }) {
  const s = useSession();
  const sa = isSuperadmin(s.roles);
  const side = useRef<HTMLElement>(null);
  // under 1024px the menu is a horizontal scroller: keep the current section visible
  useEffect(() => {
    const el = side.current;
    const on = el?.querySelector<HTMLElement>('a.on');
    if (el && on && el.scrollWidth > el.clientWidth) el.scrollLeft = on.offsetLeft - (el.clientWidth - on.offsetWidth) / 2;
  }, [p.section]);
  return (
    <div class="admin adm">
      <aside class="side" aria-label="Menu admin" ref={side}>
        <span class="wordmark">HDM <b>BOOSTER</b></span>
        <span class="role"><span class="badge navy">{sa ? 'Superadmin' : 'Coach'}</span></span>
        <nav class="side-nav">
          {visibleSections(s.roles).map((x) => {
            const on = x.key === p.section;
            return (
              <a key={x.key} href={sectionHref(x)} class={on ? 'on' : undefined} aria-current={on ? 'page' : undefined}>
                <i class={`ph ph-${x.icon}`} aria-hidden="true" /> {x.label}
              </a>
            );
          })}
        </nav>
        <div class="foot">
          <a href="#/"><i class="ph ph-arrow-u-up-left" aria-hidden="true" /> Kembali ke app</a>
          <a href="#/masuk" onClick={(e) => { e.preventDefault(); void signOut(); }}>
            <i class="ph ph-sign-out" aria-hidden="true" /> Log keluar
          </a>
        </div>
      </aside>
      <main class="main">
        <div class="main-top">
          <div class="head-row"><h1>{p.title}</h1>{p.head}</div>
          <div class="tools"><span class="select"><i class="ph ph-clock" aria-hidden="true" /> {formatDMY(todayMYT())}</span></div>
        </div>
        {p.children}
      </main>
      <ConfirmHost />
    </div>
  );
}

// ---------------- small form bits ----------------
export function Select(p: { id: string; label?: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; sm?: boolean; style?: string; ariaLabel?: string }) {
  const sel = (
    <select id={p.id} class={'input' + (p.sm ? ' sm' : '')} value={p.value} aria-label={p.label ? undefined : p.ariaLabel}
      style={p.style} onChange={(e) => p.onChange((e.currentTarget as HTMLSelectElement).value)}>
      {p.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
  if (!p.label) return sel;
  return <div class="field"><label for={p.id}>{p.label}</label>{sel}</div>;
}

/** Text search that reports after 300 ms of no typing. */
export function SearchBox(p: { placeholder: string; value: string; onSearch: (v: string) => void }) {
  const [v, setV] = useState(p.value);
  useEffect(() => setV(p.value), [p.value]); // value changed from outside (e.g. a #/admin/pembelian?q= link)
  useEffect(() => {
    if (v === p.value) return;
    const t = setTimeout(() => p.onSearch(v), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v]);
  return (
    <label class="search">
      <i class="ph ph-magnifying-glass" aria-hidden="true" />
      <input type="search" value={v} placeholder={p.placeholder} aria-label={p.placeholder}
        onInput={(e) => setV((e.currentTarget as HTMLInputElement).value)} />
    </label>
  );
}

/** Participant picker for assign / transfer: search /api/admin/participants, pick one. */
export function PickParticipant(p: { onPick: (uid: string, label: string) => void }) {
  const [q, setQ] = useState('');
  const { data, loading, error } = useLoad(
    () => (q.trim() ? adminApi<Row[]>('GET', `/api/admin/participants?q=${encodeURIComponent(q.trim())}`) : Promise.resolve([] as Row[])),
    [q],
  );
  return (
    <div>
      <SearchBox placeholder="Cari nama, emel, telefon" value={q} onSearch={setQ} />
      {error ? <ErrorBox text={error} /> : null}
      {q && loading ? <Loading /> : null}
      <div style="margin-top:8px;max-height:280px;overflow:auto">
        {(data ?? []).map((u) => (
          <button key={String(u.id)} type="button" class="pick" onClick={() => p.onPick(String(u.id), `${u.full_name ?? ''} (${u.email ?? ''})`)}>
            <b>{String(u.full_name ?? '—')}</b> <span class="small muted">{String(u.email ?? '')}</span>
          </button>
        ))}
        {q && !loading && data && !data.length ? <p class="small muted">Tiada padanan.</p> : null}
      </div>
    </div>
  );
}

/** Private settings (wa_template_*) come from the content CRUD for app_settings (superadmin). */
export function useSettings(enabled: boolean) {
  const { data } = useLoad(
    () => (enabled ? adminApi<Row[]>('GET', '/api/admin/content/app_settings') : Promise.resolve([] as Row[])),
    [enabled],
  );
  return (key: string): unknown => data?.find((r) => r.key === key)?.value;
}
