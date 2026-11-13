import { describe, test, expect, afterAll } from 'vitest';
import { randomBytes } from 'node:crypto';
import { q, newUid, cleanup, closeDb } from './helpers';

const uids: string[] = [];
const labels: string[] = [];
const fresh = () => { const u = newUid(); uids.push(u); return u; };
const newLabel = () => { const l = `test_lbl_${randomBytes(6).toString('hex')}`; labels.push(l); return l; };
const ents = async (u: string) => (await q('select entitlements_for($1) as e', [u]))[0].e as string[];

const admin = async () => {
  const a = fresh();
  await q("insert into user_roles (user_id, role) values ($1, 'superadmin')", [a]);
  return a;
};
const gen = async (actor: string, pkg: string, n: number, extra: { ends?: string | null } = {}) =>
  q('select * from generate_codes($1,$2,$3,null,$4,null,$5)', [actor, pkg, n, newLabel(), extra.ends ?? null]);
const redeem = async (u: string, code: string) =>
  (await q('select redeem_code($1,$2) as r', [u, code]))[0].r as { ok: boolean; items?: string[]; reason?: string };
const act = async (actor: string, id: string, action: string, payload: unknown = {}) =>
  (await q('select * from admin_code_action($1,$2,$3,$4::jsonb)', [actor, id, action, JSON.stringify(payload)]))[0];

afterAll(async () => {
  if (labels.length) {
    await q(
      `delete from audit_logs where target_type = 'access_code'
         and target_id in (select id::text from access_codes where batch_label = any($1::text[]))`,
      [labels],
    );
    await q('delete from access_codes where batch_label = any($1::text[])', [labels]);
  }
  await cleanup(uids);
  await closeDb();
});

const FORMAT = /^HDMB-[ABCDEFGHJKMNPQRSTUVWXYZ2-9]{4}-[ABCDEFGHJKMNPQRSTUVWXYZ2-9]{4}$/;

describe('generate_codes', () => {
  test('generate 3 basic -> formatted, unique, belum_guna, package entitlements', async () => {
    const a = await admin();
    const rows = await gen(a, 'basic', 3);
    expect(rows).toHaveLength(3);
    for (const r of rows) {
      expect(r.code).toMatch(FORMAT);
      expect(r.status).toBe('belum_guna');
      expect([...r.entitlements].sort()).toEqual(['ebook_strategi', 'graduation', 'group_hdm', 'sistem', 'tdee']);
      expect(r.created_by).toBe(a);
    }
    expect(new Set(rows.map((r) => r.code)).size).toBe(3);
    const audit = await q("select 1 from audit_logs where actor = $1 and action = 'code.generate'", [a]);
    expect(audit).toHaveLength(1);
  });

  test('p_count 501 and 0 -> bilangan_tidak_sah', async () => {
    const a = await admin();
    await expect(gen(a, 'basic', 501)).rejects.toThrow(/bilangan_tidak_sah/);
    await expect(gen(a, 'basic', 0)).rejects.toThrow(/bilangan_tidak_sah/);
  });

  test('non-superadmin (coach / nobody) -> tiada_kebenaran', async () => {
    const c = fresh();
    await q("insert into user_roles (user_id, role) values ($1, 'coach')", [c]);
    await expect(gen(c, 'basic', 1)).rejects.toThrow(/tiada_kebenaran/);
    await expect(gen(fresh(), 'basic', 1)).rejects.toThrow(/tiada_kebenaran/);
  });
});

