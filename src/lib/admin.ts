// Admin menu pure logic (unit-tested): sections + coach permission matrix, confirm-required actions,
// query builders, MYT dates / CSV filenames, CSV row builders and WhatsApp texts. The Worker enforces roles anyway.
import { ApiError, bm } from './errors';
import { fillTemplate } from './wa';

export type AdminSection = 'ringkasan' | 'pembelian' | 'kod' | 'peserta' | 'bcl' | 'kandungan' | 'export' | 'audit';
export type SectionDef = { key: AdminSection; path: string; label: string; icon: string; coach: boolean };

/** Sidebar order. `coach: true` = a coach may open it (read-only). */
export const SECTIONS: SectionDef[] = [
  { key: 'ringkasan', path: '', label: 'Ringkasan', icon: 'squares-four', coach: true },
  { key: 'pembelian', path: 'pembelian', label: 'Pembelian', icon: 'receipt', coach: false },
  { key: 'kod', path: 'kod', label: 'Kod Akses', icon: 'key', coach: false },
  { key: 'peserta', path: 'peserta', label: 'Peserta', icon: 'users-three', coach: true },
  { key: 'bcl', path: 'bcl', label: 'Pemetaan BCL', icon: 'plugs-connected', coach: false },
  { key: 'kandungan', path: 'kandungan', label: 'Kandungan', icon: 'books', coach: false },
  { key: 'export', path: 'export', label: 'Export', icon: 'download-simple', coach: false },
  { key: 'audit', path: 'audit', label: 'Audit', icon: 'clipboard-text', coach: false },
];

export const isSuperadmin = (roles: readonly string[]) => roles.includes('superadmin');
export const isCoach = (roles: readonly string[]) => roles.includes('coach');

export function canView(section: AdminSection, roles: readonly string[]): boolean {
  if (isSuperadmin(roles)) return true;
  return isCoach(roles) && !!SECTIONS.find((s) => s.key === section)?.coach;
}

/** Grant / revoke / reset / every write: superadmin only. */
export const canMutate = (roles: readonly string[]) => isSuperadmin(roles);

export const visibleSections = (roles: readonly string[]) => SECTIONS.filter((s) => canView(s.key, roles));

export const sectionHref = (s: SectionDef) => (s.path ? `#/admin/${s.path}` : '#/admin');

/** `route.params.rest` of #/admin/<rest> to a section (+ participant uid for #/admin/peserta/:uid). */
export function parseAdminPath(rest: string | undefined): { section: AdminSection | null; uid?: string } {
  const parts = (rest ?? '').split('/').filter(Boolean);
  if (!parts.length) return { section: 'ringkasan' };
  const s = SECTIONS.find((x) => x.path && x.path === parts[0]);
  if (!s) return { section: null };
  if (parts.length === 1) return { section: s.key };
  if (s.key === 'peserta' && parts.length === 2) return { section: 'peserta', uid: parts[1] };
  return { section: null };
}

/** Destructive actions: always go through the in-app confirm dialog. */
export const CONFIRM_ACTIONS: ReadonlySet<string> = new Set([
  'purchase.cancel', 'code.cancel', 'code.release', 'grant.revoke', 'participant.reset_password', 'bcl_map.delete',
  'content.delete',
]);
export const needsConfirm = (action: string) => CONFIRM_ACTIONS.has(action);

