// DEV MOCK ONLY: /api/admin/* with the Worker's role gate (coach = GET summary/participants only), reasons and
// BM messages. Purchases, grants, BCL map, content tables and audit live here (localStorage); accounts and access
// codes are shared with src/mock/db.ts so a cancelled code / reset password affects the participant screens.
import { ApiError } from '../lib/errors';
import { db } from './db';
import { batch, catalog, GROUPS, packages, type MockAccount, type MockCode } from './fixtures';

const fail = (status: number, reason: string, message: string): never => {
  throw new ApiError(reason, message, status);
};
const NO = () => fail(403, 'tiada_kebenaran', 'Anda tidak mempunyai kebenaran untuk tindakan ini.');
const NOT_FOUND = () => fail(404, 'tiada', 'Halaman atau tindakan tidak dijumpai.');

type Row = Record<string, unknown>;
type State = {
  purchases: Row[];
  grants: Row[];
  bcl_map: Row[];
  tables: Record<string, Row[]>;
  audit: Row[];
  seq: number;
  /** entitlements a fixture account has outside purchases / codes / grants (first seen) */
  base: Record<string, string[]>;
};

const K = 'hdm_mock_admin_v1';
const uuid = (n: number) => `00000000-0000-4000-9000-${String(n).padStart(12, '0')}`;
const iso = (s: string) => new Date(s).toISOString();

const PRIVATE_SETTINGS: Row[] = [
  { key: 'wa_template_purchase', public: false, value:
    'Salam {nama}, terima kasih atas pembelian HDM BOOSTER. Daftar akaun di {pautan} guna emel dan nombor telefon yang sama semasa pembelian.' },
  { key: 'wa_template_code', public: false, value: 'Salam {nama}, ini kod akses HDM BOOSTER anda: {kod}. Aktifkan di {pautan}.' },
];

function seed(): State {
  const P = (n: number, o: Row): Row => ({
    id: uuid(100 + n), batch_id: batch.id, entitlements: packages.find((k) => k.id === o.package_id)?.items ?? [],
    source: 'bcl', review_reason: null, claimed_by: null, claimed_at: null, created_at: o.paid_at, ...o,
  });
  return {
    seq: 1000,
    base: { 'mock-ali': [], 'mock-coach': [] },
    purchases: [
      P(1, { order_ref: 'BCL-10293', package_id: 'basic', buyer_name: 'Ali Bin Abu', email: 'ali@gmail.com', phone: '60123456789',
        amount_rm: 100, paid_at: iso('2026-11-12T02:00:00Z'), status: 'dituntut', claimed_by: 'mock-ali', claimed_at: iso('2026-11-13T02:00:00Z') }),
      P(2, { order_ref: 'BCL-10398', package_id: 'basic', buyer_name: 'Siti Aminah', email: 'siti@gmail.com', phone: '60123456789',
        amount_rm: 100, paid_at: iso('2026-11-13T04:10:00Z'), status: 'belum_dituntut' }),
      P(3, { order_ref: 'BCL-10411', package_id: null, entitlements: [], buyer_name: 'Mohd Faiz', email: 'faiz.hamid@gmail.com',
        phone: '60182297765', amount_rm: 147, paid_at: iso('2026-11-14T00:15:00Z'), status: 'perlu_semakan',
        review_reason: 'Jumlah RM147 tiada padanan pakej' }),
      P(4, { order_ref: 'BCL-10422', package_id: 'complete', buyer_name: 'Nurul Huda', email: 'huda.nur@gmail.com', phone: '0123',
        amount_rm: 150, paid_at: iso('2026-11-14T01:42:00Z'), status: 'perlu_semakan', review_reason: 'Telefon tidak sah: "0123"' }),
      P(5, { order_ref: 'BCL-10426', package_id: 'complete', buyer_name: 'Farah Nabilah', email: 'farahn@gmail.com', phone: '60143326618',
        amount_rm: 150, paid_at: iso('2026-11-14T03:00:00Z'), status: 'dibatalkan' }),
    ],
    grants: [
      { id: uuid(201), user_id: 'mock-ahmad', item_key: 'tdee', granted_by: 'mock-admin', reason: 'Ganti sesi terlepas',
        revoked_at: iso('2026-11-13T05:00:00Z'), created_at: iso('2026-11-12T05:00:00Z') },
    ],
    bcl_map: [
      { id: uuid(301), formable_id: 'frm_hdmb_a', amount_rm: 100, field_value: null, package_id: 'basic', active: true },
      { id: uuid(302), formable_id: 'frm_hdmb_b', amount_rm: 150, field_value: null, package_id: 'complete', active: true },
      { id: uuid(303), formable_id: 'frm_hdmb_up', amount_rm: 50, field_value: null, package_id: 'upgrade_a_b', active: true },
    ],
    tables: {
      batches: [{ ...batch, phases: batch.phases.map((p) => ({ ...p })) }],
      ebooks: catalog.ebooks.map((e, i) => ({ ...e, file_drive_id: i < 4 ? `1MockDriveFile${i + 1}xyz` : null })),
      groups: GROUPS.map((g) => ({ id: g.id, item_key: g.item_key, batch_id: null, name: g.name, coach: g.coach,
        description: g.description, invite_url: g.invite_url })),
      packages: packages.map(({ items: _i, ...k }) => ({ ...k })),
      package_items: packages.flatMap((k) => k.items.map((item_key) => ({ package_id: k.id, item_key }))),
      items: catalog.items.map((i) => ({ ...i, active: true })),
      app_settings: [
        ...Object.entries(catalog.settings).map(([key, value]) => ({ key, value, public: true })),
        ...PRIVATE_SETTINGS,
      ],
    },
    audit: [
      { id: 1, actor: 'mock-admin', action: 'grant.create', target_type: 'manual_grant', target_id: uuid(201),
        detail: { user_id: 'mock-ahmad', item_key: 'tdee', reason: 'Ganti sesi terlepas' }, at: iso('2026-11-12T05:00:00Z') },
      { id: 2, actor: 'mock-admin', action: 'grant.revoke', target_type: 'manual_grant', target_id: uuid(201),
        detail: { user_id: 'mock-ahmad', item_key: 'tdee' }, at: iso('2026-11-13T05:00:00Z') },
    ],
  };
}

