import { describe, test, expect, afterAll } from 'vitest';
import { verifyTicket } from '../../worker/src/hmac';
import {
  makeApp, call, q, profile, purchase, accessCode, randomCode, testEbook, grant, ebookId, newIp,
  cleanupAll, TICKET_SECRET,
} from './fixtures';

const app = makeApp();
afterAll(cleanupAll);

const BASIC = ['ebook_strategi', 'graduation', 'group_hdm', 'sistem', 'tdee'];

describe('GET /api/me (app_bootstrap)', () => {
  test('bootstrap shape for a basic user', async () => {
    const u = await profile();
    await purchase(u, 'basic');
    const res = await call(app, 'GET', '/api/me', { uid: u });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    const d = body.data;
    expect(d.profile.id).toBe(u);
    expect(d.roles).toEqual([]);
    expect(d.entitlements).toEqual(BASIC);
    expect(Array.isArray(d.catalog.items)).toBe(true);
    expect(Array.isArray(d.catalog.ebooks)).toBe(true);
    expect(d.catalog.settings.support_wa).toBe('60134417042');
    expect(Array.isArray(d.reading)).toBe(true);
    for (const e of d.catalog.ebooks) expect(e).not.toHaveProperty('file_drive_id');
  });
});

describe('PUT /api/me/onboarding', () => {
  const good = { sex: 'L', birth_year: 1990, height_cm: 175, start_weight_kg: 85, activity_level: 3, health_ack: true, privacy_ack: true };

  test('valid body saves; acks timestamped', async () => {
    const u = await profile();
    const res = await call(app, 'PUT', '/api/me/onboarding', { uid: u, body: good });
    expect(res.status).toBe(200);
    expect((await res.json()).ok).toBe(true);
    const p = (await q('select sex, height_cm, health_ack_at, privacy_ack_at, onboarded_at from profiles where id=$1', [u]))[0];
    expect(p.sex).toBe('L');
    expect(Number(p.height_cm)).toBe(175);
    expect(p.health_ack_at).not.toBeNull();
    expect(p.privacy_ack_at).not.toBeNull();
    expect(p.onboarded_at).not.toBeNull();
  });

  test.each([
    ['health_ack missing', { ...good, health_ack: undefined }],
    ['privacy_ack false', { ...good, privacy_ack: false }],
    ['health_ack string', { ...good, health_ack: 'true' }],
    ['bad sex', { ...good, sex: 'X' }],
  ])('%s -> 400 data_tidak_sah, nothing saved', async (_n, b) => {
    const u = await profile();
    const res = await call(app, 'PUT', '/api/me/onboarding', { uid: u, body: b });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.reason).toBe('data_tidak_sah');
    expect(typeof body.message).toBe('string');
    expect((await q('select onboarded_at from profiles where id=$1', [u]))[0].onboarded_at).toBeNull();
  });

  test('malformed JSON -> 400 data_tidak_sah', async () => {
    const u = await profile();
    const res = await call(app, 'PUT', '/api/me/onboarding', { uid: u, rawBody: '{not json' });
    expect(res.status).toBe(400);
    expect((await res.json()).reason).toBe('data_tidak_sah');
  });
});

