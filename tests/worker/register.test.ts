// POST /api/register: Firebase accounts only for real buyers (email + phone match a purchase).
import { describe, test, expect, afterAll } from 'vitest';
import {
  makeApp, call, q, fakeFirebase, unclaimedPurchase, randomPhone, newIp, rnd, profile, cleanupAll,
} from './fixtures';
import type { Hive } from '../../worker/src/types';
import { pgHive } from './pgHive';

afterAll(cleanupAll);

const BASIC = ['ebook_strategi', 'graduation', 'group_hdm', 'sistem', 'tdee'];
const MSG_TIADA = 'Emel/telefon ini tiada rekod pembelian. Pastikan sama seperti semasa beli di BCL, atau WhatsApp 60134417042.';
const MSG_SUDAH = 'Emel ini sudah ada akaun. Sila log masuk atau tekan Lupa Kata Laluan.';
const MSG_RATE = 'Terlalu banyak cubaan. Cuba lagi selepas 15 minit.';

const buyer = () => ({ email: `test_${rnd()}@example.test`, phone: randomPhone() });
const localPhone = (p: string) => '0' + p.slice(2, 4) + '-' + p.slice(4); // 601x... -> 01x-...

function body(b: { email: string; phone: string }, extra: Record<string, unknown> = {}) {
  return { email: b.email, phone: b.phone, name: 'Pembeli Ujian', password: 'rahsia123', privacyAck: true, ...extra };
}

