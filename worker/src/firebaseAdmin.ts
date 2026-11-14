// Firebase Admin over the Identity Toolkit REST API (no firebase-admin SDK on Workers).
// Auth: OAuth2 JWT-bearer grant. The assertion is an RS256 JWT signed with the service account key from
// FIREBASE_SA_JSON; the access token is cached until ~60 s before it expires.
import { importPKCS8, SignJWT } from 'jose';
import type { FirebaseAdmin } from './types';

export const TOKEN_URL = 'https://oauth2.googleapis.com/token';
export const SCOPE = 'https://www.googleapis.com/auth/identitytoolkit';
const IDT = 'https://identitytoolkit.googleapis.com/v1';
const ASSERTION_TTL = 3600;
const REFRESH_MARGIN_SEC = 60;

export type ServiceAccount = { client_email: string; private_key: string; private_key_id?: string; project_id?: string };

/** The signed JWT assertion exchanged for an access token. */
export async function buildAssertion(sa: ServiceAccount, nowSec: number): Promise<string> {
  const key = await importPKCS8(sa.private_key, 'RS256');
  const header: { alg: 'RS256'; typ: 'JWT'; kid?: string } = { alg: 'RS256', typ: 'JWT' };
  if (sa.private_key_id) header.kid = sa.private_key_id;
  return new SignJWT({ scope: SCOPE })
    .setProtectedHeader(header)
    .setIssuer(sa.client_email)
    .setAudience(TOKEN_URL)
    .setIssuedAt(nowSec)
    .setExpirationTime(nowSec + ASSERTION_TTL)
    .sign(key);
}

/** Error carrying the Identity Toolkit code (e.g. EMAIL_EXISTS, USER_NOT_FOUND) in `.code`. */
export class FirebaseAdminError extends Error {
  constructor(public code: string, status: number) {
    super(`firebase: ${code} (HTTP ${status})`);
  }
}

export function createFirebaseAdmin(opts: {
  saJson: string;
  projectId?: string;
  fetch?: typeof fetch;
  now?: () => number;
}): FirebaseAdmin {
  const f = opts.fetch ?? ((...a: Parameters<typeof fetch>) => fetch(...a));
  const now = opts.now ?? (() => Date.now());
  let sa: ServiceAccount | null = null;
  let cached: { token: string; expSec: number } | null = null;

  const account = (): ServiceAccount => {
    if (!sa) {
      const parsed = JSON.parse(opts.saJson || '{}');
      if (!parsed.client_email || !parsed.private_key) throw new Error('FIREBASE_SA_JSON is missing client_email/private_key');
      sa = parsed as ServiceAccount;
    }
    return sa;
  };
  const projectId = () => {
    const p = opts.projectId || account().project_id;
    if (!p) throw new Error('Firebase project id not configured');
    return p;
  };

  async function accessToken(): Promise<string> {
    const nowSec = Math.floor(now() / 1000);
    if (cached && nowSec < cached.expSec - REFRESH_MARGIN_SEC) return cached.token;
    const assertion = await buildAssertion(account(), nowSec);
    const res = await f(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }).toString(),
    });
    const j = (await res.json().catch(() => ({}))) as { access_token?: string; expires_in?: number; error?: string };
    if (!res.ok || !j.access_token) throw new Error(`firebase: token exchange failed (HTTP ${res.status} ${j.error ?? ''})`);
    cached = { token: j.access_token, expSec: nowSec + (Number(j.expires_in) || 3600) };
    return cached.token;
  }

  async function call<T>(path: string, body: unknown): Promise<T> {
    const res = await f(`${IDT}/projects/${encodeURIComponent(projectId())}/${path}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${await accessToken()}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const j = (await res.json().catch(() => ({}))) as T & { error?: { message?: string } };
    if (!res.ok) {
      // message looks like "EMAIL_EXISTS" or "WEAK_PASSWORD : Password should be at least 6 characters"
      const code = String(j?.error?.message ?? `HTTP_${res.status}`).split(/\s|:/)[0];
      throw new FirebaseAdminError(code, res.status);
    }
    return j;
  }

  return {
    async getUserByEmail(email) {
      const j = await call<{ users?: { localId: string; email?: string }[] }>('accounts:lookup', { email: [email] });
      const u = j.users?.[0];
      return u ? { uid: u.localId, email: u.email ?? email } : null;
    },
    async createUser({ email, password, displayName }) {
      const body: Record<string, string> = { email, password };
      if (displayName) body.displayName = displayName;
      const j = await call<{ localId: string; email?: string }>('accounts', body);
      return { uid: j.localId, email: j.email ?? email };
    },
    async deleteUser(uid) {
      await call('accounts:delete', { localId: uid });
    },
    async setPassword(uid, password) {
      await call('accounts:update', { localId: uid, password });
    },
  };
}
