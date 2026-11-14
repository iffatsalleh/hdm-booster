// Participant profile routes. uid ALWAYS comes from c.get('user') (the verified token), never from
// the request; body fields are whitelisted before they reach SQL.
import { Hono } from 'hono';
import type { AppEnv, Deps } from '../types';
import { fail, ok, readBody, MSG } from '../errors';
import { requireUser } from '../guard';

type R = { ok: boolean; reason?: string; [k: string]: unknown };

const ONBOARDING_FIELDS = [
  'sex', 'birth_year', 'height_cm', 'start_weight_kg', 'start_body_fat_pct', 'start_waist_cm',
  'activity_level', 'target_weight_kg', 'protein_target_g',
] as const;
const TARGET_FIELDS = ['tdee_kcal', 'kcal_target', 'protein_target_g'] as const;
const NAME_MAX = 100;

function pick(body: Record<string, unknown>, keys: readonly string[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of keys) if (body[k] !== undefined) out[k] = body[k];
  return out;
}

export function meRoutes(deps: Deps) {
  const r = new Hono<AppEnv>();
  const auth = requireUser(deps);

  r.get('/me', auth, async (c) => {
    const boot = await deps.hive.json<R>('select app_bootstrap($1) as r', [c.get('user').uid]);
    if (!boot.ok) return fail(c, 403, 'tiada_profil');
    const { ok: _ok, ...data } = boot;
    return ok(c, data);
  });

  r.put('/me/onboarding', auth, async (c) => {
    const body = await readBody(c);
    if (!body || body.health_ack !== true || body.privacy_ack !== true) {
      return fail(c, 400, 'data_tidak_sah', 'Sila lengkapkan borang dan tandakan kedua-dua pengakuan (kesihatan dan privasi).');
    }
    const p = { ...pick(body, ONBOARDING_FIELDS), health_ack: true, privacy_ack: true };
    const res = await deps.hive.json<R>('select save_onboarding($1, $2::jsonb) as r', [c.get('user').uid, JSON.stringify(p)]);
    if (!res.ok) return fail(c, 400, res.reason === 'tiada_profil' ? 'tiada_profil' : 'data_tidak_sah');
    return ok(c, {});
  });

  r.put('/me/targets', auth, async (c) => {
    const body = await readBody(c);
    if (!body) return fail(c, 400, 'data_tidak_sah');
    // entitlement check and save in ONE statement
    const res = await deps.hive.json<R>(
      `select case when 'tdee' = any(entitlements_for($1)) then save_targets($1, $2::jsonb)
                   else jsonb_build_object('ok', false, 'reason', 'tiada_akses') end as r`,
      [c.get('user').uid, JSON.stringify(pick(body, TARGET_FIELDS))],
    );
    if (!res.ok) {
      if (res.reason === 'tiada_akses') return fail(c, 403, 'tiada_akses', MSG.tiada_akses_tdee);
      return fail(c, 400, 'data_tidak_sah');
    }
    return ok(c, {});
  });

  r.put('/me/name', auth, async (c) => {
    const body = await readBody(c);
    const name = typeof body?.full_name === 'string' ? body.full_name.trim().replace(/\s+/g, ' ') : '';
    if (!name || name.length > NAME_MAX) {
      return fail(c, 400, 'data_tidak_sah', `Sila masukkan nama penuh (maksimum ${NAME_MAX} aksara).`);
    }
    await deps.hive.json<R>(
      `with u as (update profiles set full_name = $2 where id = $1 returning 1)
       select jsonb_build_object('ok', exists(select 1 from u)) as r`,
      [c.get('user').uid, name],
    );
    return ok(c, { full_name: name });
  });

  r.get('/me/access', auth, async (c) => {
    return ok(c, await deps.hive.json('select account_summary($1) as r', [c.get('user').uid]));
  });

  r.get('/groups', auth, async (c) => {
    return ok(c, await deps.hive.json('select my_groups($1) as r', [c.get('user').uid]));
  });

  return r;
}
