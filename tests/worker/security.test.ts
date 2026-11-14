// Security suite. The Worker is the ONLY security boundary (HornetHive has no RLS): uid comes from
// the verified token only, never from body/query. Every participant route must be listed in ROUTES.
import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import {
  makeApp, call, q, profile, purchase, accessCode, ebookId, newIp, cleanupAll,
} from './fixtures';

const app = makeApp();
afterAll(cleanupAll);

const PLACEHOLDER_EBOOK = '00000000-0000-0000-0000-000000000000';

type Route = { method: string; path: (ebook: string) => string; body?: Record<string, unknown> };

/** EVERY participant route. Adding a route without adding it here is a review failure. */
const ROUTES: Route[] = [
  { method: 'GET', path: () => '/api/me' },
  { method: 'PUT', path: () => '/api/me/onboarding',
    body: { sex: 'L', birth_year: 1990, height_cm: 170, start_weight_kg: 80, activity_level: 2, health_ack: true, privacy_ack: true } },
  { method: 'PUT', path: () => '/api/me/targets', body: { tdee_kcal: 2400, kcal_target: 1900, protein_target_g: 140 } },
  { method: 'PUT', path: () => '/api/me/name', body: { full_name: 'Nama A' } },
  { method: 'GET', path: () => '/api/me/access' },
  { method: 'GET', path: () => '/api/groups' },
  { method: 'POST', path: () => '/api/codes/redeem', body: { code: 'HDMB-AAAA-AAAA' } },
  { method: 'POST', path: (e) => `/api/ebook/${e}/ticket` },
  { method: 'PUT', path: (e) => `/api/ebook/${e}/progress`, body: { last_page: 7, finished: false } },
];
const label = (r: Route) => `${r.method} ${r.path(':id')}`;

/** Representative admin paths (Task 8 must extend this with every real /api/admin/* route). */
const ADMIN_ROUTES: [string, string][] = [
  ['GET', '/api/admin/ping'],
  ['GET', '/api/admin/users'],
  ['POST', '/api/admin/codes/generate'],
  ['PUT', '/api/admin/settings/support_wa'],
  ['DELETE', '/api/admin/users/x'],
];

let A = '';
let B = '';
let NOPKG = '';
let e1 = '';
let e2 = '';

beforeAll(async () => {
  A = await profile();
  B = await profile();
  NOPKG = await profile();
  await purchase(A, 'basic');
  await purchase(B, 'complete');
  e1 = await ebookId('ebook_strategi');
  e2 = await ebookId('ebook_muscle_mania');
  // B has state that A must never be able to read or change
  await q("update profiles set full_name = 'Nama B', tdee_kcal = 3000, sex = 'P' where id = $1", [B]);
  await q('select save_reading($1, $2, 3, false)', [B, e1]);
  const code = await accessCode('basic');
  await q('select redeem_code($1, $2)', [B, code]);
});

const snapshotB = async () => ({
  profile: (await q('select * from profiles where id = $1', [B]))[0],
  reading: await q('select ebook_id, last_page, finished_at, updated_at from reading_progress where user_id = $1 order by ebook_id', [B]),
  codes: await q('select id, status from access_codes where redeemed_by = $1 order by id', [B]),
  rate: await q('select count(*)::int as n from rate_attempts where subject = $1', [B]),
});

describe('authentication', () => {
  test.each(ROUTES.map((r) => [label(r), r] as const))('%s without token -> 401', async (_l, r) => {
    const res = await call(app, r.method, r.path(PLACEHOLDER_EBOOK), { body: r.body, ip: newIp() });
    expect(res.status).toBe(401);
    expect((await res.json()).reason).toBe('perlu_log_masuk');
  });

  test.each(ROUTES.map((r) => [label(r), r] as const))('%s with invalid token -> 401', async (_l, r) => {
    const res = await app.request(r.path(PLACEHOLDER_EBOOK), {
      method: r.method,
      headers: { Authorization: 'Bearer forged', 'Content-Type': 'application/json' },
      body: r.body ? JSON.stringify(r.body) : undefined,
    });
    expect(res.status).toBe(401);
  });

  test.each(ROUTES.map((r) => [label(r), r] as const))('%s with valid token but no profile -> 403', async (_l, r) => {
    const res = await call(app, r.method, r.path(PLACEHOLDER_EBOOK), { uid: 'test_noprofile_x', body: r.body, ip: newIp() });
    expect(res.status).toBe(403);
    expect((await res.json()).reason).toBe('tiada_profil');
  });
});

