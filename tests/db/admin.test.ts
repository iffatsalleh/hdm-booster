import { describe, test, expect, afterAll } from 'vitest';
import { randomBytes } from 'node:crypto';
import { q, newUid, cleanup, closeDb } from './helpers';

const uids: string[] = [];
const refs: string[] = [];
const rnd = () => randomBytes(5).toString('hex');
const fresh = () => { const u = newUid(); uids.push(u); return u; };
const withRole = async (role: 'superadmin' | 'coach') => {
  const a = fresh();
  await q('insert into user_roles (user_id, role) values ($1,$2)', [a, role]);
  return a;
};
const profile = async (name = 'Test User') => {
  const u = fresh();
  await q('insert into profiles (id, full_name, email, phone) values ($1,$2,$3,$4)', [u, name, `${u}@example.test`, '0123456789']);
  return u;
};
const mkPurchase = async (o: { uid?: string | null; pkg?: string; status?: string } = {}) => {
  const ref = `test_p5a_${rnd()}`;
  refs.push(ref);
  const ents = o.pkg ? (await q('select array_agg(item_key order by item_key) a from package_items where package_id=$1', [o.pkg]))[0].a : [];
  return (await q(
    `insert into purchases (order_ref, package_id, entitlements, status, claimed_by, claimed_at)
     values ($1,$2,$3,$4,$5, case when $5::text is not null then now() end) returning id`,
    [ref, o.pkg ?? null, ents, o.status ?? 'belum_dituntut', o.uid ?? null]))[0].id as string;
};
const act = async (actor: string, id: string, action: string, payload: unknown = {}) =>
  (await q('select admin_purchase_action($1,$2,$3,$4::jsonb) as r', [actor, id, action, JSON.stringify(payload)]))[0].r;
const auditCount = async (actor: string) => Number((await q('select count(*) n from audit_logs where actor=$1', [actor]))[0].n);

afterAll(async () => {
  // audit rows for test purchases are removed by actor in cleanup(); delete purchases afterwards
  await cleanup(uids);
  await q('delete from audit_logs where target_type = $1 and target_id in (select id::text from purchases where order_ref = any($2::text[]))', ['purchase', refs]);
  await q('delete from purchases where order_ref = any($1::text[])', [refs]);
  await closeDb();
});

describe('role checks', () => {
  test('coach: admin_participants / summary / participant ok; everything else tiada_kebenaran', async () => {
    const coach = await withRole('coach');
    const p = await profile();
    const id = await mkPurchase();
    expect(Array.isArray((await q('select admin_participants($1,null) as r', [coach]))[0].r)).toBe(true);
    expect((await q('select admin_summary($1) as r', [coach]))[0].r).toHaveProperty('participants');
    expect((await q('select admin_participant($1,$2) as r', [coach, p]))[0].r.profile.id).toBe(p);
    const denied: [string, unknown[]][] = [
      ['select admin_purchase_action($1,$2,$3,$4::jsonb)', [coach, id, 'cancel', '{}']],
      ['select admin_purchases($1,$2::jsonb)', [coach, '{}']],
      ['select admin_grant($1,$2,$3,$4)', [coach, p, 'sistem', 'x']],
      ['select admin_revoke_grant($1,$2)', [coach, '00000000-0000-0000-0000-000000000000']],
      ['select admin_codes($1,$2::jsonb)', [coach, '{}']],
      ['select admin_audit($1,$2)', [coach, 10]],
    ];
    for (const [sql, params] of denied) await expect(q(sql, params)).rejects.toThrow('tiada_kebenaran');
    expect((await q('select status from purchases where id=$1', [id]))[0].status).toBe('belum_dituntut');
  });

  test('user with no role is denied everywhere, including the coach-allowed functions', async () => {
    const nobody = await profile();
    for (const sql of ['select admin_summary($1)', 'select admin_participants($1,null)']) {
      await expect(q(sql, [nobody])).rejects.toThrow('tiada_kebenaran');
    }
    await expect(q('select admin_participant($1,$1)', [nobody])).rejects.toThrow('tiada_kebenaran');
    await expect(q('select admin_audit($1,5)', [nobody])).rejects.toThrow('tiada_kebenaran');
  });
});

describe('admin_participants', () => {
  test('search by name/email/phone, wildcards are literal, newest first', async () => {
    const admin = await withRole('superadmin');
    const marker = `Zq${rnd()}`;
    const a = await profile(`${marker} Satu`);
    const b = await profile(`${marker} Dua`);
    const r = (await q('select admin_participants($1,$2) as r', [admin, marker.toLowerCase()]))[0].r as any[];
    expect(r.map((x) => x.id)).toEqual([b, a]);
    expect((await q('select admin_participants($1,$2) as r', [admin, `${a}`]))[0].r.map((x: any) => x.id)).toEqual([a]);
    expect((await q('select admin_participants($1,$2) as r', [admin, '%']))[0].r.length).toBe(0);
    expect((await q('select admin_participants($1,$2) as r', [admin, `'; drop table profiles; --`]))[0].r).toEqual([]);
    expect((await q('select admin_participants($1,null) as r', [admin]))[0].r.length).toBeLessThanOrEqual(200);
  });
});

