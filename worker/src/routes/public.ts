// Public routes (no token). Registration creates a Firebase account ONLY for a real buyer: the email +
// phone must match a purchase, and the profile is created with the email of the account we just made.
import { Hono } from 'hono';
import type { AppEnv, Deps } from '../types';
import { fail, ok, readBody } from '../errors';
import { normalizeEmail, normalizePhone } from '../../../src/lib/phone';

const KIND = 'register';
const NAME_MAX = 100;
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 128;
/** A Firebase account with no profile is only treated as an orphan once it is older than this. */
const ORPHAN_GRACE_MS = 10 * 60_000;
const EMAIL_RE =/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Check = { ok: boolean; reason?: string; profile_exists?: boolean };
type Complete = { ok: boolean; reason?: string; entitlements?: string[] };

export function publicRoutes(deps: Deps) {
  const r = new Hono<AppEnv>();

  r.post('/register', async (c) => {
    // rate-limit subject: client IP (never null: falls back to 'unknown')
    const ip = (c.req.header('CF-Connecting-IP') ?? '').trim() || 'unknown';

    const gate = await deps.hive.json<{ blocked: boolean }>(
      `select jsonb_build_object('blocked', rate_blocked($1, array[$2::text]::text[])) as r`,
      [KIND, ip],
    );
    if (gate.blocked) return fail(c, 429, 'terlalu_banyak_cubaan');
    const record = (success: boolean) =>
      deps.hive.json(
        `select jsonb_build_object('ok', true) as r from (select rate_record($1, array[$2::text]::text[], $3::boolean)) x`,
        [KIND, ip, success],
      );

    // ---- validate (input mistakes are not counted as failed attempts) ----
    const body = await readBody(c);
    if (!body) return fail(c, 400, 'data_tidak_sah');
    const email = typeof body.email === 'string' ? normalizeEmail(body.email) : '';
    const phone = typeof body.phone === 'string' ? normalizePhone(body.phone) : null;
    const name = typeof body.name === 'string' ? body.name.trim().replace(/\s+/g, ' ') : '';
    const password = typeof body.password === 'string' ? body.password : '';
    if (!email || email.length > 254 || !EMAIL_RE.test(email)) return fail(c, 400, 'data_tidak_sah', 'Emel tidak sah.');
    if (!phone) return fail(c, 400, 'data_tidak_sah', 'Nombor telefon tidak sah. Contoh: 0123456789.');
    if (!name || name.length > NAME_MAX) {
      return fail(c, 400, 'data_tidak_sah', `Sila masukkan nama penuh (maksimum ${NAME_MAX} aksara).`);
    }
    if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
      return fail(c, 400, 'data_tidak_sah', `Kata laluan mesti sekurang-kurangnya ${PASSWORD_MIN} aksara.`);
    }
    if (body.privacyAck !== true) return fail(c, 400, 'data_tidak_sah', 'Sila tandakan pengakuan privasi untuk meneruskan.');

    // ---- purchase match ----
    const check = await deps.hive.json<Check>('select register_check($1, $2) as r', [email, phone]);
    if (!check.ok) {
      await record(false);
      return fail(c, 400, 'tiada_pembelian');
    }
    if (check.profile_exists) {
      await record(false);
      return fail(c, 409, 'sudah_didaftar');
    }

    // ---- existing Firebase account: real one -> refuse; orphan (no profile) -> remove ----
    const existing = await deps.firebaseAdmin.getUserByEmail(email);
    if (existing) {
      const prof = await deps.hive.json<{ has: boolean }>(
        `select jsonb_build_object('has', exists(select 1 from profiles where id = $1)) as r`,
        [existing.uid],
      );
      if (prof.has) {
        await record(false);
        return fail(c, 409, 'sudah_didaftar');
      }
      // A young account without a profile may be a registration still in flight (double-click / retry):
      // deleting it would leave that request's profile pointing at a non-existent account.
      // Unknown creation time counts as young (never delete what we cannot date).
      const age = existing.createdAt == null ? 0 : deps.now() - existing.createdAt;
      if (age < ORPHAN_GRACE_MS) return fail(c, 409, 'sedang_didaftar');
      await deps.firebaseAdmin.deleteUser(existing.uid);
    }

    let created: { uid: string; email?: string };
    try {
      created = await deps.firebaseAdmin.createUser({ email, password, displayName: name });
    } catch (e) {
      if ((e as { code?: string })?.code === 'EMAIL_EXISTS') {
        await record(false);
        return fail(c, 409, 'sudah_didaftar');
      }
      throw e;
    }

    // ---- profile + claim; on any failure remove the account we just created ----
    const accountEmail = normalizeEmail(created.email ?? email);
    let done: Complete;
    try {
      done = await deps.hive.json<Complete>('select register_complete($1, $2, $3, $4) as r', [
        created.uid, accountEmail, phone, name,
      ]);
    } catch (e) {
      await removeAccount(deps, created.uid);
      throw e;
    }
    if (!done.ok) {
      await removeAccount(deps, created.uid);
      await record(false);
      return done.reason === 'sudah_didaftar' ? fail(c, 409, 'sudah_didaftar') : fail(c, 400, 'tiada_pembelian');
    }
    await record(true);
    return ok(c, { entitlements: done.entitlements ?? [] });
  });

  return r;
}

async function removeAccount(deps: Deps, uid: string) {
  try {
    await deps.firebaseAdmin.deleteUser(uid);
  } catch (e) {
    console.error('register: could not delete new Firebase account', uid, e instanceof Error ? e.message : String(e));
  }
}
