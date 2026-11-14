// Firebase Admin over Identity Toolkit REST: OAuth token from a service-account JWT assertion (RS256).
import { describe, test, expect, beforeAll } from 'vitest';
import { generateKeyPair, exportPKCS8, jwtVerify, decodeProtectedHeader } from 'jose';
import { buildAssertion, createFirebaseAdmin, TOKEN_URL, SCOPE } from '../../worker/src/firebaseAdmin';

let sa = '';
let publicKey: CryptoKey;

beforeAll(async () => {
  const kp = await generateKeyPair('RS256', { extractable: true });
  publicKey = kp.publicKey as CryptoKey;
  sa = JSON.stringify({
    type: 'service_account',
    project_id: 'demo-proj',
    private_key_id: 'kid-1',
    private_key: await exportPKCS8(kp.privateKey),
    client_email: 'svc@demo-proj.iam.gserviceaccount.com',
  });
});

describe('buildAssertion', () => {
  test('claims iss/scope/aud/iat/exp, RS256 with kid; verifies with the public key', async () => {
    const now = 1_800_000_000;
    const jwt = await buildAssertion(JSON.parse(sa), now);
    expect(decodeProtectedHeader(jwt)).toEqual({ alg: 'RS256', typ: 'JWT', kid: 'kid-1' });
    const { payload } = await jwtVerify(jwt, publicKey, { currentDate: new Date(now * 1000) });
    expect(payload).toEqual({
      iss: 'svc@demo-proj.iam.gserviceaccount.com',
      scope: 'https://www.googleapis.com/auth/identitytoolkit',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    });
    expect(TOKEN_URL).toBe('https://oauth2.googleapis.com/token');
    expect(SCOPE).toBe('https://www.googleapis.com/auth/identitytoolkit');
  });
});

type Call = { url: string; body: string; auth: string | null };

function fakeGoogle(responses: Record<string, (body: any) => { status?: number; json: unknown }>) {
  const calls: Call[] = [];
  const f = (async (url: string | URL | Request, init?: RequestInit) => {
    const u = String(url);
    const body = String(init?.body ?? '');
    const h = new Headers(init?.headers);
    calls.push({ url: u, body, auth: h.get('Authorization') });
    const key = Object.keys(responses).find((k) => u.endsWith(k));
    if (!key) return new Response('{}', { status: 404 });
    const parsed = u === TOKEN_URL ? Object.fromEntries(new URLSearchParams(body)) : JSON.parse(body || '{}');
    const r = responses[key](parsed);
    return new Response(JSON.stringify(r.json), { status: r.status ?? 200, headers: { 'Content-Type': 'application/json' } });
  }) as typeof fetch;
  return { f, calls };
}

describe('createFirebaseAdmin', () => {
  test('token minted once and cached until ~60 s before expiry; Identity Toolkit calls carry it', async () => {
    let nowMs = 1_800_000_000_000;
    let n = 0;
    const g = fakeGoogle({
      [TOKEN_URL]: (b) => {
        expect(b.grant_type).toBe('urn:ietf:params:oauth:grant-type:jwt-bearer');
        expect(typeof b.assertion).toBe('string');
        n++;
        return { json: { access_token: `at-${n}`, expires_in: 3600, token_type: 'Bearer' } };
      },
      '/v1/projects/demo-proj/accounts:lookup': (b) =>
        b.email?.[0] === 'ada@example.test' ? { json: { users: [{ localId: 'u1', email: 'ada@example.test' }] } } : { json: {} },
      '/v1/projects/demo-proj/accounts': (b) => ({ json: { localId: 'new1', email: b.email } }),
      '/v1/projects/demo-proj/accounts:delete': () => ({ json: {} }),
      '/v1/projects/demo-proj/accounts:update': () => ({ json: { localId: 'u1' } }),
    });
    const fa = createFirebaseAdmin({ saJson: sa, projectId: 'demo-proj', fetch: g.f, now: () => nowMs });

    expect(await fa.getUserByEmail('ada@example.test')).toEqual({ uid: 'u1', email: 'ada@example.test' });
    expect(await fa.getUserByEmail('tiada@example.test')).toBeNull();
    expect(await fa.createUser({ email: 'b@example.test', password: 'rahsia123', displayName: 'B' })).toEqual({ uid: 'new1', email: 'b@example.test' });
    await fa.deleteUser('u1');
    await fa.setPassword('u1', 'Baru12345x');
    expect(n).toBe(1);
    const tk = g.calls.filter((c) => c.url !== TOKEN_URL);
    expect(tk.every((c) => c.auth === 'Bearer at-1')).toBe(true);
    expect(JSON.parse(tk[2].body)).toEqual({ email: 'b@example.test', password: 'rahsia123', displayName: 'B' });
    expect(JSON.parse(tk[3].body)).toEqual({ localId: 'u1' });
    expect(JSON.parse(tk[4].body)).toEqual({ localId: 'u1', password: 'Baru12345x' });

    nowMs += (3600 - 61) * 1000; // still valid (> 60 s left)
    await fa.getUserByEmail('ada@example.test');
    expect(n).toBe(1);
    nowMs += 2000; // inside the 60 s margin -> refresh
    await fa.getUserByEmail('ada@example.test');
    expect(n).toBe(2);
    expect(g.calls.at(-1)!.auth).toBe('Bearer at-2');
  });

  test('Identity Toolkit error surfaces the Firebase code (EMAIL_EXISTS)', async () => {
    const g = fakeGoogle({
      [TOKEN_URL]: () => ({ json: { access_token: 'at', expires_in: 3600 } }),
      '/v1/projects/demo-proj/accounts': () => ({ status: 400, json: { error: { code: 400, message: 'EMAIL_EXISTS' } } }),
    });
    const fa = createFirebaseAdmin({ saJson: sa, projectId: 'demo-proj', fetch: g.f, now: () => 1_800_000_000_000 });
    await expect(fa.createUser({ email: 'a@example.test', password: 'rahsia123' })).rejects.toMatchObject({ code: 'EMAIL_EXISTS' });
  });
});