describe('POST /api/register', () => {
  test('register with matching purchase -> createUser called, profile created, entitlements basic', async () => {
    const fb = fakeFirebase();
    const app = makeApp({ firebaseAdmin: fb.admin });
    const b = buyer();
    const ref = await unclaimedPurchase(b.email, b.phone);
    // user types upper-case email and local phone format: both normalised before matching
    const res = await call(app, 'POST', '/api/register', {
      ip: newIp(), body: body({ email: `  ${b.email.toUpperCase()} `, phone: localPhone(b.phone) }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.data.entitlements).toEqual(BASIC);
    expect(fb.calls.created).toHaveLength(1);
    const uid = fb.calls.created[0];
    expect(fb.users.get(b.email)?.displayName).toBe('Pembeli Ujian');
    const p = (await q('select email, phone, full_name from profiles where id = $1', [uid]))[0];
    expect(p).toEqual({ email: b.email, phone: b.phone, full_name: 'Pembeli Ujian' });
    expect((await q('select status, claimed_by from purchases where order_ref = $1', [ref]))[0])
      .toEqual({ status: 'dituntut', claimed_by: uid });
    expect((await q(`select entitlements_for($1) as e`, [uid]))[0].e).toEqual(BASIC);
  });

  test('register when orphan Firebase account exists -> orphan deleted, new account, ok', async () => {
    const fb = fakeFirebase();
    const app = makeApp({ firebaseAdmin: fb.admin });
    const b = buyer();
    await unclaimedPurchase(b.email, b.phone);
    const orphan = fb.seed(b.email);
    const res = await call(app, 'POST', '/api/register', { ip: newIp(), body: body(b) });
    expect(res.status).toBe(200);
    expect(fb.calls.deleted).toEqual([orphan]);
    expect(fb.calls.created).toHaveLength(1);
    expect(fb.calls.created[0]).not.toBe(orphan);
    expect(await q('select 1 from profiles where id = $1', [fb.calls.created[0]])).toHaveLength(1);
  });

  test('register when profile exists -> sudah_didaftar, no createUser', async () => {
    const fb = fakeFirebase();
    const app = makeApp({ firebaseAdmin: fb.admin });
    const b = buyer();
    await unclaimedPurchase(b.email, b.phone);
    // first registration succeeds
    expect((await call(app, 'POST', '/api/register', { ip: newIp(), body: body(b) })).status).toBe(200);
    expect(fb.calls.created).toHaveLength(1);
    const res = await call(app, 'POST', '/api/register', { ip: newIp(), body: body(b) });
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ ok: false, reason: 'sudah_didaftar', message: MSG_SUDAH });
    expect(fb.calls.created).toHaveLength(1);
    expect(fb.calls.deleted).toEqual([]);
  });

  test('Firebase account WITH a profile (profile email differs) -> sudah_didaftar, nothing deleted', async () => {
    const fb = fakeFirebase();
    const app = makeApp({ firebaseAdmin: fb.admin });
    const b = buyer();
    await unclaimedPurchase(b.email, b.phone);
    const existing = await profile(); // profile email is <uid>@example.test, not b.email
    fb.users.set(b.email, { uid: existing, email: b.email, password: 'x' });
    const res = await call(app, 'POST', '/api/register', { ip: newIp(), body: body(b) });
    expect(res.status).toBe(409);
    expect((await res.json()).reason).toBe('sudah_didaftar');
    expect(fb.calls.deleted).toEqual([]);
    expect(fb.calls.created).toEqual([]);
  });

  test('no purchase -> 400 tiada_pembelian with BM message; no Firebase account', async () => {
    const fb = fakeFirebase();
    const app = makeApp({ firebaseAdmin: fb.admin });
    const res = await call(app, 'POST', '/api/register', { ip: newIp(), body: body(buyer()) });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ ok: false, reason: 'tiada_pembelian', message: MSG_TIADA });
    expect(fb.calls.created).toEqual([]);
  });

  test('register no purchase x6 from same IP -> 6th terlalu_banyak_cubaan', async () => {
    const fb = fakeFirebase();
    const app = makeApp({ firebaseAdmin: fb.admin });
    const ip = newIp();
    for (let i = 0; i < 5; i++) {
      const res = await call(app, 'POST', '/api/register', { ip, body: body(buyer()) });
      expect(res.status).toBe(400);
      expect((await res.json()).reason).toBe('tiada_pembelian');
    }
    // even a real buyer is blocked from this IP now
    const b = buyer();
    await unclaimedPurchase(b.email, b.phone);
    const res = await call(app, 'POST', '/api/register', { ip, body: body(b) });
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ ok: false, reason: 'terlalu_banyak_cubaan', message: MSG_RATE });
    expect(fb.calls.created).toEqual([]);
    expect((await q(`select count(*)::int n from rate_attempts where kind = 'register' and subject = $1 and not ok`, [ip]))[0].n).toBe(5);
  });

  test('register SQL failure after createUser -> deleteUser called (no stray account)', async () => {
    const fb = fakeFirebase();
    // pg Hive that fails register_complete only
    const failing: Hive = {
      ...pgHive,
      json: (async (sql: string, params?: unknown[]) => {
        if (/register_complete/.test(sql)) throw new Error('hive: simulated failure');
        return pgHive.json(sql, params);
      }) as Hive['json'],
    };
    const app = makeApp({ firebaseAdmin: fb.admin, hive: failing });
    const b = buyer();
    await unclaimedPurchase(b.email, b.phone);
    const res = await call(app, 'POST', '/api/register', { ip: newIp(), body: body(b) });
    expect(res.status).toBe(500);
    expect(fb.calls.created).toHaveLength(1);
    expect(fb.calls.deleted).toEqual(fb.calls.created);
    expect(fb.users.has(b.email)).toBe(false);
  });

  test('register_complete gets the created account email, never another body field', async () => {
    const fb = fakeFirebase();
    const seen: unknown[][] = [];
    const spy: Hive = {
      ...pgHive,
      json: (async (sql: string, params?: unknown[]) => {
        if (/register_complete/.test(sql)) seen.push(params ?? []);
        return pgHive.json(sql, params);
      }) as Hive['json'],
    };
    const app = makeApp({ firebaseAdmin: fb.admin, hive: spy });
    const b = buyer();
    await unclaimedPurchase(b.email, b.phone);
    const res = await call(app, 'POST', '/api/register', {
      ip: newIp(), body: body({ email: b.email.toUpperCase(), phone: b.phone }, { Email: 'evil@example.test', p_email: 'evil@example.test' }),
    });
    expect(res.status).toBe(200);
    expect(seen).toHaveLength(1);
    expect(seen[0][0]).toBe(fb.calls.created[0]);
    expect(seen[0][1]).toBe(b.email);
    expect(seen[0][2]).toBe(b.phone);
  });

  test.each([
    ['short password', { password: 'pendek7' }],
    ['privacyAck missing', { privacyAck: undefined }],
    ['privacyAck string', { privacyAck: 'true' }],
    ['bad email', { email: 'bukan-emel' }],
    ['bad phone', { phone: '12345' }],
    ['empty name', { name: '   ' }],
  ])('%s -> 400 data_tidak_sah, no Firebase call', async (_n, extra) => {
    const fb = fakeFirebase();
    const app = makeApp({ firebaseAdmin: fb.admin });
    const b = buyer();
    await unclaimedPurchase(b.email, b.phone);
    const res = await call(app, 'POST', '/api/register', { ip: newIp(), body: body(b, extra) });
    expect(res.status).toBe(400);
    const j = await res.json();
    expect(j.reason).toBe('data_tidak_sah');
    expect(typeof j.message).toBe('string');
    expect(fb.calls.created).toEqual([]);
  });
});
