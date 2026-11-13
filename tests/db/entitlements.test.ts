import { describe, test, expect, afterAll } from 'vitest';
import { q, newUid, cleanup, closeDb } from './helpers';

const uids: string[] = [];
const fresh = () => { const u = newUid(); uids.push(u); return u; };
const ents = async (u: string) => (await q('select entitlements_for($1) as e', [u]))[0].e as string[];

afterAll(async () => { await cleanup(uids); await closeDb(); });

describe('entitlements_for', () => {
  test('no sources -> []', async () => expect(await ents(fresh())).toEqual([]));

  test('manual grant tdee -> [tdee]; revoked_at set -> []', async () => {
    const u = fresh();
    await q('insert into profiles (id, email) values ($1, $2)', [u, `${u}@example.test`]);
    const [g] = await q('insert into manual_grants (user_id, item_key, granted_by, reason) values ($1,$2,$3,$4) returning id', [u, 'tdee', u, 'test']);
    expect(await ents(u)).toEqual(['tdee']);
    await q('update manual_grants set revoked_at = now() where id = $1', [g.id]);
    expect(await ents(u)).toEqual([]);
  });

  test('duplicate grants are distinct and sorted', async () => {
    const u = fresh();
    for (const k of ['tdee', 'sistem', 'tdee']) {
      await q('insert into manual_grants (user_id, item_key, granted_by) values ($1,$2,$3)', [u, k, u]);
    }
    expect(await ents(u)).toEqual(['sistem', 'tdee']);
  });

  test("another user's grants never leak", async () => {
    const a = fresh(), b = fresh();
    await q('insert into manual_grants (user_id, item_key, granted_by) values ($1,$2,$3)', [a, 'tdee', a]);
    expect(await ents(b)).toEqual([]);
  });
});

describe('seed', () => {
  test('complete has 12 items; basic has exactly 5; upgrade_a_b is not sellable', async () => {
    const complete = await q('select item_key from package_items where package_id = $1', ['complete']);
    expect(complete).toHaveLength(12);
    const basic = (await q('select item_key from package_items where package_id = $1 order by item_key', ['basic'])).map((r) => r.item_key);
    expect(basic).toEqual(['graduation', 'group_hdm', 'sistem', 'tdee', 'ebook_strategi'].sort());
    const [up] = await q('select sellable from packages where id = $1', ['upgrade_a_b']);
    expect(up.sellable).toBe(false);
    expect(await q('select 1 from package_items where package_id = $1', ['upgrade_a_b'])).toHaveLength(7);
    expect(await q('select 1 from items')).toHaveLength(12);
  });

  test('Batch Rejab 1448 seeded', async () => {
    const [b] = await q("select status, program_start::text as ps, program_end::text as pe, phases from batches where name = 'Batch Rejab 1448'");
    expect(b.status).toBe('akan_datang');
    expect(b.ps).toBe('2026-12-10');
    expect(b.pe).toBe('2027-03-10');
    expect(JSON.stringify(b.phases)).toContain('syaaban');
  });
});

describe('roles_for', () => {
  test('[] for participant, [superadmin] after insert', async () => {
    const u = fresh();
    expect(await q('select roles_for($1) as r', [u]).then((r) => r[0].r)).toEqual([]);
    await q('insert into user_roles (user_id, role) values ($1, $2)', [u, 'superadmin']);
    expect((await q('select roles_for($1) as r', [u]))[0].r).toEqual(['superadmin']);
  });
});

describe('log_audit', () => {
  test('writes one audit row', async () => {
    const u = fresh();
    await q('select log_audit($1,$2,$3,$4,$5::jsonb)', [u, 'test.action', 'profile', u, '{"a":1}']);
    const rows = await q('select action, detail from audit_logs where actor = $1', [u]);
    expect(rows).toHaveLength(1);
    expect(rows[0].detail).toEqual({ a: 1 });
  });
});
