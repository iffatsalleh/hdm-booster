import { describe, test, expect } from 'vitest';
import { createApp } from '../../worker/src/app';
import { signHmac } from '../../worker/src/hmac';
import type { Deps, Hive, FirebaseAdmin } from '../../worker/src/types';

const NOW = 1_800_000_000;

/** In-memory fake: profiles map uid -> roles. Answers requireUser's single query. */
function fakeHive(profiles: Record<string, string[]>): Hive {
  const q = async (sql: string, params: unknown[] = []) => {
    if (/roles_for\(\$1\)/.test(sql)) {
      const uid = String(params[0]);
      const has = uid in profiles;
      return [{ roles: has ? profiles[uid] : [], has_profile: has }] as never[];
    }
    throw new Error('unexpected sql: ' + sql);
  };
  return {
    q: q as Hive['q'],
    one: (async (sql: string, params?: unknown[]) => (await q(sql, params))[0]) as Hive['one'],
  };
}

function makeApp(profiles: Record<string, string[]> = {}) {
  const deps: Deps = {
    verifyToken: async (tok) => {
      const m = /^tok:(.+)$/.exec(tok);
      return m ? { uid: m[1], email: `${m[1]}@x.test` } : null;
    },
    hive: fakeHive(profiles),
    firebaseAdmin: {} as FirebaseAdmin,
    secrets: { internal: 'int-secret', ticket: 'tk-secret' },
    gasUrl: 'https://gas.test',
    now: () => NOW * 1000,
    allowedOrigins: ['https://hdm.blogspot.com', 'http://localhost:5173'],
  };
  return createApp(deps);
}

describe('foundation', () => {
  test('no Authorization -> 401 perlu_log_masuk', async () => {
    const res = await makeApp().request('/api/me');
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ ok: false, reason: 'perlu_log_masuk', message: 'Sila log masuk semula.' });
  });

  test('invalid token -> 401', async () => {
    const res = await makeApp().request('/api/me', { headers: { Authorization: 'Bearer junk' } });
    expect(res.status).toBe(401);
  });

  test('valid token, no profile -> 403 tiada_profil', async () => {
    const res = await makeApp().request('/api/me', { headers: { Authorization: 'Bearer tok:u1' } });
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({
      ok: false,
      reason: 'tiada_profil',
      message: 'Akaun ini belum didaftarkan. Sila daftar di halaman Daftar.',
    });
  });

  test('valid token with profile -> 200 with roles', async () => {
    const res = await makeApp({ u1: ['member'] }).request('/api/me', { headers: { Authorization: 'Bearer tok:u1' } });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      ok: true,
      data: { uid: 'u1', email: 'u1@x.test', roles: ['member'], hasProfile: true },
    });
  });

  test('requireRole: wrong role -> 403 tiada_kebenaran, right role passes', async () => {
    const app = makeApp({ m: ['member'], a: ['admin'] });
    const bad = await app.request('/api/admin/ping', { headers: { Authorization: 'Bearer tok:m' } });
    expect(bad.status).toBe(403);
    expect((await bad.json()).reason).toBe('tiada_kebenaran');
    const ok = await app.request('/api/admin/ping', { headers: { Authorization: 'Bearer tok:a' } });
    expect(ok.status).toBe(200);
  });

  test('internal route without / with stale / with bad signature -> 401, fresh -> 200', async () => {
    const app = makeApp();
    const body = '{"x":1}';
    const post = (sig?: string) =>
      app.request('/internal/ping', {
        method: 'POST',
        body,
        headers: sig ? { 'X-Signature': sig } : {},
      });
    expect((await post()).status).toBe(401);
    const stale = NOW - 1000;
    expect((await post(`t=${stale},v1=${await signHmac('int-secret', stale, body)}`)).status).toBe(401);
    expect((await post(`t=${NOW},v1=${await signHmac('wrong', NOW, body)}`)).status).toBe(401);
    expect((await post(`t=${NOW},v1=${await signHmac('int-secret', NOW, body)}`)).status).toBe(200);
  });

  test('CORS: disallowed origin gets no ACAO; allowed origin does; preflight handled', async () => {
    const app = makeApp();
    const bad = await app.request('/api/me', { headers: { Origin: 'https://evil.test' } });
    expect(bad.headers.get('Access-Control-Allow-Origin')).toBeNull();
    const good = await app.request('/api/me', { headers: { Origin: 'http://localhost:5173' } });
    expect(good.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:5173');
    const pre = await app.request('/api/me', {
      method: 'OPTIONS',
      headers: { Origin: 'http://localhost:5173', 'Access-Control-Request-Method': 'GET' },
    });
    expect(pre.status).toBe(204);
    expect(pre.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:5173');
    const preBad = await app.request('/api/me', {
      method: 'OPTIONS',
      headers: { Origin: 'https://evil.test', 'Access-Control-Request-Method': 'GET' },
    });
    expect(preBad.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });

  test('unknown route -> 404 tiada', async () => {
    const res = await makeApp().request('/nope');
    expect(res.status).toBe(404);
    expect((await res.json()).reason).toBe('tiada');
  });
});