/** `?a=1&b=2` from non-empty (trimmed) values, in key order; '' when nothing is set. */
export function buildQuery(f: Record<string, string | number | null | undefined>): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(f)) {
    if (v == null) continue;
    const s = String(v).trim();
    if (s) parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(s)}`);
  }
  return parts.length ? '?' + parts.join('&') : '';
}

// ---------------- dates (Asia/Kuala_Lumpur, UTC+8, no DST) ----------------
const MYT_MS = 8 * 60 * 60 * 1000;
const myt = (ms: number) => new Date(ms + MYT_MS).toISOString(); // "YYYY-MM-DDTHH:MM..." in MYT

function parts(iso: string | null | undefined): string | null {
  if (!iso) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso + 'T00:00';
  const t = Date.parse(iso);
  return Number.isNaN(t) ? null : myt(t);
}

/** DD/MM/YYYY in MYT; a plain YYYY-MM-DD date is shown as-is. */
export function dateMYT(iso: string | null | undefined): string {
  const p = parts(iso);
  return p ? `${p.slice(8, 10)}/${p.slice(5, 7)}/${p.slice(0, 4)}` : '—';
}

/** DD/MM/YYYY HH:MM in MYT. */
export function dateTimeMYT(iso: string | null | undefined): string {
  const p = parts(iso);
  return p ? `${p.slice(8, 10)}/${p.slice(5, 7)}/${p.slice(0, 4)} ${p.slice(11, 16)}` : '—';
}

/** DDMMYYYY (MYT) for filenames. */
export function dmyMYT(now: Date = new Date()): string {
  const p = myt(now.getTime());
  return p.slice(8, 10) + p.slice(5, 7) + p.slice(0, 4);
}

/** ISO timestamp to an <input type="datetime-local"> value in MYT. */
export function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return '';
  const t = Date.parse(iso);
  return Number.isNaN(t) ? '' : myt(t).slice(0, 16);
}

/** <input type="datetime-local"> value (read as MYT) to an ISO string with +08:00, or null. */
export function fromLocalInput(v: string): string | null {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v) ? `${v}:00+08:00` : null;
}

export function slugLabel(label: string | null | undefined): string {
  const s = String(label ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return s.slice(0, 40) || 'kod';
}

export const codesFilename = (label: string | null | undefined, now: Date = new Date()) =>
  `kod-${slugLabel(label)}-${dmyMYT(now)}.csv`;

export function exportFilename(kind: 'peserta' | 'pembelian' | 'kod', now: Date = new Date()): string {
  return `${kind === 'kod' ? 'kod-semua' : kind}-${dmyMYT(now)}.csv`;
}

// ---------------- CSV rows ----------------
type Row = Record<string, unknown>;
const t = (v: unknown) => (v == null ? '' : String(v));

/** Generated codes: exactly `kod, pakej, batch`. */
export function codesCsvRows(codes: Row[]) {
  return codes.map((c) => ({ kod: t(c.code), pakej: t(c.package_name ?? c.package_id), batch: t(c.batch_label) }));
}

export function codesExportRows(codes: Row[]) {
  return codes.map((c) => ({
    kod: t(c.code),
    pakej: t(c.package_name ?? c.package_id),
    batch: t(c.batch_label),
    status: t(c.status),
    ditebus_oleh: t(c.redeemed_by),
    tarikh_tebus: c.redeemed_at ? dateTimeMYT(c.redeemed_at as string) : '',
    tamat: c.access_ends_at ? dateMYT(c.access_ends_at as string) : '',
    pembeli: t(c.buyer_name),
    dijana: c.created_at ? dateTimeMYT(c.created_at as string) : '',
  }));
}

export function participantsCsvRows(list: Row[]) {
  return list.map((p) => ({
    nama: t(p.full_name),
    emel: t(p.email),
    telefon: t(p.phone),
    onboarding: p.onboarded_at ? 'selesai' : 'belum',
    daftar: p.created_at ? dateTimeMYT(p.created_at as string) : '',
    hak_akses: Array.isArray(p.entitlements) ? (p.entitlements as string[]).join(' ') : '',
    uid: t(p.id),
  }));
}

export function purchasesCsvRows(list: Row[]) {
  return list.map((p) => ({
    order_ref: t(p.order_ref),
    nama: t(p.buyer_name),
    emel: t(p.email),
    telefon: t(p.phone),
    pakej: t(p.package_name ?? p.package_id),
    jumlah_rm: p.amount_rm ?? '',
    tarikh_bayar: p.paid_at ? dateTimeMYT(p.paid_at as string) : '',
    status: t(p.status),
    sebab_semakan: t(p.review_reason),
    sumber: t(p.source),
  }));
}

// ---------------- WhatsApp ----------------
/** App base URL (no hash / query): explicit config wins, else origin + pathname. */
export function appUrl(loc: { origin: string; pathname: string }, configured?: string | null): string {
  if (configured && configured.trim()) return configured.trim();
  return loc.origin + loc.pathname;
}

const CODE_TPL = 'Salam {nama}, ini kod akses HDM BOOSTER anda: {kod}. Aktifkan di {pautan}.';
const PURCHASE_TPL =
  'Salam {nama}, terima kasih atas pembelian HDM BOOSTER. Daftar akaun di {pautan} guna emel dan nombor telefon yang sama semasa pembelian.';

const tplOr = (tpl: unknown, fallback: string) => (typeof tpl === 'string' && tpl.trim() ? tpl : fallback);

/** `wa_template_code` with {nama, kod, pautan = app#/aktif}. */
export function codeWaText(tpl: unknown, v: { nama: string | null | undefined; kod: string }, base: string): string {
  return fillTemplate(tplOr(tpl, CODE_TPL), { nama: (v.nama ?? '').trim(), kod: v.kod, pautan: `${base}#/aktif` });
}

/** `wa_template_purchase` with {nama, pautan = app#/daftar}. */
export function purchaseWaText(tpl: unknown, nama: string | null | undefined, base: string): string {
  return fillTemplate(tplOr(tpl, PURCHASE_TPL), { nama: (nama ?? '').trim(), pautan: `${base}#/daftar` });
}

// ---------------- errors ----------------
export const NO_PERMISSION = 'Tiada kebenaran untuk tindakan ini.';

/** Worker BM message; any 403 reads "Tiada kebenaran untuk tindakan ini." */
export function adminError(e: unknown): string {
  if (e instanceof ApiError && e.status === 403) return NO_PERMISSION;
  return bm(e);
}