describe('uid from token only', () => {
  test.each(ROUTES.map((r) => [label(r), r] as const))(
    '%s as A with user_id/uid=B in body and query: B untouched, B never in response',
    async (_l, r) => {
      const before = await snapshotB();
      const path = `${r.path(e1)}?uid=${B}&user_id=${B}`;
      const body = r.body ? { ...r.body, user_id: B, uid: B, id: B } : undefined;
      const res = await call(app, r.method, path, { uid: A, body, ip: newIp() });
      expect(res.status).toBeLessThan(500);
      const text = await res.text();
      expect(text).not.toContain(B);
      expect(text).not.toContain('Nama B');
      expect(await snapshotB()).toEqual(before);
    },
  );

  test('A PUT progress with body user_id=B -> only A row changes', async () => {
    const res = await call(app, 'PUT', `/api/ebook/${e1}/progress`, { uid: A, body: { last_page: 42, finished: true, user_id: B } });
    expect(res.status).toBe(200);
    expect((await q('select last_page from reading_progress where user_id=$1 and ebook_id=$2', [A, e1]))[0].last_page).toBe(42);
    const b = (await q('select last_page, finished_at from reading_progress where user_id=$1 and ebook_id=$2', [B, e1]))[0];
    expect(b).toEqual({ last_page: 3, finished_at: null });
  });

  test('A GET /api/me never contains B data even with ?uid=B', async () => {
    const res = await call(app, 'GET', `/api/me?uid=${B}&user_id=${B}`, { uid: A });
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).not.toContain(B);
    expect(text).not.toContain('Nama B');
    const d = JSON.parse(text).data;
    expect(d.profile.id).toBe(A);
    expect(d.reading.every((r: any) => r.user_id === A)).toBe(true);
  });
});

describe('entitlement gates', () => {
  test('basic user ticket for ebook 02 -> 403, body has no ticket', async () => {
    const res = await call(app, 'POST', `/api/ebook/${e2}/ticket`, { uid: A });
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body).toEqual({ ok: false, reason: 'tiada_akses', message: 'Ebook ini tersedia dalam Pakej Complete.' });
    expect(JSON.stringify(body)).not.toContain('ticket');
  });

  test('basic user /api/groups: muscle mania invite_url null', async () => {
    const res = await call(app, 'GET', '/api/groups', { uid: A });
    expect(res.status).toBe(200);
    const g = (await res.json()).data as any[];
    const mm = g.find((x) => x.item_key === 'group_muscle_mania');
    expect(mm.locked).toBe(true);
    expect(mm.invite_url).toBeNull();
    expect(g.find((x) => x.item_key === 'group_hdm').invite_url).toMatch(/^https:\/\//);
  });

  test('user without tdee PUT /api/me/targets -> 403 tiada_akses, nothing saved', async () => {
    const res = await call(app, 'PUT', '/api/me/targets', {
      uid: NOPKG, body: { tdee_kcal: 2400, kcal_target: 1900, protein_target_g: 140 },
    });
    expect(res.status).toBe(403);
    expect((await res.json()).reason).toBe('tiada_akses');
    expect((await q('select tdee_kcal from profiles where id=$1', [NOPKG]))[0].tdee_kcal).toBeNull();
  });
});

describe('admin boundary', () => {
  test.each(ADMIN_ROUTES)('participant %s %s -> 403', async (method, path) => {
    const res = await call(app, method, path, { uid: A, body: method === 'GET' ? undefined : {} });
    expect(res.status).toBe(403);
    expect((await res.json()).reason).toBe('tiada_kebenaran');
  });

  test.each(ADMIN_ROUTES)('no token %s %s -> 401', async (method, path) => {
    const res = await call(app, method, path);
    expect(res.status).toBe(401);
  });
});
