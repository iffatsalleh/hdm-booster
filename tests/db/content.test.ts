import { describe, test, expect, afterAll } from 'vitest';
import { randomBytes } from 'node:crypto';
import { q, newUid, cleanup, closeDb } from './helpers';

const uids: string[] = [];
const refs: string[] = [];
const batchIds: string[] = [];
const rnd = () => randomBytes(5).toString('hex');
const sfx = rnd();
const T_EBOOK_ITEM = `test_ebook_${sfx}`;
const T_GROUP_ITEM = `test_group_${sfx}`;
let tEbookId = '';

const fresh = () => { const u = newUid(); uids.push(u); return u; };
const profile = async (extra: { email?: string; phone?: string } = {}) => {
  const u = fresh();
  const email = extra.email ?? `${u}@example.test`;
  await q('insert into profiles (id, full_name, email, phone) values ($1,$2,$3,$4)', [u, 'Test User', email, extra.phone ?? '0123456789']);
  return u;
};
const purchase = async (opts: { uid?: string | null; pkg?: string; status?: string; batch?: string | null; email?: string; phone?: string }) => {
  const ref = `test_p5_${rnd()}`;
  refs.push(ref);
  const ents = opts.pkg
    ? (await q('select array_agg(item_key order by item_key) a from package_items where package_id=$1', [opts.pkg]))[0].a
    : [];
  const rows = await q(
    `insert into purchases (order_ref, batch_id, package_id, entitlements, email, phone, status, claimed_by, claimed_at)
     values ($1,$2,$3,$4,$5,$6,$7,$8, case when $8::text is not null then now() end) returning id`,
    [ref, opts.batch ?? null, opts.pkg ?? null, ents, opts.email ?? null, opts.phone ?? null,
     opts.status ?? 'dituntut', opts.uid ?? null],
  );
  return rows[0].id as string;
};
const batch = async (name: string, open?: string, close?: string) => {
  const r = await q('insert into batches (name, sales_open_at, sales_close_at) values ($1,$2,$3) returning id',
    [`test_batch_${sfx}_${name}`, open ?? null, close ?? null]);
  batchIds.push(r[0].id);
  return r[0].id as string;
};
const boot = async (u: string) => (await q('select app_bootstrap($1) as r', [u]))[0].r;
const groups = async (u: string) => (await q('select my_groups($1) as r', [u]))[0].r as any[];

afterAll(async () => {
  await q('delete from groups where item_key = $1', [T_GROUP_ITEM]);
  await q('delete from ebooks where item_key = $1', [T_EBOOK_ITEM]);
  await q('delete from purchases where order_ref = any($1::text[])', [refs]);
  await cleanup(uids);
  if (batchIds.length) await q('delete from batches where id = any($1::uuid[])', [batchIds]);
  await q('delete from items where key = any($1::text[])', [[T_EBOOK_ITEM, T_GROUP_ITEM]]);
  await closeDb();
});

describe('setup', () => {
  test('create test items / ebook', async () => {
    await q(`insert into items (key, name, kind, sort) values ($1,'Test Ebook','ebook',900), ($2,'Test Group','group',901)`,
      [T_EBOOK_ITEM, T_GROUP_ITEM]);
    tEbookId = (await q(
      `insert into ebooks (item_key, number, title, file_drive_id, allow_download, sort) values ($1, 99, 'Test', 'FILE123', true, 900) returning id`,
      [T_EBOOK_ITEM]))[0].id;
    expect(tEbookId).toBeTruthy();
  });
});

