// 0007: recovery paths for buyers whose order did not match cleanly (re-evaluation, set_buyer, manual purchase,
// orders without a purchase), the email kinds queued per status, batch recompute, phone-normalised search.
import { describe, test, expect, afterAll, beforeAll } from 'vitest';
import { randomBytes } from 'node:crypto';
import { q, newUid, cleanup, closeDb } from './helpers';

const uids: string[] = [];
const refs: string[] = [];
const emails: string[] = [];
const tag = () => randomBytes(6).toString('hex');
const fresh = () => { const u = newUid(); uids.push(u); return u; };
const newRef = () => { const r = `test_rc_${tag()}`; refs.push(r); return r; };
const newEmail = () => { const e = `test_${tag()}@example.test`; emails.push(e); return e; };
const randomPhone = () => '601' + Array.from(randomBytes(9), (b) => String(b % 10)).join('');

const IN_WINDOW = '2026-12-05T10:00:00+08:00';
const BEFORE_WINDOW = '2026-11-20T10:00:00+08:00';
let BATCH = '';

type Upsert = { row: any; inserted: boolean; reevaluated: boolean; changed: boolean };
const upsert = async (p: Record<string, unknown>) =>
  (await q('select upsert_purchase($1::jsonb) as r', [JSON.stringify(p)]))[0].r as Upsert;
const purchase = (o: Record<string, unknown> = {}) => ({
  order_ref: newRef(), buyer_name: 'Ali', email: newEmail(), phone: randomPhone(),
  amount_rm: 100, paid_at: IN_WINDOW, package_id: 'basic', source: 'bcl', raw: { a: 1 }, ...o,
});
const mail = async (id: string) =>
  (await q('select kind, to_email, status from email_queue where ref_id = $1 order by created_at, id', [id])) as
    { kind: string; to_email: string; status: string }[];
const withRole = async (role: 'superadmin' | 'coach') => {
  const a = fresh();
  await q('insert into user_roles (user_id, role) values ($1,$2)', [a, role]);
  return a;
};
const profileWith = async (email: string, phone: string) => {
  const u = fresh();
  await q('insert into profiles (id, full_name, email, phone) values ($1,$2,$3,$4)', [u, 'Test Buyer', email, phone]);
  return u;
};
const act = async (actor: string, id: string, action: string, payload: unknown = {}) =>
  (await q('select admin_purchase_action($1,$2,$3,$4::jsonb) as r', [actor, id, action, JSON.stringify(payload)]))[0].r;
const auditCount = async (actor: string) => Number((await q('select count(*) n from audit_logs where actor=$1', [actor]))[0].n);

beforeAll(async () => {
  BATCH = (await q(`select id from batches where sales_open_at <= $1::timestamptz and $1::timestamptz <= sales_close_at
                     order by sales_open_at desc limit 1`, [IN_WINDOW]))[0].id;
});

afterAll(async () => {
  await cleanup(uids);
  await q('delete from email_queue where ref_id in (select id::text from purchases where order_ref = any($1::text[]))', [refs]);
  await q('delete from email_queue where to_email = any($1::text[])', [emails]);
  await q('delete from bcl_webhook_log where order_ref = any($1::text[])', [refs]);
  await q(`delete from audit_logs where target_type = 'purchase'
             and target_id in (select id::text from purchases where order_ref = any($1::text[]))`, [refs]);
  await q('delete from purchases where order_ref = any($1::text[])', [refs]);
  await q('delete from profiles where email = any($1::text[])', [emails]);
  await closeDb();
});

describe('I1: email kind per status on insert', () => {
  test('belum_dituntut -> one purchase_welcome', async () => {
    const r = await upsert(purchase());
    expect(r.row.status).toBe('belum_dituntut');
    expect(await mail(r.row.id)).toEqual([{ kind: 'purchase_welcome', to_email: r.row.email, status: 'pending' }]);
  });

  test('perlu_semakan -> no email', async () => {
    const r = await upsert(purchase({ phone: '12345' }));
    expect(r.row.status).toBe('perlu_semakan');
    expect(await mail(r.row.id)).toEqual([]);
  });

  test('auto-claimed repeat buyer -> purchase_added, not welcome', async () => {
    const e = newEmail(), ph = randomPhone();
    const u = await profileWith(e, ph);
    const r = await upsert(purchase({ email: e, phone: ph }));
    expect(r.row.status).toBe('dituntut');
    expect(r.row.claimed_by).toBe(u);
    expect((await mail(r.row.id)).map((m) => m.kind)).toEqual(['purchase_added']);
  });
});