describe('admin_purchase_action', () => {
  test('set_package basic -> complete recopies 12 entitlements and writes one audit row', async () => {
    const admin = await withRole('superadmin');
    const u = await profile();
    const id = await mkPurchase({ uid: u, pkg: 'basic', status: 'dituntut' });
    expect((await q('select entitlements_for($1) as e', [u]))[0].e).toHaveLength(5);
    const before = await auditCount(admin);
    const r = await act(admin, id, 'set_package', { package_id: 'complete' });
    expect(r.package_id).toBe('complete');
    expect(r.entitlements).toHaveLength(12);
    expect((await q('select entitlements_for($1) as e', [u]))[0].e).toHaveLength(12);
    expect(await auditCount(admin)).toBe(before + 1);
    const a = (await q(`select action, target_id from audit_logs where actor=$1 order by id desc limit 1`, [admin]))[0];
    expect(a).toEqual({ action: 'purchase.set_package', target_id: id });
    await expect(act(admin, id, 'set_package', { package_id: 'nope' })).rejects.toThrow('pakej_tidak_wujud');
    expect(await auditCount(admin)).toBe(before + 1);
  });

  test('assign requires existing profile; claims for target', async () => {
    const admin = await withRole('superadmin');
    const u = await profile();
    const id = await mkPurchase({ pkg: 'basic' });
    await expect(act(admin, id, 'assign', { user_id: 'test_doesnotexist' })).rejects.toThrow('pengguna_tidak_wujud');
    await expect(act(admin, id, 'assign', {})).rejects.toThrow('pengguna_tidak_wujud');
    const r = await act(admin, id, 'assign', { user_id: u });
    expect(r.status).toBe('dituntut');
    expect(r.claimed_by).toBe(u);
    expect((await q('select entitlements_for($1) as e', [u]))[0].e).toHaveLength(5);
  });

  test('cancel -> dibatalkan; restore -> dituntut if claimed else belum_dituntut; unknown action rejected', async () => {
    const admin = await withRole('superadmin');
    const u = await profile();
    const claimed = await mkPurchase({ uid: u, pkg: 'basic', status: 'dituntut' });
    const open = await mkPurchase({ pkg: 'basic' });
    expect((await act(admin, claimed, 'cancel')).status).toBe('dibatalkan');
    expect((await q('select entitlements_for($1) as e', [u]))[0].e).toHaveLength(0);
    expect((await act(admin, claimed, 'restore')).status).toBe('dituntut');
    expect((await act(admin, open, 'cancel')).status).toBe('dibatalkan');
    expect((await act(admin, open, 'restore')).status).toBe('belum_dituntut');
    await expect(act(admin, open, 'explode')).rejects.toThrow('tindakan_tidak_sah');
    await expect(act(admin, '00000000-0000-0000-0000-000000000000', 'cancel')).rejects.toThrow('pembelian_tidak_wujud');
  });
});

describe('grants, listings, audit', () => {
  test('admin_grant / admin_revoke_grant: one audit row each, entitlement follows', async () => {
    const admin = await withRole('superadmin');
    const u = await profile();
    const before = await auditCount(admin);
    const g = (await q('select admin_grant($1,$2,$3,$4) as r', [admin, u, 'sistem', 'ujian']))[0].r;
    expect(await auditCount(admin)).toBe(before + 1);
    expect((await q('select entitlements_for($1) as e', [u]))[0].e).toEqual(['sistem']);
    await q('select admin_revoke_grant($1,$2)', [admin, g.id]);
    expect(await auditCount(admin)).toBe(before + 2);
    expect((await q('select entitlements_for($1) as e', [u]))[0].e).toEqual([]);
    await expect(q('select admin_revoke_grant($1,$2)', [admin, g.id])).rejects.toThrow('geran_sudah_ditarik');
    await expect(q('select admin_grant($1,$2,$3,null)', [admin, 'test_nobody', 'sistem'])).rejects.toThrow('pengguna_tidak_wujud');
    await expect(q('select admin_grant($1,$2,$3,null)', [admin, u, 'no_such_item'])).rejects.toThrow('item_tidak_sah');
    expect(await auditCount(admin)).toBe(before + 2);
  });

  test('admin_purchases filters by status and q; admin_codes and admin_audit return arrays; participant detail', async () => {
    const admin = await withRole('superadmin');
    const u = await profile();
    const id = await mkPurchase({ uid: u, pkg: 'basic', status: 'dituntut' });
    const ref = refs[refs.length - 1];
    const list = (await q('select admin_purchases($1,$2::jsonb) as r', [admin, JSON.stringify({ status: 'dituntut', q: ref })]))[0].r;
    expect(list.map((x: any) => x.id)).toEqual([id]);
    expect(list[0].package_name).toBe('Pakej Basic');
    expect((await q('select admin_purchases($1,$2::jsonb) as r', [admin, JSON.stringify({ status: 'dibatalkan', q: ref })]))[0].r).toEqual([]);
    expect(Array.isArray((await q('select admin_codes($1,$2::jsonb) as r', [admin, '{}']))[0].r)).toBe(true);
    const audit = (await q('select admin_audit($1,$2) as r', [admin, 3]))[0].r;
    expect(Array.isArray(audit)).toBe(true);
    expect(audit.length).toBeLessThanOrEqual(3);
    const d = (await q('select admin_participant($1,$2) as r', [admin, u]))[0].r;
    expect(d.purchases).toHaveLength(1);
    expect(d.entitlements).toHaveLength(5);
    expect(d.purchases[0]).not.toHaveProperty('raw');
  });
});