describe('PUT /api/me/targets, /api/me/name, GET /api/me/access, GET /api/groups', () => {
  test('targets saved for a user with tdee', async () => {
    const u = await profile();
    await purchase(u, 'basic');
    const res = await call(app, 'PUT', '/api/me/targets', {
      uid: u, body: { tdee_kcal: 2500, kcal_target: 2000, protein_target_g: 150 },
    });
    expect(res.status).toBe(200);
    expect((await q('select tdee_kcal, kcal_target, protein_target_g from profiles where id=$1', [u]))[0])
      .toEqual({ tdee_kcal: 2500, kcal_target: 2000, protein_target_g: 150 });
  });

  test('targets invalid -> 400 data_tidak_sah', async () => {
    const u = await profile();
    await purchase(u, 'basic');
    const res = await call(app, 'PUT', '/api/me/targets', { uid: u, body: { tdee_kcal: 0, kcal_target: 2000, protein_target_g: 150 } });
    expect(res.status).toBe(400);
    expect((await res.json()).reason).toBe('data_tidak_sah');
  });

  test('name saved (trimmed); empty -> 400', async () => {
    const u = await profile();
    const res = await call(app, 'PUT', '/api/me/name', { uid: u, body: { full_name: '  Ali bin Abu  ' } });
    expect(res.status).toBe(200);
    expect((await res.json()).data).toEqual({ full_name: 'Ali bin Abu' });
    expect((await q('select full_name from profiles where id=$1', [u]))[0].full_name).toBe('Ali bin Abu');
    const bad = await call(app, 'PUT', '/api/me/name', { uid: u, body: { full_name: '   ' } });
    expect(bad.status).toBe(400);
    expect((await bad.json()).reason).toBe('data_tidak_sah');
  });

  test('access lists own purchases and codes', async () => {
    const u = await profile();
    await purchase(u, 'basic');
    const res = await call(app, 'GET', '/api/me/access', { uid: u });
    expect(res.status).toBe(200);
    const d = (await res.json()).data;
    expect(d.purchases).toHaveLength(1);
    expect(d.purchases[0].package_name).toBe('Pakej Basic');
    expect(d.codes).toEqual([]);
  });

  test('groups for a complete user: both unlocked with invite urls', async () => {
    const u = await profile();
    await purchase(u, 'complete');
    const res = await call(app, 'GET', '/api/groups', { uid: u });
    expect(res.status).toBe(200);
    const g = (await res.json()).data as any[];
    for (const key of ['group_hdm', 'group_muscle_mania']) {
      const x = g.find((r) => r.item_key === key);
      expect(x.locked).toBe(false);
      expect(x.invite_url).toMatch(/^https:\/\//);
    }
  });
});

describe('POST /api/codes/redeem', () => {
  test('lowercase / unhyphenated code is normalised and redeemed -> items', async () => {
    const u = await profile();
    const ip = newIp();
    const code = await accessCode('basic');
    const typed = code.replace(/-/g, ' ').toLowerCase();
    const res = await call(app, 'POST', '/api/codes/redeem', { uid: u, ip, body: { code: typed } });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.data.items).toEqual(BASIC);
    expect((await q('select status, redeemed_by from access_codes where code=$1', [code]))[0])
      .toEqual({ status: 'aktif', redeemed_by: u });
  });

  test('reasons map to BM messages', async () => {
    const u = await profile();
    const ip = newIp();
    const used = await accessCode('basic');
    const other = await profile();
    expect((await call(app, 'POST', '/api/codes/redeem', { uid: other, ip: newIp(), body: { code: used } })).status).toBe(200);
    const cancelled = await accessCode('basic', { status: 'dibatalkan' });
    const expired = await accessCode('basic', { endsAt: new Date(Date.now() - 86400e3).toISOString() });
    const cases: [unknown, string, string][] = [
      ['not-a-code', 'tidak_sah', 'Kod tidak sah. Semak semula kod anda.'],
      [used, 'sudah_digunakan', 'Kod ini telah digunakan.'],
      [cancelled, 'dibatalkan', 'Kod ini telah dibatalkan, sila hubungi admin.'],
      [expired, 'tamat_tempoh', 'Kod ini telah tamat tempoh, sila hubungi admin.'],
    ];
    for (const [code, reason, message] of cases) {
      const res = await call(app, 'POST', '/api/codes/redeem', { uid: u, ip, body: { code } });
      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({ ok: false, reason, message });
    }
  });

  test('redeem ok, then 5 bad attempts, 6th -> 429 terlalu_banyak_cubaan', async () => {
    const u = await profile();
    const ip = newIp();
    const good = await accessCode('basic');
    expect((await call(app, 'POST', '/api/codes/redeem', { uid: u, ip, body: { code: good } })).status).toBe(200);
    for (let i = 0; i < 5; i++) {
      const res = await call(app, 'POST', '/api/codes/redeem', { uid: u, ip, body: { code: randomCode() } });
      expect(res.status).toBe(400);
      expect((await res.json()).reason).toBe('tidak_sah');
    }
    const blocked = await call(app, 'POST', '/api/codes/redeem', { uid: u, ip, body: { code: await accessCode('basic') } });
    expect(blocked.status).toBe(429);
    expect(await blocked.json()).toEqual({
      ok: false, reason: 'terlalu_banyak_cubaan', message: 'Terlalu banyak cubaan. Cuba lagi selepas 15 minit.',
    });
    // the same IP is blocked for a different user too
    const u2 = await profile();
    const viaIp = await call(app, 'POST', '/api/codes/redeem', { uid: u2, ip, body: { code: randomCode() } });
    expect(viaIp.status).toBe(429);
  });
});