describe('C1: upsert_purchase re-evaluates perlu_semakan rows only', () => {
  test('perlu_semakan (bad phone) + corrected data -> belum_dituntut, welcome queued once', async () => {
    const p = purchase({ phone: '12345' });
    const a = await upsert(p);
    expect(a.row.status).toBe('perlu_semakan');
    const b = await upsert({ ...p, phone: '012-345 6789' });
    expect(b).toMatchObject({ inserted: false, reevaluated: true, changed: true });
    expect(b.row.id).toBe(a.row.id);
    expect(b.row.status).toBe('belum_dituntut');
    expect(b.row.review_reason).toBeNull();
    expect(b.row.phone).toBe('60123456789');
    const c = await upsert({ ...p, phone: '012-345 6789' });
    expect(c).toMatchObject({ inserted: false, reevaluated: false, changed: false });
    expect((await mail(a.row.id)).map((m) => m.kind)).toEqual(['purchase_welcome']);
  });

  test('perlu_semakan with nothing new -> reevaluated, changed=false', async () => {
    const p = purchase({ package_id: null, review_reason: 'Borang tidak dikenali' });
    await upsert(p);
    const b = await upsert(p);
    expect(b).toMatchObject({ inserted: false, reevaluated: true, changed: false });
    expect(b.row.status).toBe('perlu_semakan');
    expect(b.row.review_reason).toBe('Borang tidak dikenali');
  });

  test('perlu_semakan (no batch) re-evaluated after the batch exists keeps paid_at and finds the batch', async () => {
    const p = purchase({ paid_at: BEFORE_WINDOW });
    const a = await upsert(p);
    expect(a.row.review_reason).toBe('Tiada batch dibuka');
    // the owner widens the batch window: simulated by moving paid_at into the window on the row
    await q('update purchases set paid_at = $2 where id = $1', [a.row.id, IN_WINDOW]);
    const b = await upsert(p);
    expect(b.reevaluated).toBe(true);
    expect(b.row.batch_id).toBe(BATCH);
    expect(b.row.status).toBe('belum_dituntut');
    expect(Date.parse(b.row.paid_at)).toBe(Date.parse(IN_WINDOW));
  });

  test('re-evaluation auto-claims when email + phone match a profile -> purchase_added', async () => {
    const e = newEmail(), ph = randomPhone();
    const u = await profileWith(e, ph);
    const p = purchase({ email: e, phone: 'x' });
    expect((await upsert(p)).row.status).toBe('perlu_semakan');
    const b = await upsert({ ...p, phone: ph });
    expect(b.row.status).toBe('dituntut');
    expect(b.row.claimed_by).toBe(u);
    expect((await mail(b.row.id)).map((m) => m.kind)).toEqual(['purchase_added']);
  });

  test('belum_dituntut / dituntut / dibatalkan rows are never touched', async () => {
    for (const status of ['belum_dituntut', 'dituntut', 'dibatalkan']) {
      const p = purchase();
      const a = await upsert(p);
      await q('update purchases set status = $2 where id = $1', [a.row.id, status]);
      const b = await upsert({ ...p, package_id: 'complete', email: newEmail(), phone: randomPhone() });
      expect(b, status).toMatchObject({ inserted: false, reevaluated: false, changed: false });
      expect(b.row.status).toBe(status);
      expect(b.row.package_id).toBe('basic');
      expect(b.row.email).toBe(a.row.email);
    }
  });
});

