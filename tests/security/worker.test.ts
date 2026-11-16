// Worker security suite against an in-memory fake Hive (no database): runs in `npm test`, so it gates every
// `node scripts/deploy.mjs` (incl. --worker). The DB-backed suite (tests/worker/security.test.ts) adds the data
// checks (uid from token only, entitlement gates) and is for pre-launch only.
import { describe, test, expect } from 'vitest';
import { createApp } from '../../worker/src/app';
import { jsonCell } from '../../worker/src/hive';
import type { Deps, Hive, FirebaseAdmin } from '../../worker/src/types';
import {
  ROUTES, label, ADMIN_ROUTE_LIST, INTERNAL_ROUTES, PUBLIC_ROUTES, UNROUTED_ADMIN, PLACEHOLDER_ID, concrete, routeKeys,
} from '../shared/routes';

const ROLES_SQL = /^select jsonb_build_object\('roles', to_jsonb\(roles_for\(\$1\)\)/;

/** profiles: uid -> roles. Every other query answers `{}` and is recorded, so tests can prove it never ran. */
function fakeHive(profiles: Record<string, string[]>) {
  const other: string[] = [];
  const q = async (sql: string, params: unknown[] = []) => {
    if (ROLES_SQL.test(sql)) {
      const uid = String(params[0]);
      const has = uid in profiles;
      return [{ r: JSON.stringify({ roles: has ? profiles[uid] : [], has_profile: has }) }] as never[];
    }
    other.push(sql);
    return [{ r: '{}' }] as never[];
  };
  const one = (async (sql: string, params?: unknown[]) => (await q(sql, params))[0]) as Hive['one'];
  const hive: Hive = {
    q: q as Hive['q'],
    one,
    json: (async (sql: string, params?: unknown[]) => jsonCell(await one(sql, params))) as Hive['json'],
  };
  return { hive, other };
}

const P = 'test_participant';
const COACH = 'test_coach';
const SA = 'test_superadmin';
const fake = fakeHive({ [P]: [], [COACH]: ['coach'], [SA]: ['superadmin'] });
const outbound: string[] = [];
const deps: Deps = {
  verifyToken: async (tok) => {
    const m = /^tok:(.+)$/.exec(tok);
    return m ? { uid: m[1], email: `${m[1]}@example.test` } : null;
  },
  hive: fake.hive,
  firebaseAdmin: {} as FirebaseAdmin,
  secrets: { internal: 'int-secret', ticket: 'tk-secret' },
  gasUrl: 'https://gas.test/exec',
  now: () => Date.now(),
  allowedOrigins: [],
  fetch: (async (url: string | URL | Request) => {
    outbound.push(String(url));
    return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
  }) as typeof fetch,
};
const app = createApp(deps);

const call = (method: string, path: string, uid?: string, body?: unknown) =>
  app.request(path, {
    method,
    headers: {
      ...(uid ? { Authorization: `Bearer tok:${uid}` } : {}),
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

const ADMIN_ROUTES: [string, string][] = [
  ...ADMIN_ROUTE_LIST.map((r) => [r.method, concrete(r.pattern, 'test_someone')] as [string, string]),
  ...UNROUTED_ADMIN,
];
const bodyFor = (m: string) => (m === 'GET' ? undefined : {});

describe('route inventory', () => {
  test('every /api/ route is listed (and no stale entries)', () => {
    const listed = new Set([
      ...ROUTES.map(label),
      ...ADMIN_ROUTE_LIST.map((r) => `${r.method} ${r.pattern}`),
      ...PUBLIC_ROUTES,
    ]);
    const routes = routeKeys(app, '/api/');
    expect(routes.filter((x) => !listed.has(x)), 'unlisted routes').toEqual([]);
    expect([...listed].filter((x) => !routes.includes(x)), 'stale entries').toEqual([]);
  });

  test('every /internal/ route is listed and rejects an unsigned or forged request with 401', async () => {
    const routes = routeKeys(app, '/internal/');
    expect(routes, 'INTERNAL_ROUTES out of date').toEqual([...INTERNAL_ROUTES].sort());
    for (const r of routes) {
      const [m, p] = r.split(' ');
      const path = p.replace(':id', PLACEHOLDER_ID);
      const body = m === 'GET' ? undefined : '{}';
      expect((await app.request(path, { method: m, body })).status, r).toBe(401);
      const forged = await app.request(path, { method: m, body, headers: { 'X-HDM-Sig': `t=${Math.floor(Date.now() / 1000)},v1=${'0'.repeat(64)}` } });
      expect(forged.status, `${r} forged`).toBe(401);
    }
    expect(fake.other, 'no SQL before the signature check').toEqual([]);
  });
});

describe('authentication', () => {
  test.each(ROUTES.map((r) => [label(r), r] as const))('%s without token -> 401', async (_l, r) => {
    const res = await call(r.method, r.path(PLACEHOLDER_ID), undefined, r.body);
    expect(res.status).toBe(401);
    expect((await res.json()).reason).toBe('perlu_log_masuk');
  });

  test.each(ROUTES.map((r) => [label(r), r] as const))('%s with forged token -> 401', async (_l, r) => {
    const res = await app.request(r.path(PLACEHOLDER_ID), {
      method: r.method, headers: { Authorization: 'Bearer forged', 'Content-Type': 'application/json' },
      body: r.body ? JSON.stringify(r.body) : undefined,
    });
    expect(res.status).toBe(401);
  });

  test.each(ROUTES.map((r) => [label(r), r] as const))('%s with valid token but no profile -> 403', async (_l, r) => {
    const res = await call(r.method, r.path(PLACEHOLDER_ID), 'test_noprofile', r.body);
    expect(res.status).toBe(403);
    expect((await res.json()).reason).toBe('tiada_profil');
  });

  test('/api body over 16 KB -> 413', async () => {
    const res = await call('POST', '/api/register', undefined, { email: 'a'.repeat(17 * 1024) });
    expect(res.status).toBe(413);
  });
});

describe('admin boundary', () => {
  test.each(ADMIN_ROUTES)('no token %s %s -> 401', async (method, path) => {
    expect((await call(method, path, undefined, bodyFor(method))).status).toBe(401);
  });

  test.each(ADMIN_ROUTES)('participant %s %s -> 403, no admin SQL, no outbound call', async (method, path) => {
    const before = fake.other.length;
    const out = outbound.length;
    const res = await call(method, path, P, bodyFor(method));
    expect(res.status).toBe(403);
    expect((await res.json()).reason).toBe('tiada_kebenaran');
    expect(fake.other.length).toBe(before);
    expect(outbound.length).toBe(out);
  });

  test.each(ADMIN_ROUTE_LIST.map((r) => [r.method, r.pattern, r] as const))('coach %s %s', async (_m, _p, r) => {
    const before = fake.other.length;
    const res = await call(r.method, concrete(r.pattern, COACH), COACH, bodyFor(r.method));
    if (r.coach) {
      expect(res.status).toBe(200);
    } else {
      expect(res.status).toBe(403);
      expect((await res.json()).reason).toBe('tiada_kebenaran');
      expect(fake.other.length, 'no admin SQL for a refused coach').toBe(before);
    }
  });

  test.each(UNROUTED_ADMIN)('coach / superadmin on unrouted %s %s -> 403 / 404', async (method, path) => {
    expect((await call(method, path, COACH, bodyFor(method))).status).toBe(403);
    expect((await call(method, path, SA, bodyFor(method))).status).toBe(404);
  });

  test('coach: method / case / suffix variants of coach routes stay closed', async () => {
    for (const [m, p] of [['POST', '/api/admin/summary'], ['GET', '/api/admin/participants/x/grant'], ['GET', '/api/admin/SUMMARY'],
      ['POST', `/api/admin/participants/${P}`], ['GET', '/api/admin/orders/orphans'], ['POST', '/api/admin/orders/x/reprocess']]) {
      expect((await call(m, p, COACH, m === 'GET' ? undefined : {})).status, `${m} ${p}`).toBe(403);
    }
  });
});
