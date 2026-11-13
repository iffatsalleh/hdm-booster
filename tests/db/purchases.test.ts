import { describe, test, expect, afterAll } from 'vitest';
import { randomBytes } from 'node:crypto';
import { q, newUid, cleanup, closeDb } from './helpers';

const uids: string[] = [];
const refs: string[] = [];
const emails: string[] = [];
const subjects: string[] = [];
const fresh = () => { const u = newUid(); uids.push(u); return u; };
const tag = () => randomBytes(6).toString('hex');
const newRef = () => { const r = `test_ord_${tag()}`; refs.push(r); return r; };
const newEmail = () => { const e = `test_${tag()}@example.test`; emails.push(e); return e; };
const newSubject = () => { const s = `test_${tag()}`; subjects.push(s); return s; };

const IN_WINDOW = '2026-12-05T10:00:00+08:00';
const ents = async (u: string) => (await q('select entitlements_for($1) as e', [u]))[0].e as string[];
const upsert = async (p: Record<string, unknown>) =>
  (await q('select upsert_purchase($1::jsonb) as r', [JSON.stringify(p)]))[0].r as { row: any; inserted: boolean };
const purchase = (o: Record<string, unknown> = {}) => ({
  order_ref: newRef(), buyer_name: 'Ali', email: newEmail(), phone: '012-345 6789',
  amount_rm: 100, paid_at: IN_WINDOW, package_id: 'basic', source: 'bcl', raw: { a: 1 }, ...o,
});

afterAll(async () => {
  await cleanup(uids);
  if (refs.length) {
    await q('delete from email_queue where ref_id in (select id::text from purchases where order_ref = any($1::text[]))', [refs]);
    await q('delete from bcl_webhook_log where order_ref = any($1::text[])', [refs]);
    await q('delete from purchases where order_ref = any($1::text[])', [refs]);
  }
  if (emails.length) {
    await q('delete from email_queue where to_email = any($1::text[])', [emails]);
    await q('delete from profiles where email = any($1::text[])', [emails]);
  }
  if (subjects.length) await q('delete from rate_attempts where subject = any($1::text[])', [subjects]);
  await closeDb();
});

describe('normalize_phone / normalize_email', () => {
  const phone = async (s: string | null) => (await q('select normalize_phone($1) as r', [s]))[0].r;
  test('valid', async () => {
    expect(await phone('012-345 6789')).toBe('60123456789');
    expect(await phone('+60123456789')).toBe('60123456789');
    expect(await phone('0123456789')).toBe('60123456789');
    expect(await phone('60 11-2345 6789')).toBe('601123456789');
    expect(await phone('123456789')).toBe('60123456789');
  });
  test('invalid', async () => {
    expect(await phone('12345')).toBeNull();
    expect(await phone('0312345678')).toBeNull();
    expect(await phone('')).toBeNull();
    expect(await phone(null)).toBeNull();
  });
  test('email trims and lowercases', async () => {
    expect((await q('select normalize_email($1) as r', ['  Ali@Gmail.COM ']))[0].r).toBe('ali@gmail.com');
  });
});