let st: State = (() => {
  try {
    const v = localStorage.getItem(K);
    if (v) return JSON.parse(v) as State;
  } catch {
    /* ignore */
  }
  return seed();
})();
const save = () => {
  try {
    localStorage.setItem(K, JSON.stringify(st));
  } catch {
    /* private mode */
  }
};

/** Pk spec per CRUD table (mirrors worker/src/crud.ts). */
const PK: Record<string, string[]> = {
  batches: ['id'], ebooks: ['id'], groups: ['id'], packages: ['id'], package_items: ['package_id', 'item_key'],
  items: ['key'], app_settings: ['key'], bcl_map: ['id'],
};
const COLS: Record<string, string[]> = {
  batches: ['name', 'sales_open_at', 'sales_close_at', 'program_start', 'program_end', 'phases', 'status'],
  ebooks: ['item_key', 'number', 'title', 'description', 'cover_url', 'file_drive_id', 'allow_download', 'file_updated_at', 'sort'],
  groups: ['item_key', 'batch_id', 'name', 'coach', 'description', 'invite_url'],
  packages: ['id', 'name', 'price_rm', 'sellable'],
  package_items: ['package_id', 'item_key'],
  items: ['key', 'name', 'kind', 'sort', 'active'],
  app_settings: ['key', 'value', 'public'],
  bcl_map: ['formable_id', 'amount_rm', 'field_value', 'package_id', 'active'],
};

function audit(actor: string, action: string, target_type: string, target_id: string, detail: Row) {
  st.audit.unshift({ id: ++st.seq, actor, action, target_type, target_id, detail, at: new Date().toISOString() });
}

const pkgName = (id: unknown) => packages.find((k) => k.id === id)?.name ?? null;
const itemsOf = (pkg: unknown) => packages.find((k) => k.id === pkg)?.items ?? [];