describe('C1 + I2: admin_purchase_action set_buyer / set_package / restore', () => {
  test('set_buyer rejects invalid email / phone, no audit row', async () => {
    const admin = await withRole('superadmin');
    const a = await upsert(purchase({ phone: '12345' }));
    await expect(act(admin, a.row.id, 'set_buyer', { buyer_name: 'Ali', email: 'not-an-email', phone: '0123456789' }))
      .rejects.toThrow('emel_tidak_sah');
    await expect(act(admin, a.row.id, 'set_buyer', { buyer_name: 'Ali', email: newEmail(), phone: '999' }))
      .rejects.toThrow('telefon_tidak_sah');
    expect(await auditCount(admin)).toBe(0);
  });

  test('set_buyer fixes a perlu_semakan row: normalised, batch from paid_at, belum_dituntut, welcome, audit', async () => {
    const admin = await withRole('superadmin');
    const a = await upsert(purchase({ phone: '12345', email: null }));
    await q('update purchases set batch_id = null where id = $1', [a.row.id]);
    const e = newEmail();
    const r = await act(admin, a.row.id, 'set_buyer', { buyer_name: '  Siti  Aminah ', email: `  ${e.toUpperCase().replace('@EXAMPLE.TEST', '@example.test')} `, phone: '012-345 6789' });
    expect(r).toMatchObject({ email: e, phone: '60123456789', buyer_name: 'Siti Aminah', status: 'belum_dituntut', review_reason: null, batch_id: BATCH });
    expect(r).not.toHaveProperty('raw');
    expect(await mail(a.row.id)).toEqual([{ kind: 'purchase_welcome', to_email: e, status: 'pending' }]);
    expect(await auditCount(admin)).toBe(1);
    const reg = (await q('select register_check($1,$2) as r', [e, '0123456789']))[0].r;
    expect(reg.ok).toBe(true);
  });

  test('set_buyer matching an existing account auto-claims (purchase_added)', async () => {
    const admin = await withRole('superadmin');
    const e = newEmail(), ph = randomPhone();
    const u = await profileWith(e, ph);
    const a = await upsert(purchase({ email: 'bad', phone: 'bad' }));
    const r = await act(admin, a.row.id, 'set_buyer', { buyer_name: 'Ali', email: e, phone: ph });
    expect(r.status).toBe('dituntut');
    expect(r.claimed_by).toBe(u);
    expect((await mail(a.row.id)).map((m) => m.kind)).toEqual(['purchase_added']);
  });

  test('set_buyer on a claimed row only edits the details (claim kept, no email)', async () => {
    const admin = await withRole('superadmin');
    const e = newEmail(), ph = randomPhone();
    const u = await profileWith(e, ph);
    const a = await upsert(purchase({ email: e, phone: ph }));
    const e2 = newEmail();
    const r = await act(admin, a.row.id, 'set_buyer', { buyer_name: 'Ali B', email: e2, phone: ph });
    expect(r).toMatchObject({ status: 'dituntut', claimed_by: u, email: e2 });
    expect((await mail(a.row.id)).map((m) => m.kind)).toEqual(['purchase_added']);
  });

  test('set_buyer with explicit batch_id: validated; unknown -> batch_tidak_wujud', async () => {
    const admin = await withRole('superadmin');
    const a = await upsert(purchase({ paid_at: BEFORE_WINDOW }));
    expect(a.row.status).toBe('perlu_semakan');
    await expect(act(admin, a.row.id, 'set_buyer', { buyer_name: 'A', email: newEmail(), phone: randomPhone(), batch_id: '00000000-0000-0000-0000-000000000000' }))
      .rejects.toThrow('batch_tidak_wujud');
    const r = await act(admin, a.row.id, 'set_buyer', { buyer_name: 'A', email: a.row.email, phone: a.row.phone, batch_id: BATCH });
    expect(r).toMatchObject({ batch_id: BATCH, status: 'belum_dituntut' });
  });

  test('set_package on an unknown-package row -> registrable; batch recomputed when null', async () => {
    const admin = await withRole('superadmin');
    const a = await upsert(purchase({ package_id: null }));
    expect(a.row.status).toBe('perlu_semakan');
    await q('update purchases set batch_id = null where id = $1', [a.row.id]);
    const r = await act(admin, a.row.id, 'set_package', { package_id: 'complete' });
    expect(r).toMatchObject({ package_id: 'complete', status: 'belum_dituntut', review_reason: null, batch_id: BATCH });
    expect(r.entitlements).toHaveLength(12);
    expect((await mail(a.row.id)).map((m) => m.kind)).toEqual(['purchase_welcome']);
    await expect(act(admin, a.row.id, 'set_package', { package_id: 'basic', batch_id: 'nope' })).rejects.toThrow('batch_tidak_wujud');
  });

  test('restore re-evaluates an unclaimed row and recomputes a missing batch; no duplicate welcome', async () => {
    const admin = await withRole('superadmin');
    const a = await upsert(purchase());
    await act(admin, a.row.id, 'cancel');
    await q('update purchases set batch_id = null where id = $1', [a.row.id]);
    const r = await act(admin, a.row.id, 'restore');
    expect(r).toMatchObject({ status: 'belum_dituntut', batch_id: BATCH });
    expect((await mail(a.row.id)).map((m) => m.kind)).toEqual(['purchase_welcome']);
    const bad = await upsert(purchase({ phone: '1' }));
    await act(admin, bad.row.id, 'cancel');
    expect(await act(admin, bad.row.id, 'restore')).toMatchObject({ status: 'perlu_semakan', review_reason: 'Telefon tidak sah' });
  });
});