describe('upsert_purchase', () => {
  test('normalises Ali@Gmail.com/012-345 6789 -> ali@gmail.com/60123456789', async () => {
    const e = newEmail();
    const r = await upsert(purchase({ email: e.toUpperCase().replace('@EXAMPLE.TEST', '@example.test'), phone: '012-345 6789' }));
    expect(r.inserted).toBe(true);
    expect(r.row.email).toBe(r.row.email.toLowerCase().trim());
    expect(r.row.phone).toBe('60123456789');
    expect(r.row.status).toBe('belum_dituntut');
    expect(r.row.batch_id).not.toBeNull();
    expect([...r.row.entitlements].sort()).toEqual(['ebook_strategi', 'graduation', 'group_hdm', 'sistem', 'tdee']);
  });

  test('same order_ref twice -> 1 purchase, 1 email_queue row, inserted=false 2nd', async () => {
    const p = purchase();
    const a = await upsert(p);
    const b = await upsert(p);
    expect(a.inserted).toBe(true);
    expect(b.inserted).toBe(false);
    expect(b.row.id).toBe(a.row.id);
    expect(await q('select 1 from purchases where order_ref = $1', [p.order_ref])).toHaveLength(1);
    const mail = await q("select kind, status from email_queue where ref_id = $1", [a.row.id]);
    expect(mail).toHaveLength(1);
    expect(mail[0].kind).toBe('purchase_welcome');
    expect(mail[0].status).toBe('pending');
  });

  test('paid_at before sales_open -> perlu_semakan "Tiada batch dibuka"', async () => {
    const r = await upsert(purchase({ paid_at: '2026-11-20T10:00:00+08:00' }));
    expect(r.row.batch_id).toBeNull();
    expect(r.row.status).toBe('perlu_semakan');
    expect(r.row.review_reason).toBe('Tiada batch dibuka');
  });

  test('null package_id -> perlu_semakan, empty entitlements', async () => {
    const r = await upsert(purchase({ package_id: null, review_reason: 'Borang tidak dikenali' }));
    expect(r.row.status).toBe('perlu_semakan');
    expect(r.row.review_reason).toBe('Borang tidak dikenali');
    expect(r.row.entitlements).toEqual([]);
  });

  test('invalid phone -> null phone, perlu_semakan, raw kept', async () => {
    const r = await upsert(purchase({ phone: '12345', raw: { phone: '12345' } }));
    expect(r.row.phone).toBeNull();
    expect(r.row.status).toBe('perlu_semakan');
    expect(r.row.review_reason).toBe('Telefon tidak sah');
    expect(r.row.raw).toEqual({ phone: '12345' });
  });

  test('missing email -> perlu_semakan, no raise', async () => {
    const r = await upsert(purchase({ email: null }));
    expect(r.row.status).toBe('perlu_semakan');
    expect(r.row.review_reason).toBe('Emel tidak sah');
  });
});

