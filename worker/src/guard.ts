import { createMiddleware } from 'hono/factory';
import type { AppEnv, Deps } from './types';
import { fail } from './errors';
import { verifySigHeader } from './hmac';

export const SIGNATURE_HEADER = 'X-Signature';

/** Verifies the Firebase ID token, then loads roles + profile existence in ONE query. */
export const requireUser = (deps: Deps) =>
  createMiddleware<AppEnv>(async (c, next) => {
    const m = /^Bearer\s+(\S+)$/i.exec(c.req.header('Authorization') ?? '');
    if (!m) return fail(c, 401, 'perlu_log_masuk');
    let who: { uid: string; email: string } | null = null;
    try {
      who = await deps.verifyToken(m[1]);
    } catch {
      who = null;
    }
    if (!who || !who.uid) return fail(c, 401, 'perlu_log_masuk');

    const row = await deps.hive.one<{ roles: string[] | null; has_profile: boolean }>(
      'select roles_for($1) as roles, exists(select 1 from profiles where id = $1) as has_profile',
      [who.uid],
    );
    if (!row.has_profile) return fail(c, 403, 'tiada_profil');
    c.set('user', { uid: who.uid, email: who.email, roles: row.roles ?? [], hasProfile: true });
    await next();
  });

/** Must run after requireUser. Passes if the user holds ANY of the given roles. */
export const requireRole = (...roles: string[]) =>
  createMiddleware<AppEnv>(async (c, next) => {
    const user = c.get('user');
    if (!user || !user.roles.some((r) => roles.includes(r))) return fail(c, 403, 'tiada_kebenaran');
    await next();
  });

/** Server-to-server (Apps Script) calls: HMAC over the raw body, 300s window. */
export const requireInternal = (deps: Deps) =>
  createMiddleware<AppEnv>(async (c, next) => {
    const header = c.req.header(SIGNATURE_HEADER) ?? '';
    const body = await c.req.text();
    const good = await verifySigHeader(deps.secrets.internal, header, body, Math.floor(deps.now() / 1000));
    if (!good) return fail(c, 401, 'perlu_log_masuk');
    await next();
  });