describe('C1: admin_add_purchase (manual purchase)', () => {
  const add = async (actor: string, p: Record<string, unknown>) => {
    const r = (await q('select admin_add_purchase($1,$2::jsonb) as r', [actor, JSON.stringify(p)]))[0].r;
    refs.push(r.order_ref);
    return r;
  };

  test('creates MANUAL-<YYYYMMDD>-<random>, source manual, explicit batch, belum_dituntut, welcome, audit', async () => {
    const admin = await withRole('superadmin');
    const e = newEmail();
    const r = await add(admin, { package_id: 'basic', batch_id: BATCH, buyer_name: ' Ahmad ', email: e.toUpperCase().replace('@EXAMPLE.TEST', '@example.test'), phone: '013-444 5566', amount_rm: '97' });
    expect(r.order_ref).toMatch(/^MANUAL-\d{8}-[A-Z0-9]{6}$/);
    expect(r).toMatchObject({ source: 'manual', package_id: 'basic', batch_id: BATCH, buyer_name: 'Ahmad', email: e, phone: '60134445566', status: 'belum_dituntut' });
    expect(Number(r.amount_rm)).toBe(97);
    expect(Math.abs(Date.parse(r.paid_at) - Date.now())).toBeLessThan(10 * 60_000);
    expect(r.entitlements).toHaveLength(5);
    expect(r).not.toHaveProperty('raw');
    expect(await mail(r.id)).toEqual([{ kind: 'purchase_welcome', to_email: e, status: 'pending' }]);
    const a = (await q(`select action, target_id from audit_logs where actor = $1`, [admin]));
    expect(a).toEqual([{ action: 'purchase.manual_add', target_id: r.id }]);
    expect((await q('select register_check($1,$2) as r', [e, '0134445566']))[0].r.ok).toBe(true);
  });

  test('existing account with same email + phone -> auto-claimed, purchase_added', async () => {
    const admin = await withRole('superadmin');
    const e = newEmail(), ph = randomPhone();
    const u = await profileWith(e, ph);
    const r = await add(admin, { package_id: 'complete', batch_id: BATCH, buyer_name: 'B', email: e, phone: ph });
    expect(r).toMatchObject({ status: 'dituntut', claimed_by: u });
    expect((await mail(r.id)).map((m) => m.kind)).toEqual(['purchase_added']);
  });

  test('invalid input rejected with a reason, nothing written; coach denied', async () => {
    const admin = await withRole('superadmin');
    const coach = await withRole('coach');
    const ok = { package_id: 'basic', batch_id: BATCH, buyer_name: 'C', email: newEmail(), phone: randomPhone() };
    const bad: [Record<string, unknown>, string][] = [
      [{ ...ok, package_id: 'nope' }, 'pakej_tidak_wujud'],
      [{ ...ok, email: 'x@' }, 'emel_tidak_sah'],
      [{ ...ok, phone: '0312345678' }, 'telefon_tidak_sah'],
      [{ ...ok, buyer_name: '  ' }, 'nama_diperlukan'],
      [{ ...ok, batch_id: '00000000-0000-0000-0000-000000000000' }, 'batch_tidak_wujud'],
      [{ ...ok, amount_rm: -5 }, 'jumlah_tidak_sah'],
    ];
    for (const [p, reason] of bad) {
      await expect(q('select admin_add_purchase($1,$2::jsonb)', [admin, JSON.stringify(p)]), reason).rejects.toThrow(reason);
    }
    await expect(q('select admin_add_purchase($1,$2::jsonb)', [coach, JSON.stringify(ok)])).rejects.toThrow('tiada_kebenaran');
    expect(await auditCount(admin)).toBe(0);
    expect(await q('select 1 from purchases where email = $1', [ok.email])).toHaveLength(0);
  });

  test('no batch given: the batch open now, else perlu_semakan "Tiada batch dibuka"', async () => {
    const admin = await withRole('superadmin');
    const open = (await q('select id from batches where sales_open_at <= now() and now() <= sales_close_at order by sales_open_at desc limit 1'))[0]?.id ?? null;
    const r = await add(admin, { package_id: 'basic', buyer_name: 'D', email: newEmail(), phone: randomPhone() });
    expect(r.batch_id).toBe(open);
    if (open) expect(r.status).toBe('belum_dituntut');
    else expect(r).toMatchObject({ status: 'perlu_semakan', review_reason: 'Tiada batch dibuka' });
  });
});

