// DEV MOCK ONLY: answers the Worker routes this task uses, with the Worker's reasons and BM messages.
import { ApiError } from '../lib/errors';
import { normalizeEmail, normalizePhone } from '../lib/phone';
import { normalizeCode } from '../lib/codes';
import { bootstrapFor, catalog, GROUPS, packages, PURCHASES, UNCLAIMED_PURCHASE } from './fixtures';
import { db, delay } from './db';
import { issueTicket } from './gas';
import { adminMock } from './admin';

const fail = (status: number, reason: string, message = ''): never => {
  throw new ApiError(reason, message, status);
};

export async function mockApi<T>(method: string, path: string, body?: unknown): Promise<T> {
  await delay();
  const key = `${method} ${path}`;

  if (key === 'POST /api/register') {
    const b = (body ?? {}) as Record<string, unknown>;
    const email = normalizeEmail(String(b.email ?? ''));
    const phone = normalizePhone(String(b.phone ?? ''));
    const name = String(b.name ?? '').trim().replace(/\s+/g, ' ');
    const password = String(b.password ?? '');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail(400, 'data_tidak_sah', 'Emel tidak sah.');
    if (!phone) fail(400, 'data_tidak_sah', 'Nombor telefon tidak sah. Contoh: 0123456789.');
    if (!name) fail(400, 'data_tidak_sah', 'Sila masukkan nama penuh (maksimum 100 aksara).');
    if (password.length < 8) fail(400, 'data_tidak_sah', 'Kata laluan mesti sekurang-kurangnya 8 aksara.');
    if (b.privacyAck !== true) fail(400, 'data_tidak_sah', 'Sila tandakan pengakuan privasi untuk meneruskan.');
    if (db.byEmail(email)) {
      fail(409, 'sudah_didaftar', 'Emel ini sudah ada akaun. Sila log masuk atau tekan Lupa Kata Laluan.');
    }
    if (email !== UNCLAIMED_PURCHASE.email || phone !== UNCLAIMED_PURCHASE.phone) {
      fail(400, 'tiada_pembelian',
        'Emel/telefon ini tiada rekod pembelian. Pastikan sama seperti semasa beli di BCL, atau WhatsApp 60134417042.');
    }
    db.add({
      uid: `mock-${Date.now()}`, email, password, full_name: name, phone: phone!, onboarded_at: null, roles: [],
      entitlements: UNCLAIMED_PURCHASE.entitlements,
    });
    return { entitlements: UNCLAIMED_PURCHASE.entitlements } as T;
  }

  const me = db.current();
  if (!me) return fail(401, 'perlu_log_masuk', 'Sila log masuk semula.');
  if (key === 'GET /api/me') {
    const { profile, ...rest } = bootstrapFor(me);
    return { profile, ...rest } as T;
  }
  const b = (body ?? {}) as Record<string, unknown>;

  if (key === 'PUT /api/me/onboarding') {
    if (b.health_ack !== true || b.privacy_ack !== true) {
      fail(400, 'data_tidak_sah', 'Sila lengkapkan borang dan tandakan kedua-dua pengakuan (kesihatan dan privasi).');
    }
    const n = (k: string) => (b[k] == null || b[k] === '' ? null : Number(b[k]));
    const [h, w, act, by, bf] = [n('height_cm'), n('start_weight_kg'), n('activity_level'), n('birth_year'), n('start_body_fat_pct')];
    const bad = (b.sex !== 'L' && b.sex !== 'P') || act == null || act < 1 || act > 5 || h == null || !(h > 0 && h <= 300)
      || w == null || !(w > 0 && w <= 500) || (by != null && (by < 1900 || by > new Date().getFullYear()))
      || (bf != null && !(bf > 0 && bf < 100));
    if (bad) fail(400, 'data_tidak_sah');
    const keys = ['sex', 'birth_year', 'height_cm', 'start_weight_kg', 'start_body_fat_pct', 'start_waist_cm', 'activity_level',
      'target_weight_kg', 'protein_target_g'];
    const profile: Record<string, unknown> = {};
    for (const k of keys) if (b[k] !== undefined) profile[k] = b[k];
    db.update(me.uid, { onboarded_at: new Date().toISOString(), profile });
    return {} as T;
  }

  if (key === 'PUT /api/me/targets') {
    if (!me.entitlements.includes('tdee')) {
      fail(403, 'tiada_akses', 'Kalkulator TDEE tiada dalam akses anda. Aktifkan pakej anda atau hubungi admin.');
    }
    const t = ['tdee_kcal', 'kcal_target', 'protein_target_g'].map((k) => Number(b[k]));
    if (t.some((v) => !Number.isInteger(v) || v <= 0)) fail(400, 'data_tidak_sah');
    db.update(me.uid, { profile: { tdee_kcal: t[0], kcal_target: t[1], protein_target_g: t[2] } });
    return {} as T;
  }

  if (key === 'PUT /api/me/name') {
    const name = typeof b.full_name === 'string' ? b.full_name.trim().replace(/\s+/g, ' ') : '';
    if (!name || name.length > 100) fail(400, 'data_tidak_sah', 'Sila masukkan nama penuh (maksimum 100 aksara).');
    db.update(me.uid, { full_name: name });
    return { full_name: name } as T;
  }

  if (key === 'GET /api/me/access') {
    const name = (id: string) => packages.find((k) => k.id === id)?.name ?? null;
    const codes = db.codes().filter((c) => c.redeemed_by === me.uid).map((c) => ({
      id: c.code, code: c.code, package_id: c.package_id, package_name: name(c.package_id), status: c.status, batch_id: null,
      redeemed_at: c.redeemed_at ?? null, access_starts_at: c.redeemed_at ?? null, access_ends_at: null,
      entitlements: packages.find((k) => k.id === c.package_id)?.items ?? [],
    }));
    return { purchases: PURCHASES[me.uid] ?? [], codes } as T;
  }

  if (key === 'GET /api/groups') {
    const sort = (k: string) => catalog.items.find((i) => i.key === k)?.sort ?? 99;
    return GROUPS.map((g) => {
      const locked = !me.entitlements.includes(g.item_key);
      return { ...g, invite_url: locked ? null : g.invite_url, locked };
    }).sort((x, y) => sort(x.item_key) - sort(y.item_key)) as T;
  }

  if (key === 'POST /api/codes/redeem') {
    if (redeemFailures >= 5) fail(429, 'terlalu_banyak_cubaan', 'Terlalu banyak cubaan. Cuba lagi selepas 15 minit.');
    const miss = (reason: string, message: string) => {
      redeemFailures++;
      return fail(400, reason, message);
    };
    const code = typeof b.code === 'string' ? normalizeCode(b.code) : null;
    const c = code ? db.codes().find((x) => x.code === code) : undefined;
    if (!c) return miss('tidak_sah', 'Kod tidak sah. Semak semula kod anda.');
    if (c.status === 'dibatalkan') return miss('dibatalkan', 'Kod ini telah dibatalkan, sila hubungi admin.');
    if (c.status === 'aktif') return miss('sudah_digunakan', 'Kod ini telah digunakan.');
    if (c.expired) return miss('tamat_tempoh', 'Kod ini telah tamat tempoh, sila hubungi admin.');
    const add = packages.find((k) => k.id === c.package_id)?.items ?? [];
    const items = add.filter((k) => !me.entitlements.includes(k)).sort();
    db.update(me.uid, { entitlements: [...new Set([...me.entitlements, ...add])].sort() });
    db.updateCode(c.code, { status: 'aktif', redeemed_by: me.uid, redeemed_at: new Date().toISOString() });
    redeemFailures = 0;
    return { items } as T;
  }

  const eb = /^(POST|PUT) \/api\/ebook\/([^/]+)\/(ticket|progress)$/.exec(key);
  if (eb) {
    const e = catalog.ebooks.find((x) => x.id === eb[2]);
    if (!e || !me.entitlements.includes(e.item_key)) fail(403, 'tiada_akses', 'Ebook ini tersedia dalam Pakej Complete.');
    if (eb[1] === 'POST' && eb[3] === 'ticket') {
      return { ticket: issueTicket(e!.id), updatedAt: e!.file_updated_at, allowDownload: e!.allow_download } as T;
    }
    if (eb[1] === 'PUT' && eb[3] === 'progress') {
      const lp = b.last_page;
      const fin = b.finished ?? false;
      if (typeof lp !== 'number' || !Number.isInteger(lp) || lp < 0 || lp > 100000 || typeof fin !== 'boolean') {
        fail(400, 'data_tidak_sah');
      }
      const now = new Date().toISOString();
      const prev = (me.reading ?? []).find((r) => r.ebook_id === e!.id);
      const row = { user_id: me.uid, ebook_id: e!.id, last_page: lp as number,
        finished_at: fin ? prev?.finished_at ?? now : prev?.finished_at ?? null, updated_at: now };
      db.update(me.uid, { reading: [...(me.reading ?? []).filter((r) => r.ebook_id !== e!.id), row] });
      return {} as T;
    }
  }

  if (path.startsWith('/api/admin/')) return adminMock<T>(method, path, body, me);

  return fail(404, 'tiada', 'Halaman atau tindakan tidak dijumpai.');
}

let redeemFailures = 0;