/** Mock entitlements_for(uid): claimed purchases + active codes + live grants (+ fixture base for seeded users). */
function recompute(uid: string) {
  const a = db.accounts().find((x) => x.uid === uid);
  if (!a) return;
  st.base[uid] ??= a.entitlements.filter((k) => !st.grants.some((g) => g.user_id === uid && g.item_key === k));
  const keys = new Set<string>(st.base[uid]);
  for (const p of st.purchases) if (p.claimed_by === uid && p.status === 'dituntut') (p.entitlements as string[]).forEach((k) => keys.add(k));
  for (const c of db.codes()) if (c.redeemed_by === uid && c.status === 'aktif') (c.entitlements ?? itemsOf(c.package_id)).forEach((k) => keys.add(k));
  for (const g of st.grants) if (g.user_id === uid && !g.revoked_at) keys.add(g.item_key as string);
  db.update(uid, { entitlements: [...keys].sort() });
}

function profileRow(a: MockAccount): Row {
  return { id: a.uid, full_name: a.full_name, email: a.email, phone: a.phone, onboarded_at: a.onboarded_at,
    created_at: '2026-11-13T02:00:00.000Z', ...(a.profile ?? {}) };
}

function codeRow(c: MockCode): Row {
  return {
    id: c.id ?? `code-${c.code}`, code: c.code, package_id: c.package_id, package_name: pkgName(c.package_id),
    entitlements: c.entitlements ?? itemsOf(c.package_id), batch_id: c.batch_id ?? null, batch_label: c.batch_label ?? null,
    status: c.status === 'baru' ? 'belum_guna' : c.status, redeemed_by: c.redeemed_by ?? null, redeemed_at: c.redeemed_at ?? null,
    access_starts_at: c.redeemed_at ?? null, access_ends_at: c.access_ends_at ?? null, buyer_name: c.buyer_name ?? null,
    buyer_phone: c.buyer_phone ?? null, buyer_email: c.buyer_email ?? null, order_ref: c.order_ref ?? null, note: null,
    created_by: c.created_by ?? null, created_at: c.created_at ?? '2026-11-01T02:00:00.000Z',
  };
}

const like = (q: string | undefined, ...vals: unknown[]) =>
  !q || vals.some((v) => typeof v === 'string' && v.toLowerCase().includes(q.toLowerCase()));

const COACH_ROUTES = [/^\/api\/admin\/summary$/, /^\/api\/admin\/participants$/, /^\/api\/admin\/participants\/[^/]+$/];