describe('C1: orders without a purchase + webhook error card', () => {
  test('admin_orphan_orders lists ignored/error refs with no purchase (latest per ref); superadmin only', async () => {
    const admin = await withRole('superadmin');
    const coach = await withRole('coach');
    const ign = newRef(), err = newRef(), skip = newRef(), done = newRef();
    await upsert(purchase({ order_ref: done }));
    await q(`insert into bcl_webhook_log (order_ref, kind, ok, message, at) values
             ($1, 'ignored', false, 'form not in bcl_form_map (webhook)', now() - interval '2 minutes'),
             ($1, 'ignored', false, 'form not in bcl_form_map (poll)', now() - interval '1 minute'),
             ($2, 'error', false, 'boom', now()),
             ($3, 'skipped', false, 'not paid live', now()),
             ($4, 'ignored', false, 'x', now())`, [ign, err, skip, done]);
    const rows = (await q('select admin_orphan_orders($1) as r', [admin]))[0].r as any[];
    const mine = rows.filter((r) => [ign, err, skip, done].includes(r.order_ref));
    expect(mine.map((r) => r.order_ref).sort()).toEqual([ign, err].sort());
    const i = mine.find((r) => r.order_ref === ign);
    expect(i).toMatchObject({ kind: 'ignored', message: 'form not in bcl_form_map (poll)', attempts: 2 });
    expect(i).not.toHaveProperty('payload');
    await expect(q('select admin_orphan_orders($1)', [coach])).rejects.toThrow('tiada_kebenaran');
  });

  test('admin_summary.webhook_errors: error/ralat and unknown ok=false kinds, never ignored/skipped', async () => {
    const admin = await withRole('superadmin');
    const e = newRef(), ign = newRef(), skip = newRef(), odd = newRef();
    await q(`insert into bcl_webhook_log (order_ref, kind, ok, message, at) values
             ($1, 'error', false, 'x', now() + interval '2 hours'), ($2, 'ignored', false, 'x', now() + interval '2 hours'),
             ($3, 'skipped', false, 'x', now() + interval '2 hours'), ($4, 'pelik', false, 'x', now() + interval '2 hours')`, [e, ign, skip, odd]);
    const seen = ((await q('select admin_summary($1) as r', [admin]))[0].r.webhook_errors as any[]).map((w) => w.order_ref);
    expect(seen).toContain(e);
    expect(seen).toContain(odd);
    expect(seen).not.toContain(ign);
    expect(seen).not.toContain(skip);
  });
});

describe('admin search: phone-like q matches normalised phones', () => {
  test('participants and purchases: "012…" finds "6012…"', async () => {
    const admin = await withRole('superadmin');
    const ph = randomPhone();
    const local = '0' + ph.slice(2);
    const e = newEmail();
    const u = await profileWith(e, ph);
    const p = await upsert(purchase({ phone: ph }));
    const parts = (await q('select admin_participants($1,$2) as r', [admin, local]))[0].r as any[];
    expect(parts.map((r) => r.id)).toContain(u);
    const dashed = `${local.slice(0, 3)}-${local.slice(3, 6)} ${local.slice(6)}`;
    const pus = (await q('select admin_purchases($1,$2::jsonb) as r', [admin, JSON.stringify({ q: dashed })]))[0].r as any[];
    expect(pus.map((r) => r.id)).toContain(p.row.id);
    const partial = (await q('select admin_purchases($1,$2::jsonb) as r', [admin, JSON.stringify({ q: local.slice(0, 7) })]))[0].r as any[];
    expect(partial.map((r) => r.id)).toContain(p.row.id);
  });
});