describe('ebook ticket + progress', () => {
  test('entitled user gets a ticket carrying fileId; fileId never in the response body', async () => {
    const u = await profile();
    const fileId = `test_file_${Date.now()}`;
    const eb = await testEbook(fileId);
    await grant(u, eb.itemKey);
    const res = await call(app, 'POST', `/api/ebook/${eb.id}/ticket`, { uid: u });
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).not.toContain(fileId);
    const body = JSON.parse(text);
    expect(Object.keys(body.data).sort()).toEqual(['allowDownload', 'ticket', 'updatedAt']);
    expect(body.data.allowDownload).toBe(true);
    expect(typeof body.data.updatedAt).toBe('string');
    const payload = await verifyTicket(TICKET_SECRET, body.data.ticket, Math.floor(Date.now() / 1000));
    expect(payload).toMatchObject({ ebookId: eb.id, fileId, uid: u });
  });

  test('entitled ebook without a file -> 404 tiada_fail; bad id -> 403', async () => {
    const u = await profile();
    await purchase(u, 'complete');
    const e2 = await ebookId('ebook_muscle_mania');
    const hasFile = (await q('select file_drive_id from ebooks where id=$1', [e2]))[0].file_drive_id;
    if (!hasFile) {
      const res = await call(app, 'POST', `/api/ebook/${e2}/ticket`, { uid: u });
      expect(res.status).toBe(404);
      expect((await res.json()).reason).toBe('tiada_fail');
    }
    const bad = await call(app, 'POST', '/api/ebook/not-a-uuid/ticket', { uid: u });
    expect(bad.status).toBe(403);
    expect((await bad.json()).reason).toBe('tiada_akses');
  });

  test('progress saved; finished sets finished_at; locked ebook refused', async () => {
    const u = await profile();
    await purchase(u, 'basic');
    const e1 = await ebookId('ebook_strategi');
    const r1 = await call(app, 'PUT', `/api/ebook/${e1}/progress`, { uid: u, body: { last_page: 4, finished: false } });
    expect(r1.status).toBe(200);
    const r2 = await call(app, 'PUT', `/api/ebook/${e1}/progress`, { uid: u, body: { last_page: 10, finished: true } });
    expect(r2.status).toBe(200);
    const row = (await q('select last_page, finished_at from reading_progress where user_id=$1 and ebook_id=$2', [u, e1]))[0];
    expect(row.last_page).toBe(10);
    expect(row.finished_at).not.toBeNull();
    const bad = await call(app, 'PUT', `/api/ebook/${e1}/progress`, { uid: u, body: { last_page: -1 } });
    expect(bad.status).toBe(400);
    const e2 = await ebookId('ebook_muscle_mania');
    const locked = await call(app, 'PUT', `/api/ebook/${e2}/progress`, { uid: u, body: { last_page: 1 } });
    expect(locked.status).toBe(403);
    expect((await q('select 1 from reading_progress where user_id=$1 and ebook_id=$2', [u, e2]))).toHaveLength(0);
  });
});