export function adminMock<T>(method: string, fullPath: string, body: unknown, me: MockAccount): T {
  const [path, qs] = fullPath.split('?');
  const query = Object.fromEntries(new URLSearchParams(qs ?? ''));
  const sa = me.roles.includes('superadmin');
  const coachOk = me.roles.includes('coach') && method === 'GET' && COACH_ROUTES.some((re) => re.test(path));
  if (!sa && !coachOk) NO();
  const b = (body && typeof body === 'object' ? body : {}) as Row;
  const out = <R>(v: R) => {
    save();
    return v as unknown as T;
  };
  const m = (re: RegExp) => re.exec(path);
  let x: RegExpExecArray | null;

  if (method === 'GET' && path === '/api/admin/summary') {
    const count = (rows: Row[]) => rows.reduce<Record<string, number>>((a, r) => ({ ...a, [r.status as string]: (a[r.status as string] ?? 0) + 1 }), {});
    return out({
      participants: db.accounts().length,
      onboarded: db.accounts().filter((a) => a.onboarded_at).length,
      purchases: count(st.purchases),
      codes: count(db.codes().map(codeRow)),
      perlu_semakan: st.purchases.filter((p) => p.status === 'perlu_semakan').length,
    });
  }
  if (method === 'GET' && path === '/api/admin/participants') {
    for (const a of db.accounts()) recompute(a.uid);
    return out(db.accounts().filter((a) => like(query.q, a.full_name, a.email, a.phone))
      .map((a) => ({ id: a.uid, full_name: a.full_name, email: a.email, phone: a.phone, onboarded_at: a.onboarded_at,
        created_at: '2026-11-13T02:00:00.000Z', entitlements: a.entitlements })));
  }
  if (method === 'GET' && (x = m(/^\/api\/admin\/participants\/([^/]+)$/))) {
    recompute(x[1]);
    const a = db.accounts().find((y) => y.uid === x![1]);
    if (!a) fail(404, 'pengguna_tidak_wujud', 'Peserta tidak dijumpai.');
    return out({
      profile: profileRow(a!), roles: a!.roles, entitlements: a!.entitlements,
      purchases: st.purchases.filter((p) => p.claimed_by === a!.uid),
      codes: db.codes().filter((c) => c.redeemed_by === a!.uid).map(codeRow),
      grants: st.grants.filter((g) => g.user_id === a!.uid).sort((p, q) => String(q.created_at).localeCompare(String(p.created_at))),
    });
  }
  if (!sa) NO();

  // ---------------- participants ----------------
  if (method === 'POST' && (x = m(/^\/api\/admin\/participants\/([^/]+)\/grant$/))) {
    if (!db.accounts().some((a) => a.uid === x![1])) fail(404, 'pengguna_tidak_wujud', 'Peserta tidak dijumpai.');
    if (!catalog.items.some((i) => i.key === b.item_key)) fail(400, 'item_tidak_sah', 'Item tidak sah.');
    const g = { id: uuid(++st.seq), user_id: x[1], item_key: b.item_key, granted_by: me.uid, reason: b.reason || null,
      revoked_at: null, created_at: new Date().toISOString() };
    st.grants.push(g);
    recompute(x[1]);
    audit(me.uid, 'grant.create', 'manual_grant', g.id, { user_id: x[1], item_key: b.item_key, reason: g.reason });
    return out(g);
  }
  if (method === 'POST' && (x = m(/^\/api\/admin\/grants\/([^/]+)\/revoke$/))) {
    const g = st.grants.find((y) => y.id === x![1]);
    if (!g) fail(404, 'geran_tidak_wujud', 'Akses manual tidak dijumpai.');
    if (g!.revoked_at) fail(400, 'geran_sudah_ditarik', 'Akses manual ini sudah ditarik balik.');
    g!.revoked_at = new Date().toISOString();
    recompute(g!.user_id as string);
    audit(me.uid, 'grant.revoke', 'manual_grant', x[1], { user_id: g!.user_id, item_key: g!.item_key });
    return out(g);
  }
  if (method === 'POST' && (x = m(/^\/api\/admin\/participants\/([^/]+)\/reset-password$/))) {
    if (!db.accounts().some((a) => a.uid === x![1])) fail(404, 'pengguna_tidak_wujud', 'Peserta tidak dijumpai.');
    const pw = 'Kp' + Math.random().toString(36).slice(2, 10);
    db.update(x[1], { password: pw });
    audit(me.uid, 'participant.reset_password', 'profile', x[1], {});
    return out({ password: pw });
  }

  // ---------------- purchases ----------------
  if (method === 'GET' && path === '/api/admin/purchases') {
    return out(st.purchases
      .filter((p) => (!query.status || p.status === query.status) && (!query.batch_id || p.batch_id === query.batch_id)
        && like(query.q, p.order_ref, p.buyer_name, p.email, p.phone))
      .map((p): Row => ({ ...p, package_name: pkgName(p.package_id) }))
      .sort((p, q) => String(q.created_at).localeCompare(String(p.created_at))));
  }
  if (method === 'POST' && (x = m(/^\/api\/admin\/purchases\/([^/]+)\/(action|reprocess|resend-welcome)$/))) {
    const p = st.purchases.find((y) => y.id === x![1]);
    if (!p) fail(404, 'pembelian_tidak_wujud', 'Pembelian tidak dijumpai.');
    const pu = p!;
    if (x[2] === 'reprocess') {
      const okNow = pu.status === 'perlu_semakan' && !!pu.package_id && /^601\d{8,9}$/.test(String(pu.phone));
      if (okNow) Object.assign(pu, { status: 'belum_dituntut', review_reason: null });
      audit(me.uid, 'purchase.reprocess', 'purchase', pu.id as string, { order_ref: pu.order_ref, gas_ok: okNow });
      return out(okNow ? { ok: true, result: 'diproses' } : { ok: false, result: null, reason: pu.review_reason ?? 'tiada_perubahan' });
    }
    if (x[2] === 'resend-welcome') {
      if (!pu.email) fail(404, 'pembelian_tidak_wujud', 'Pembelian tidak dijumpai.');
      audit(me.uid, 'purchase.resend_welcome', 'purchase', pu.id as string, { order_ref: pu.order_ref });
      return out({ id: uuid(++st.seq), to_email: pu.email });
    }
    const action = b.action;
    const payload = (b.payload ?? {}) as Row;
    if (action === 'assign') {
      if (!db.accounts().some((a) => a.uid === payload.user_id)) fail(400, 'pengguna_tidak_wujud', 'Peserta tidak dijumpai.');
      Object.assign(pu, { claimed_by: payload.user_id, claimed_at: new Date().toISOString(), status: 'dituntut', review_reason: null });
    } else if (action === 'set_package') {
      if (!packages.some((k) => k.id === payload.package_id)) fail(400, 'pakej_tidak_wujud', 'Pakej tidak dijumpai.');
      Object.assign(pu, { package_id: payload.package_id, entitlements: itemsOf(payload.package_id) });
    } else if (action === 'cancel') {
      pu.status = 'dibatalkan';
    } else if (action === 'restore') {
      pu.status = pu.claimed_by ? 'dituntut' : 'belum_dituntut';
    } else {
      fail(400, 'tindakan_tidak_sah', 'Tindakan tidak sah.');
    }
    if (pu.claimed_by) recompute(pu.claimed_by as string);
    audit(me.uid, `purchase.${action}`, 'purchase', pu.id as string, { payload, order_ref: pu.order_ref });
    return out(pu);
  }

  // ---------------- codes ----------------
  if (method === 'POST' && path === '/api/admin/codes/generate') {
    const count = b.count;
    if (typeof count !== 'number' || !Number.isInteger(count)) fail(400, 'data_tidak_sah', 'Maklumat tidak lengkap atau tidak sah.');
    if ((count as number) < 1 || (count as number) > 500) fail(400, 'bilangan_tidak_sah', 'Bilangan kod mesti antara 1 dan 500.');
    if (!packages.some((k) => k.id === b.package_id)) fail(400, 'pakej_tidak_wujud', 'Pakej tidak dijumpai.');
    const buyer = (b.buyer ?? null) as Row | null;
    const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const four = () => Array.from({ length: 4 }, () => A[Math.floor(Math.random() * A.length)]).join('');
    const now = new Date().toISOString();
    const list: MockCode[] = Array.from({ length: count as number }, () => ({
      id: uuid(++st.seq), code: `HDMB-${four()}-${four()}`, package_id: b.package_id as string, status: 'baru' as const,
      batch_id: (b.batch_id as string) || null, batch_label: (b.label as string) || null,
      access_ends_at: (b.access_ends_at as string) || null, buyer_name: (buyer?.name as string) ?? null,
      buyer_phone: (buyer?.phone as string) ?? null, buyer_email: (buyer?.email as string) ?? null,
      order_ref: (buyer?.order_ref as string) ?? null, created_by: me.uid, created_at: now,
    }));
    db.addCodes(list);
    audit(me.uid, 'code.generate', 'access_code_batch', (b.batch_id as string) || (b.label as string) || '',
      { package_id: b.package_id, count, label: b.label ?? null, access_ends_at: b.access_ends_at ?? null });
    return out(list.map(codeRow));
  }
  if (method === 'GET' && path === '/api/admin/codes') {
    return out(db.codes().map(codeRow)
      .filter((c) => (!query.status || c.status === query.status) && (!query.batch_id || c.batch_id === query.batch_id)
        && like(query.q, c.code, c.buyer_name, c.buyer_email, c.batch_label, c.redeemed_by))
      .sort((p, q) => String(q.created_at).localeCompare(String(p.created_at))));
  }
  if (method === 'POST' && (x = m(/^\/api\/admin\/codes\/([^/]+)\/action$/))) {
    const c = db.codes().find((y) => codeRow(y).id === x![1]);
    if (!c) fail(404, 'kod_tidak_wujud', 'Kod tidak dijumpai.');
    const payload = (b.payload ?? {}) as Row;
    const prev = c!.redeemed_by;
    let patch: Partial<MockCode>;
    switch (b.action) {
      case 'cancel': patch = { status: 'dibatalkan' }; break;
      case 'reactivate': patch = { status: c!.redeemed_by ? 'aktif' : 'baru' }; break;
      case 'release': patch = { status: 'baru', redeemed_by: undefined, redeemed_at: undefined }; break;
      case 'transfer':
        if (!db.accounts().some((a) => a.uid === payload.user_id)) fail(400, 'pengguna_tidak_wujud', 'Peserta tidak dijumpai.');
        if (!c!.redeemed_by) fail(400, 'kod_belum_digunakan', 'Kod ini belum digunakan.');
        patch = { redeemed_by: payload.user_id as string };
        break;
      case 'set_entitlements':
        if (!Array.isArray(payload.items) || payload.items.some((k) => !catalog.items.some((i) => i.key === k))) {
          fail(400, 'item_tidak_sah', 'Item tidak sah.');
        }
        patch = { entitlements: [...new Set(payload.items as string[])].sort() };
        break;
      case 'extend': patch = { access_ends_at: (payload.access_ends_at as string) || null }; break;
      default: return fail(400, 'tindakan_tidak_sah', 'Tindakan tidak sah.');
    }
    db.updateCode(c!.code, patch);
    for (const u of new Set([prev, patch.redeemed_by].filter(Boolean) as string[])) recompute(u);
    audit(me.uid, `code.${b.action}`, 'access_code', codeRow(c!).id as string, { payload, code: c!.code });
    return out(codeRow(db.codes().find((y) => y.code === c!.code)!));
  }

  // ---------------- audit ----------------
  if (method === 'GET' && path === '/api/admin/audit') {
    const n = Math.min(Math.max(Number(query.limit) || 100, 1), 500);
    return out(st.audit.slice(0, n));
  }

  // ---------------- CRUD: bcl-map + content tables ----------------
  const crud = /^\/api\/admin\/(?:(bcl-map)|content\/([a-z_]+))(?:\/([^/]+))?$/.exec(path);
  if (crud) {
    const table = crud[1] ? 'bcl_map' : crud[2];
    const rows = table === 'bcl_map' ? st.bcl_map : st.tables[table];
    if (!rows) NOT_FOUND();
    const pk = PK[table];
    const prefix = table === 'bcl_map' ? 'bcl_map' : 'content';
    const id = crud[3];
    const keyOf = (r: Row) => pk.map((k) => String(r[k])).join(':');
    const pick = (src: Row, withPk: boolean) => {
      const o: Row = {};
      for (const c of COLS[table]) if (src[c] !== undefined && (withPk || !pk.includes(c))) o[c] = src[c];
      return o;
    };
    if (method === 'GET' && !id) return out(rows);
    const idx = id ? rows.findIndex((r) => keyOf(r) === id) : -1;
    if (method === 'GET') return idx < 0 ? NOT_FOUND() : out(rows[idx]);
    if (method === 'POST' && !id) {
      const v = pick(b, true);
      if (!Object.keys(v).length) fail(400, 'data_tidak_sah', 'Maklumat tidak lengkap atau tidak sah.');
      if (pk.length === 1 && pk[0] === 'id' && v.id === undefined) v.id = uuid(++st.seq);
      if (rows.some((r) => keyOf(r) === keyOf(v))) fail(400, 'data_tidak_sah', 'Rekod ini sudah wujud.');
      rows.push(v);
      audit(me.uid, `${prefix}.create`, table, keyOf(v), v);
      return out(v);
    }
    if (method === 'PUT' && id) {
      const v = pick(b, false);
      if (!Object.keys(v).length) fail(400, 'data_tidak_sah', 'Maklumat tidak lengkap atau tidak sah.');
      if (idx < 0) NOT_FOUND();
      rows[idx] = { ...rows[idx], ...v };
      audit(me.uid, `${prefix}.update`, table, id, { changes: v });
      return out(rows[idx]);
    }
    if (method === 'DELETE' && id) {
      if (idx < 0) NOT_FOUND();
      const [r] = rows.splice(idx, 1);
      audit(me.uid, `${prefix}.delete`, table, id, r);
      return out(r);
    }
  }
  return NOT_FOUND();
}
