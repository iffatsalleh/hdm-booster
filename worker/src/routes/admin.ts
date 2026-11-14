// /api/admin/*. The prefix gate in app.ts already requires a staff role (superadmin, or coach on the three
// read-only routes in COACH_ROUTES); superadmin routes also carry requireRole('superadmin'), and every SQL
// admin function re-checks roles_for(actor). Every mutation writes exactly one audit_logs row.
import { Hono } from 'hono';
import type { Context } from 'hono';
import type { AppEnv, Deps } from '../types';
import { dbFail, fail, ok, readBody, UUID_RE } from '../errors';
import { requireRole } from '../guard';
import { signHmac } from '../hmac';
import { BCL_MAP, CONTENT_TABLES, CrudInputError, crud, type TableSpec } from '../crud';

/** Paths (relative to /api/admin) a coach may GET. Kept here, enforced by the prefix gate in app.ts. */
export const COACH_ROUTES: RegExp[] = [/^\/api\/admin\/summary$/, /^\/api\/admin\/participants$/, /^\/api\/admin\/participants\/[^/]+$/];

const PW_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'; // no 0 O o 1 I i l
/** Random temporary password from the Web Crypto RNG (rejection sampling: no modulo bias). */
export function tempPassword(len = 10): string {
  const out: string[] = [];
  const limit = 256 - (256 % PW_ALPHABET.length);
  while (out.length < len) {
    for (const b of crypto.getRandomValues(new Uint8Array(32))) {
      if (b < limit) out.push(PW_ALPHABET[b % PW_ALPHABET.length]);
      if (out.length === len) break;
    }
  }
  return out.join('');
}

const str = (v: unknown, max = 200) => (typeof v === 'string' && v.trim() && v.length <= max ? v.trim() : null);
const filterOf = (c: Context, keys: string[]) => {
  const f: Record<string, string> = {};
  for (const k of keys) {
    const v = c.req.query(k);
    if (typeof v === 'string' && v.trim()) f[k] = v.trim().slice(0, 200);
  }
  return f;
};