describe('register_check / register_complete', () => {
  test('register_check matches " ali@gmail.COM " + "+60123456789"', async () => {
    const e = newEmail();
    await upsert(purchase({ email: e }));
    const r = (await q('select register_check($1,$2) as r', [`  ${e.toUpperCase().replace('@EXAMPLE.TEST', '@example.test')} `, '+60123456789']))[0].r;
    expect(r.ok).toBe(true);
    expect(r.profile_exists).toBe(false);
    expect(r.packages).toContain('Pakej Basic');
  });

  test('register_check wrong phone -> tiada_pembelian', async () => {
    const e = newEmail();
    await upsert(purchase({ email: e }));
    const r = (await q('select register_check($1,$2) as r', [e, '0129999999']))[0].r;
    expect(r).toEqual({ ok: false, reason: 'tiada_pembelian' });
  });

  test('register_complete claims purchase -> entitlements = basic 5 keys', async () => {
    const e = newEmail(), u = fresh();
    const p = await upsert(purchase({ email: e }));
    const r = (await q('select register_complete($1,$2,$3,$4) as r', [u, e, '012-345 6789', 'Ali']))[0].r;
    expect(r.ok).toBe(true);
    expect(r.entitlements).toEqual(['ebook_strategi', 'graduation', 'group_hdm', 'sistem', 'tdee']);
    expect(await ents(u)).toEqual(r.entitlements);
    const [row] = await q('select status, claimed_by from purchases where id = $1', [p.row.id]);
    expect(row.status).toBe('dituntut');
    expect(row.claimed_by).toBe(u);
    const [prof] = await q('select email, phone, full_name from profiles where id = $1', [u]);
    expect(prof).toEqual({ email: e, phone: '60123456789', full_name: 'Ali' });
    const chk = (await q('select register_check($1,$2) as r', [e, '60123456789']))[0].r;
    expect(chk.profile_exists).toBe(true);
  });

  test('register_complete without matching purchase -> tiada_pembelian, no profile', async () => {
    const u = fresh();
    const r = (await q('select register_complete($1,$2,$3,$4) as r', [u, newEmail(), '0123456789', 'X']))[0].r;
    expect(r).toEqual({ ok: false, reason: 'tiada_pembelian' });
    expect(await q('select 1 from profiles where id = $1', [u])).toHaveLength(0);
  });

  test('A buyer later buys B (same email+phone) -> auto-claimed, 12 keys', async () => {
    const e = newEmail(), u = fresh();
    await upsert(purchase({ email: e }));
    await q('select register_complete($1,$2,$3,$4)', [u, e, '0123456789', 'Ali']);
    expect(await ents(u)).toHaveLength(5);
    const b = await upsert(purchase({ email: e, package_id: 'complete', amount_rm: 150 }));
    expect(b.row.status).toBe('dituntut');
    expect(b.row.claimed_by).toBe(u);
    expect(await ents(u)).toHaveLength(12);
  });

  test('register_complete with email already on another uid -> sudah_didaftar', async () => {
    const e = newEmail(), u1 = fresh(), u2 = fresh();
    await upsert(purchase({ email: e }));
    expect((await q('select register_complete($1,$2,$3,$4) as r', [u1, e, '0123456789', 'Ali']))[0].r.ok).toBe(true);
    const r = (await q('select register_complete($1,$2,$3,$4) as r', [u2, e, '0123456789', 'Ali']))[0].r;
    expect(r).toEqual({ ok: false, reason: 'sudah_didaftar' });
    expect(await q('select 1 from profiles where id = $1', [u2])).toHaveLength(0);
  });

  test('concurrent register_complete for same email -> one ok, one sudah_didaftar', async () => {
    const e = newEmail(), u1 = fresh(), u2 = fresh();
    await upsert(purchase({ email: e }));
    const call = (u: string) => q('select register_complete($1,$2,$3,$4) as r', [u, e, '0123456789', 'Ali']).then((x) => x[0].r);
    const rs = await Promise.all([call(u1), call(u2)]);
    expect(rs.filter((r) => r.ok)).toHaveLength(1);
    expect(rs.filter((r) => !r.ok && r.reason === 'sudah_didaftar')).toHaveLength(1);
  });

  test('same uid re-completing is idempotent', async () => {
    const e = newEmail(), u = fresh();
    await upsert(purchase({ email: e }));
    await q('select register_complete($1,$2,$3,$4)', [u, e, '0123456789', 'Ali']);
    const r = (await q('select register_complete($1,$2,$3,$4) as r', [u, e, '0123456789', 'Ali']))[0].r;
    expect(r.ok).toBe(true);
    expect(r.entitlements).toHaveLength(5);
  });
});

describe('rate limit', () => {
  test('5 failures then rate_blocked -> true; other subject false', async () => {
    const s = newSubject(), other = newSubject();
    const blocked = async (x: string) => (await q('select rate_blocked($1,$2::text[]) as b', ['register', [x]]))[0].b;
    for (let i = 0; i < 4; i++) await q('select rate_record($1,$2::text[],false)', ['register', [s]]);
    expect(await blocked(s)).toBe(false);
    await q('select rate_record($1,$2::text[],false)', ['register', [s]]);
    expect(await blocked(s)).toBe(true);
    expect(await blocked(other)).toBe(false);
    // any-subject semantics
    expect((await q('select rate_blocked($1,$2::text[]) as b', ['register', [other, s]]))[0].b).toBe(true);
    // other kind unaffected
    expect((await q('select rate_blocked($1,$2::text[]) as b', ['code', [s]]))[0].b).toBe(false);
  });

  test('successes and old failures do not count', async () => {
    const s = newSubject();
    for (let i = 0; i < 6; i++) await q('select rate_record($1,$2::text[],true)', ['register', [s]]);
    expect((await q('select rate_blocked($1,$2::text[]) as b', ['register', [s]]))[0].b).toBe(false);
    for (let i = 0; i < 5; i++) await q("insert into rate_attempts (kind, subject, ok, at) values ('register',$1,false, now() - interval '16 minutes')", [s]);
    expect((await q('select rate_blocked($1,$2::text[]) as b', ['register', [s]]))[0].b).toBe(false);
  });
});