describe('seed', () => {
  test('7 ebooks numbered 1-7 with catalogue keys, 2 global groups, settings', async () => {
    const e = await q(`select number, item_key from ebooks where item_key not like 'test\\_%' order by number`);
    expect(e.map((r) => r.item_key)).toEqual(['ebook_strategi', 'ebook_muscle_mania', 'ebook_traditional_remedy',
      'ebook_tas', 'ebook_food_swap', 'ebook_emergency', 'ebook_supplement']);
    expect(e.map((r) => r.number)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    const g = await q(`select item_key, coach from groups where batch_id is null and item_key in ('group_hdm','group_muscle_mania') order by item_key`);
    expect(g.map((r) => r.item_key)).toEqual(['group_hdm', 'group_muscle_mania']);
    const s = await q(`select key, public from app_settings where key in ('support_wa','wa_upgrade_text','upgrade_note','wa_template_purchase','wa_template_code')`);
    const pub = Object.fromEntries(s.map((r) => [r.key, r.public]));
    expect(pub).toEqual({ support_wa: true, wa_upgrade_text: true, upgrade_note: true, wa_template_purchase: false, wa_template_code: false });
  });
});

describe('app_bootstrap', () => {
  test('no profile -> tiada_profil', async () => {
    expect(await boot(fresh())).toEqual({ ok: false, reason: 'tiada_profil' });
  });

  test('ebooks never contain file_drive_id; settings only public', async () => {
    const u = await profile();
    const r = await boot(u);
    expect(r.ok).toBe(true);
    expect(r.catalog.ebooks.length).toBeGreaterThanOrEqual(8);
    for (const e of r.catalog.ebooks) expect(e).not.toHaveProperty('file_drive_id');
    expect(JSON.stringify(r)).not.toContain('FILE123');
    expect(r.catalog.settings.support_wa).toBe('60134417042');
    expect(r.catalog.settings).not.toHaveProperty('wa_template_purchase');
    expect(r.profile.id).toBe(u);
    expect(r.roles).toEqual([]);
    expect(Array.isArray(r.catalog.items)).toBe(true);
    expect(r.catalog.packages.find((p: any) => p.id === 'complete').items).toHaveLength(12);
  });

  test('batch = batch of most recent claimed purchase', async () => {
    const u = await profile();
    const b1 = await batch('older');
    const b2 = await batch('newer');
    const p1 = await purchase({ uid: u, pkg: 'basic', batch: b1 });
    await q(`update purchases set claimed_at = now() - interval '2 days' where id = $1`, [p1]);
    await purchase({ uid: u, pkg: 'basic', batch: b2 });
    const r = await boot(u);
    expect(r.batch.id).toBe(b2);
    expect(typeof r.batch.name).toBe('string');
  });

  test('no purchase -> batch whose sales window contains now', async () => {
    const u = await profile();
    const b = await batch('open', new Date(Date.now() - 3600e3).toISOString(), new Date(Date.now() + 3600e3).toISOString());
    const r = await boot(u);
    expect(r.batch.id).toBe(b);
    expect(typeof r.batch.sales_open_at).toBe('string');
  });

  test('self-heal: belum_dituntut purchase matching email+phone is claimed on bootstrap', async () => {
    const email = `heal_${rnd()}@example.test`;
    const u = await profile({ email, phone: '0123456789' });
    const id = await purchase({ pkg: 'complete', status: 'belum_dituntut', email, phone: '60123456789' });
    const r = await boot(u);
    expect(r.entitlements).toContain('ebook_supplement');
    expect(r.entitlements).toHaveLength(12);
    const pu = (await q('select status, claimed_by from purchases where id=$1', [id]))[0];
    expect(pu).toEqual({ status: 'dituntut', claimed_by: u });
  });

  test('self-heal does not claim when phone differs', async () => {
    const email = `heal2_${rnd()}@example.test`;
    const u = await profile({ email, phone: '0123456789' });
    const id = await purchase({ pkg: 'basic', status: 'belum_dituntut', email, phone: '60129999999' });
    await boot(u);
    expect((await q('select status from purchases where id=$1', [id]))[0].status).toBe('belum_dituntut');
  });
});

describe('my_groups', () => {
  test('basic user: group_hdm invite_url set; group_muscle_mania locked, invite_url null', async () => {
    const u = await profile();
    await purchase({ uid: u, pkg: 'basic' });
    const g = await groups(u);
    const hdm = g.find((x) => x.item_key === 'group_hdm');
    const mm = g.find((x) => x.item_key === 'group_muscle_mania');
    expect(hdm.locked).toBe(false);
    expect(hdm.invite_url).toMatch(/^https:\/\//);
    expect(mm.locked).toBe(true);
    expect(mm.invite_url).toBeNull();
  });

  test('batch-specific group only for users with a claimed purchase or active code in that batch', async () => {
    const b = await batch('grp');
    const other = await batch('grp_other');
    await q(`insert into groups (item_key, batch_id, name, invite_url) values ($1,$2,'Test Batch Group','https://example.test/x')`, [T_GROUP_ITEM, b]);
    const inB = await profile();
    const inOther = await profile();
    const unclaimed = await profile();
    await purchase({ uid: inB, batch: b });
    await q(`insert into manual_grants (user_id, item_key) values ($1,$2)`, [inB, T_GROUP_ITEM]);
    await purchase({ uid: inOther, batch: other });
    await q(`insert into manual_grants (user_id, item_key) values ($1,$2)`, [inOther, T_GROUP_ITEM]);
    await purchase({ uid: null, status: 'belum_dituntut', batch: b });
    await q(`insert into manual_grants (user_id, item_key) values ($1,$2)`, [unclaimed, T_GROUP_ITEM]);
    expect((await groups(inB)).some((x) => x.name === 'Test Batch Group' && !x.locked)).toBe(true);
    expect((await groups(inOther)).some((x) => x.name === 'Test Batch Group')).toBe(false);
    expect((await groups(unclaimed)).some((x) => x.name === 'Test Batch Group')).toBe(false);
  });
});

describe('ebook_for_ticket', () => {
  const ticket = async (u: string, id: string) => (await q('select ebook_for_ticket($1,$2) as r', [u, id]))[0].r;
  test('basic user + ebook 02 -> tiada_akses; complete user -> tiada_fail (no file yet)', async () => {
    const e2 = (await q(`select id from ebooks where item_key='ebook_muscle_mania'`))[0].id;
    const basic = await profile();
    await purchase({ uid: basic, pkg: 'basic' });
    expect(await ticket(basic, e2)).toEqual({ ok: false, reason: 'tiada_akses' });
    const full = await profile();
    await purchase({ uid: full, pkg: 'complete' });
    expect(await ticket(full, e2)).toEqual({ ok: false, reason: 'tiada_fail' });
  });
  test('entitled user with file -> fileId; unentitled -> tiada_akses; unknown ebook -> tiada_akses', async () => {
    const u = await profile();
    await q(`insert into manual_grants (user_id, item_key) values ($1,$2)`, [u, T_EBOOK_ITEM]);
    const r = await ticket(u, tAbs());
    expect(r).toMatchObject({ ok: true, fileId: 'FILE123', allowDownload: true });
    expect(await ticket(await profile(), tAbs())).toEqual({ ok: false, reason: 'tiada_akses' });
    expect(await ticket(u, '00000000-0000-0000-0000-000000000000')).toEqual({ ok: false, reason: 'tiada_akses' });
  });
  function tAbs() { return tEbookId; }
});

describe('save_reading', () => {
  test('only touches p_uid row; finished sets finished_at', async () => {
    const a = await profile();
    const b = await profile();
    const e = (await q(`select id from ebooks where item_key='ebook_strategi'`))[0].id;
    await q('select save_reading($1,$2,$3,$4)', [a, e, 5, false]);
    await q('select save_reading($1,$2,$3,$4)', [b, e, 9, false]);
    await q('select save_reading($1,$2,$3,$4)', [a, e, 12, true]);
    const ra = (await q('select last_page, finished_at from reading_progress where user_id=$1 and ebook_id=$2', [a, e]))[0];
    const rb = (await q('select last_page, finished_at from reading_progress where user_id=$1 and ebook_id=$2', [b, e]))[0];
    expect(ra.last_page).toBe(12);
    expect(ra.finished_at).not.toBeNull();
    expect(rb.last_page).toBe(9);
    expect(rb.finished_at).toBeNull();
    expect((await boot(a)).reading).toHaveLength(1);
  });
});

describe('save_onboarding / save_targets', () => {
  const good = { sex: 'L', birth_year: 1990, height_cm: 175, start_weight_kg: 85, activity_level: 3, health_ack: true, privacy_ack: true };
  const onb = async (u: string, p: unknown) => (await q('select save_onboarding($1,$2::jsonb) as r', [u, JSON.stringify(p)]))[0].r;
  test('valid data saved, acks timestamped, onboarded_at set', async () => {
    const u = await profile();
    expect(await onb(u, good)).toEqual({ ok: true });
    const p = (await q('select * from profiles where id=$1', [u]))[0];
    expect(p.sex).toBe('L');
    expect(Number(p.height_cm)).toBe(175);
    expect(p.health_ack_at).not.toBeNull();
    expect(p.privacy_ack_at).not.toBeNull();
    expect(p.onboarded_at).not.toBeNull();
  });
  test.each([
    ['bad sex', { ...good, sex: 'X' }],
    ['activity 0', { ...good, activity_level: 0 }],
    ['activity 6', { ...good, activity_level: 6 }],
    ['height 0', { ...good, height_cm: 0 }],
    ['weight negative', { ...good, start_weight_kg: -5 }],
    ['no health ack', { ...good, health_ack: false }],
    ['no privacy ack', { ...good, privacy_ack: undefined }],
    ['non numeric', { ...good, height_cm: 'abc' }],
  ])('invalid (%s) -> data_tidak_sah and nothing saved', async (_n, p) => {
    const u = await profile();
    expect(await onb(u, p)).toEqual({ ok: false, reason: 'data_tidak_sah' });
    expect((await q('select onboarded_at, sex from profiles where id=$1', [u]))[0]).toEqual({ onboarded_at: null, sex: null });
  });
  test('save_targets saves only own profile', async () => {
    const a = await profile();
    const b = await profile();
    expect(await (async () => (await q('select save_targets($1,$2::jsonb) as r', [a, JSON.stringify({ tdee_kcal: 2500, kcal_target: 2000, protein_target_g: 150 })]))[0].r)()).toEqual({ ok: true });
    const pa = (await q('select tdee_kcal, kcal_target, protein_target_g from profiles where id=$1', [a]))[0];
    expect(pa).toEqual({ tdee_kcal: 2500, kcal_target: 2000, protein_target_g: 150 });
    expect((await q('select tdee_kcal from profiles where id=$1', [b]))[0].tdee_kcal).toBeNull();
  });
});

describe('account_summary', () => {
  test('purchases and codes with package names, own data only', async () => {
    const u = await profile();
    const other = await profile();
    await purchase({ uid: u, pkg: 'basic' });
    await purchase({ uid: other, pkg: 'complete' });
    const r = (await q('select account_summary($1) as r', [u]))[0].r;
    expect(r.purchases).toHaveLength(1);
    expect(r.purchases[0].package_name).toBe('Pakej Basic');
    expect(r.codes).toEqual([]);
  });
});
