// Access-code redemption. Rate limited per client IP and per uid (5 failures / 15 min, see rate_blocked).
import { Hono } from 'hono';
import type { AppEnv, Deps } from '../types';
import { fail, ok, readBody } from '../errors';
import { requireUser } from '../guard';
import { normalizeCode } from '../../../src/lib/codes';

const KIND = 'redeem';
const REASONS = new Set(['tidak_sah', 'sudah_digunakan', 'dibatalkan', 'tamat_tempoh']);

/** `array[$n::text, ...]` for the subjects, starting at placeholder $start. */
function subjectsArray(n: number, start: number): string {
  return `array[${Array.from({ length: n }, (_, i) => `$${start + i}::text`).join(',')}]::text[]`;
}

export function codesRoutes(deps: Deps) {
  const r = new Hono<AppEnv>();

  r.post('/codes/redeem', requireUser(deps), async (c) => {
    const uid = c.get('user').uid;
    const ip = (c.req.header('CF-Connecting-IP') ?? '').trim() || 'unknown';
    const subjects = [ip, uid].filter((s): s is string => typeof s === 'string' && s.length > 0);

    const gate = await deps.hive.json<{ blocked: boolean }>(
      `select jsonb_build_object('blocked', rate_blocked($1, ${subjectsArray(subjects.length, 2)})) as r`,
      [KIND, ...subjects],
    );
    if (gate.blocked) return fail(c, 429, 'terlalu_banyak_cubaan');

    const record = (success: boolean) =>
      deps.hive.json(
        `select jsonb_build_object('ok', true) as r
           from (select rate_record($1, ${subjectsArray(subjects.length, 3)}, $2::boolean)) x`,
        [KIND, success, ...subjects],
      );

    const body = await readBody(c);
    const code = typeof body?.code === 'string' ? normalizeCode(body.code) : null;
    if (!code) {
      await record(false);
      return fail(c, 400, 'tidak_sah');
    }

    const res = await deps.hive.json<{ ok: boolean; reason?: string; items?: string[] }>(
      'select redeem_code($1, $2) as r',
      [uid, code],
    );
    await record(res.ok);
    if (!res.ok) return fail(c, 400, REASONS.has(res.reason ?? '') ? res.reason! : 'tidak_sah');
    return ok(c, { items: res.items ?? [] });
  });

  return r;
}