describe('redeem_code', () => {
  test('redeem -> ok, entitlements basic; same code by 2nd uid -> sudah_digunakan', async () => {
    const a = await admin(), u1 = fresh(), u2 = fresh();
    const [c] = await gen(a, 'basic', 1);
    const r = await redeem(u1, c.code);
    expect(r).toEqual({ ok: true, items: ['ebook_strategi', 'graduation', 'group_hdm', 'sistem', 'tdee'] });
    expect(await ents(u1)).toEqual(r.items);
    expect(await redeem(u2, c.code)).toEqual({ ok: false, reason: 'sudah_digunakan' });
    expect(await ents(u2)).toEqual([]);
    const [row] = await q('select status, redeemed_by, redeemed_at, access_starts_at from access_codes where id = $1', [c.id]);
    expect(row.status).toBe('aktif');
    expect(row.redeemed_by).toBe(u1);
    expect(row.redeemed_at).not.toBeNull();
    expect(row.access_starts_at).not.toBeNull();
  });

  test('unknown code -> tidak_sah', async () => {
    expect(await redeem(fresh(), 'HDMB-AAAA-AAAA')).toEqual({ ok: false, reason: 'tidak_sah' });
  });

  test('cancel -> entitlements drop immediately; redeem cancelled -> dibatalkan', async () => {
    const a = await admin(), u = fresh(), u2 = fresh();
    const [c] = await gen(a, 'basic', 1);
    await redeem(u, c.code);
    expect(await ents(u)).toHaveLength(5);
    const row = await act(a, c.id, 'cancel');
    expect(row.status).toBe('dibatalkan');
    expect(await ents(u)).toEqual([]);
    expect(await redeem(u2, c.code)).toEqual({ ok: false, reason: 'dibatalkan' });
    const back = await act(a, c.id, 'reactivate');
    expect(back.status).toBe('aktif');
    expect(await ents(u)).toHaveLength(5);
  });

  test('cancel an unredeemed code, reactivate returns it to belum_guna', async () => {
    const a = await admin();
    const [c] = await gen(a, 'basic', 1);
    expect((await act(a, c.id, 'cancel')).status).toBe('dibatalkan');
    expect((await act(a, c.id, 'reactivate')).status).toBe('belum_guna');
  });

  test('expired access_ends_at -> tamat_tempoh on redeem; aktif code past end gives nothing', async () => {
    const a = await admin(), u = fresh(), u2 = fresh();
    const [c] = await gen(a, 'basic', 1, { ends: '2020-01-01T00:00:00Z' });
    expect(await redeem(u, c.code)).toEqual({ ok: false, reason: 'tamat_tempoh' });
    const [c2] = await gen(a, 'basic', 1);
    await redeem(u2, c2.code);
    expect(await ents(u2)).toHaveLength(5);
    await act(a, c2.id, 'extend', { access_ends_at: '2020-01-01T00:00:00Z' });
    expect(await ents(u2)).toEqual([]);
    await act(a, c2.id, 'extend', { access_ends_at: '2099-01-01T00:00:00Z' });
    expect(await ents(u2)).toHaveLength(5);
  });

  test('upgrade_a_b on basic user -> 12 keys; items = only newly gained', async () => {
    const a = await admin(), u = fresh();
    const [b] = await gen(a, 'basic', 1);
    const [up] = await gen(a, 'upgrade_a_b', 1);
    await redeem(u, b.code);
    const r = await redeem(u, up.code);
    expect(r.ok).toBe(true);
    expect(r.items).toHaveLength(7);
    expect(await ents(u)).toHaveLength(12);
  });

  test('concurrent redeem of one code -> exactly one wins', async () => {
    const a = await admin(), u1 = fresh(), u2 = fresh();
    const [c] = await gen(a, 'basic', 1);
    const rs = await Promise.all([redeem(u1, c.code), redeem(u2, c.code)]);
    expect(rs.filter((r) => r.ok)).toHaveLength(1);
    expect(rs.filter((r) => !r.ok && r.reason === 'sudah_digunakan')).toHaveLength(1);
  });
});

describe('admin_code_action', () => {
  test('transfer moves entitlements and writes audit row', async () => {
    const a = await admin(), u1 = fresh(), u2 = fresh();
    await q('insert into profiles (id, email) values ($1,$2)', [u2, `${u2}@example.test`]);
    const [c] = await gen(a, 'basic', 1);
    await redeem(u1, c.code);
    const row = await act(a, c.id, 'transfer', { user_id: u2 });
    expect(row.redeemed_by).toBe(u2);
    expect(await ents(u1)).toEqual([]);
    expect(await ents(u2)).toHaveLength(5);
    const audit = await q("select detail from audit_logs where actor = $1 and action = 'code.transfer' and target_id = $2", [a, c.id]);
    expect(audit).toHaveLength(1);
  });

  test('transfer to user without profile -> pengguna_tidak_wujud', async () => {
    const a = await admin();
    const [c] = await gen(a, 'basic', 1);
    await expect(act(a, c.id, 'transfer', { user_id: fresh() })).rejects.toThrow(/pengguna_tidak_wujud/);
  });

  test('release -> belum_guna, clears redeemed_by, can be redeemed again', async () => {
    const a = await admin(), u1 = fresh(), u2 = fresh();
    const [c] = await gen(a, 'basic', 1);
    await redeem(u1, c.code);
    const row = await act(a, c.id, 'release');
    expect(row.status).toBe('belum_guna');
    expect(row.redeemed_by).toBeNull();
    expect(await ents(u1)).toEqual([]);
    expect((await redeem(u2, c.code)).ok).toBe(true);
  });

  test('set_entitlements replaces items', async () => {
    const a = await admin(), u = fresh();
    const [c] = await gen(a, 'basic', 1);
    await redeem(u, c.code);
    const row = await act(a, c.id, 'set_entitlements', { items: ['tdee', 'sistem'] });
    expect([...row.entitlements].sort()).toEqual(['sistem', 'tdee']);
    expect(await ents(u)).toEqual(['sistem', 'tdee']);
  });

  test('non-superadmin -> tiada_kebenaran; unknown action / id rejected; each action audits once', async () => {
    const a = await admin(), n = fresh();
    const [c] = await gen(a, 'basic', 1);
    await expect(act(n, c.id, 'cancel')).rejects.toThrow(/tiada_kebenaran/);
    await expect(act(a, c.id, 'bogus')).rejects.toThrow(/tindakan_tidak_sah/);
    await expect(act(a, '00000000-0000-0000-0000-000000000000', 'cancel')).rejects.toThrow(/kod_tidak_wujud/);
    await act(a, c.id, 'cancel');
    expect(await q("select 1 from audit_logs where actor = $1 and action = 'code.cancel' and target_id = $2", [a, c.id])).toHaveLength(1);
    expect(await q("select 1 from audit_logs where actor = $1 and target_id = $2", [a, c.id])).toHaveLength(1);
  });
});