export function adminRoutes(deps: Deps) {
  const r = new Hono<AppEnv>();
  const sa = requireRole('superadmin');
  const actor = (c: Context<AppEnv>) => c.get('user').uid;
  /** Runs a DB call, mapping known SQL reasons / constraint errors to 4xx. */
  const run = async (c: Context<AppEnv>, fn: () => Promise<Response>) => {
    try {
      return await fn();
    } catch (e) {
      if (e instanceof CrudInputError) return fail(c, 400, 'data_tidak_sah');
      return dbFail(c, e);
    }
  };

  // ---------------- staff (coach + superadmin) ----------------
  r.get('/summary', async (c) => run(c, async () => ok(c, await deps.hive.json('select admin_summary($1) as r', [actor(c)]))));

  r.get('/participants', async (c) =>
    run(c, async () => ok(c, await deps.hive.json('select admin_participants($1, $2) as r', [actor(c), filterOf(c, ['q']).q ?? null]))));

  r.get('/participants/:uid', async (c) =>
    run(c, async () => {
      const d = await deps.hive.json('select admin_participant($1, $2) as r', [actor(c), c.req.param('uid')]);
      return d ? ok(c, d) : fail(c, 404, 'pengguna_tidak_wujud');
    }));

  // ---------------- superadmin: participants ----------------
  r.post('/participants/:uid/grant', sa, async (c) =>
    run(c, async () => {
      const body = await readBody(c);
      const item = str(body?.item_key, 100);
      if (!item) return fail(c, 400, 'item_tidak_sah');
      const reason = str(body?.reason, 500);
      return ok(c, await deps.hive.json('select admin_grant($1, $2, $3, $4) as r', [actor(c), c.req.param('uid'), item, reason]));
    }));

  r.post('/grants/:id/revoke', sa, async (c) =>
    run(c, async () => {
      const id = c.req.param('id');
      if (!UUID_RE.test(id)) return fail(c, 404, 'geran_tidak_wujud');
      return ok(c, await deps.hive.json('select admin_revoke_grant($1, $2::uuid) as r', [actor(c), id]));
    }));

  r.post('/participants/:uid/reset-password', sa, async (c) =>
    run(c, async () => {
      const uid = c.req.param('uid');
      const found = await deps.hive.json<{ ok: boolean }>(
        `select jsonb_build_object('ok', exists(select 1 from profiles where id = $2) and 'superadmin' = any(roles_for($1))) as r`,
        [actor(c), uid],
      );
      if (!found.ok) return fail(c, 404, 'pengguna_tidak_wujud');
      const password = tempPassword(10);
      await deps.firebaseAdmin.setPassword(uid, password);
      // the password itself is never logged
      await deps.hive.json(
        `select jsonb_build_object('ok', true) as r
           from (select log_audit($1, 'participant.reset_password', 'profile', $2, '{}'::jsonb)) x`,
        [actor(c), uid],
      );
      c.header('Cache-Control', 'no-store');
      return ok(c, { password });
    }));

  // ---------------- superadmin: purchases ----------------
  r.get('/purchases', sa, async (c) =>
    run(c, async () => {
      const f = filterOf(c, ['status', 'batch_id', 'q']);
      if (f.batch_id && !UUID_RE.test(f.batch_id)) return fail(c, 400, 'data_tidak_sah');
      return ok(c, await deps.hive.json('select admin_purchases($1, $2::jsonb) as r', [actor(c), JSON.stringify(f)]));
    }));

  r.post('/purchases/:id/action', sa, async (c) =>
    run(c, async () => {
      const id = c.req.param('id');
      if (!UUID_RE.test(id)) return fail(c, 404, 'pembelian_tidak_wujud');
      const body = await readBody(c);
      const action = str(body?.action, 40);
      if (!action) return fail(c, 400, 'tindakan_tidak_sah');
      const payload = body?.payload && typeof body.payload === 'object' && !Array.isArray(body.payload) ? body.payload : {};
      return ok(c, await deps.hive.json('select admin_purchase_action($1, $2::uuid, $3, $4::jsonb) as r', [
        actor(c), id, action, JSON.stringify(payload),
      ]));
    }));

  r.post('/purchases/:id/reprocess', sa, async (c) =>
    run(c, async () => {
      const id = c.req.param('id');
      if (!UUID_RE.test(id)) return fail(c, 404, 'pembelian_tidak_wujud');
      const pu = await deps.hive.json<{ order_ref: string | null }>(
        `select jsonb_build_object('order_ref',
           (select order_ref from purchases where id = $2::uuid and 'superadmin' = any(roles_for($1)))) as r`,
        [actor(c), id],
      );
      if (!pu.order_ref) return fail(c, 404, 'pembelian_tidak_wujud');
      // Apps Script cannot read headers: the signature travels in the body (see apps-script/Router.gs.js).
      const payload = JSON.stringify({ action: 'reprocess', order_ref: pu.order_ref });
      const t = Math.floor(deps.now() / 1000);
      const sig = await signHmac(deps.secrets.internal, t, payload);
      let result: unknown;
      try {
        const res = await (deps.fetch ?? fetch)(deps.gasUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ src: 'worker', t, sig, payload }),
          redirect: 'follow',
        });
        result = await res.json();
      } catch (e) {
        console.error('reprocess: apps script call failed', e instanceof Error ? e.message : String(e));
        return fail(c, 502, 'gas_gagal');
      }
      const g = (result && typeof result === 'object' ? result : {}) as { ok?: unknown; result?: unknown; reason?: unknown };
      await deps.hive.json(
        `select jsonb_build_object('ok', true) as r
           from (select log_audit($1, 'purchase.reprocess', 'purchase', $2, $3::jsonb)) x`,
        [actor(c), id, JSON.stringify({ order_ref: pu.order_ref, gas_ok: g.ok === true, reason: g.reason ?? null })],
      );
      return ok(c, { ok: g.ok === true, result: g.result ?? null, ...(g.reason ? { reason: g.reason } : {}) });
    }));

  r.post('/purchases/:id/resend-welcome', sa, async (c) =>
    run(c, async () => {
      const id = c.req.param('id');
      if (!UUID_RE.test(id)) return fail(c, 404, 'pembelian_tidak_wujud');
      const res = await deps.hive.json<{ id: string } | null>(
        `with pu as (select id, order_ref, email from purchases
                      where id = $2::uuid and email is not null and 'superadmin' = any(roles_for($1))),
              q as (insert into email_queue (to_email, subject, kind, ref_id)
                    select email, 'Pembelian anda telah diterima - HDM Booster', 'purchase_welcome', id::text from pu
                    returning id, to_email),
              a as (insert into audit_logs (actor, action, target_type, target_id, detail)
                    select $1, 'purchase.resend_welcome', 'purchase', pu.id::text,
                           jsonb_build_object('order_ref', pu.order_ref, 'email_queue_id', q.id)
                      from pu, q returning 1)
         select (select jsonb_build_object('id', q.id, 'to_email', q.to_email) from q) as r`,
        [actor(c), id],
      );
      return res ? ok(c, res) : fail(c, 404, 'pembelian_tidak_wujud');
    }));

  // ---------------- superadmin: BCL form map + content CRUD (whitelisted tables) ----------------
  const mountCrud = (base: string, resolve: (c: Context<AppEnv>) => [string, TableSpec] | null, prefix: string) => {
    const tbl = (c: Context<AppEnv>) => {
      const x = resolve(c);
      return x ? crud(deps.hive, x[0], x[1], actor(c), prefix) : null;
    };
    r.get(base, sa, async (c) => run(c, async () => {
      const t = tbl(c);
      return t ? ok(c, await t.list()) : fail(c, 404, 'tiada');
    }));
    r.get(`${base}/:id`, sa, async (c) => run(c, async () => {
      const t = tbl(c);
      const row = t ? await t.get(c.req.param('id')) : null;
      return row ? ok(c, row) : fail(c, 404, 'tiada');
    }));
    r.post(base, sa, async (c) => run(c, async () => {
      const t = tbl(c);
      if (!t) return fail(c, 404, 'tiada');
      const body = await readBody(c);
      if (!body) return fail(c, 400, 'data_tidak_sah');
      const row = await t.create(body);
      return row ? ok(c, row) : fail(c, 403, 'tiada_kebenaran');
    }));
    r.put(`${base}/:id`, sa, async (c) => run(c, async () => {
      const t = tbl(c);
      if (!t) return fail(c, 404, 'tiada');
      const body = await readBody(c);
      if (!body) return fail(c, 400, 'data_tidak_sah');
      const row = await t.update(c.req.param('id'), body);
      return row ? ok(c, row) : fail(c, 404, 'tiada');
    }));
    r.delete(`${base}/:id`, sa, async (c) => run(c, async () => {
      const t = tbl(c);
      const row = t ? await t.remove(c.req.param('id')) : null;
      return row ? ok(c, row) : fail(c, 404, 'tiada');
    }));
  };

  mountCrud('/bcl-map', () => ['bcl_form_map', BCL_MAP], 'bcl_map');
  mountCrud('/content/:table', (c) => {
    const name = c.req.param('table') ?? '';
    return Object.prototype.hasOwnProperty.call(CONTENT_TABLES, name) ? [name, CONTENT_TABLES[name]] : null;
  }, 'content');

  // ---------------- superadmin: access codes ----------------
  r.post('/codes/generate', sa, async (c) =>
    run(c, async () => {
      const body = await readBody(c);
      const pkg = str(body?.package_id, 50);
      const count = body?.count;
      const label = str(body?.label, 100);
      const batch = body?.batch_id == null || body.batch_id === '' ? null : body.batch_id;
      const ends = body?.access_ends_at == null || body.access_ends_at === '' ? null : body.access_ends_at;
      const buyer = body?.buyer && typeof body.buyer === 'object' && !Array.isArray(body.buyer) ? body.buyer : null;
      if (!pkg || typeof count !== 'number' || !Number.isInteger(count)) return fail(c, 400, 'data_tidak_sah');
      if (batch !== null && (typeof batch !== 'string' || !UUID_RE.test(batch))) return fail(c, 400, 'data_tidak_sah');
      if (ends !== null && (typeof ends !== 'string' || Number.isNaN(Date.parse(ends)))) return fail(c, 400, 'data_tidak_sah');
      return ok(c, await deps.hive.json(
        `select coalesce(jsonb_agg(to_jsonb(g) order by g.created_at, g.code), '[]'::jsonb) as r
           from generate_codes($1, $2, $3::int, $4::uuid, $5, $6::jsonb, $7::timestamptz) g`,
        [actor(c), pkg, count, batch, label, buyer ? JSON.stringify(buyer) : null, ends],
      ));
    }));

  r.get('/codes', sa, async (c) =>
    run(c, async () => {
      const f = filterOf(c, ['status', 'batch_id', 'q']);
      if (f.batch_id && !UUID_RE.test(f.batch_id)) return fail(c, 400, 'data_tidak_sah');
      return ok(c, await deps.hive.json('select admin_codes($1, $2::jsonb) as r', [actor(c), JSON.stringify(f)]));
    }));

  r.post('/codes/:id/action', sa, async (c) =>
    run(c, async () => {
      const id = c.req.param('id');
      if (!UUID_RE.test(id)) return fail(c, 404, 'kod_tidak_wujud');
      const body = await readBody(c);
      const action = str(body?.action, 40);
      if (!action) return fail(c, 400, 'tindakan_tidak_sah');
      const payload = body?.payload && typeof body.payload === 'object' && !Array.isArray(body.payload) ? body.payload : {};
      return ok(c, await deps.hive.json('select to_jsonb(admin_code_action($1, $2::uuid, $3, $4::jsonb)) as r', [
        actor(c), id, action, JSON.stringify(payload),
      ]));
    }));

  // ---------------- superadmin: audit ----------------
  r.get('/audit', sa, async (c) =>
    run(c, async () => {
      const n = Number.parseInt(c.req.query('limit') ?? '100', 10);
      return ok(c, await deps.hive.json('select admin_audit($1, $2::int) as r', [actor(c), Number.isFinite(n) ? n : 100]));
    }));

  return r;
}
