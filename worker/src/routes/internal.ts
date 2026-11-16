// /internal/*: called by Google Apps Script, HMAC-signed (X-HDM-Sig, see hmac.ts). The contract is fixed by
// apps-script/Worker.gs.js, Bcl.gs.js and Mail.gs.js: every response is {ok:true,data} | {ok:false,reason,message}.
import { Hono } from 'hono';
import type { AppEnv, Deps } from '../types';
import { fail, ok, readBody, UUID_RE } from '../errors';
import { requireInternal } from '../guard';

const MAX_REFS = 500;
const REF_MAX = 200;

/**
 * Tables Apps Script's nightly backup may export, each with a deterministic ORDER BY for stable paging.
 * Identifiers in the export SQL come ONLY from this map (never from the request).
 */
export const EXPORT_TABLES: Readonly<Record<string, string>> = Object.freeze({
  items: 'key',
  packages: 'id',
  package_items: 'package_id, item_key',
  batches: 'id',
  profiles: 'id',
  user_roles: 'user_id, role',
  audit_logs: 'id',
  app_settings: 'key',
  manual_grants: 'id',
  purchases: 'id',
  bcl_form_map: 'id',
  bcl_webhook_log: 'id',
  email_queue: 'id',
  rate_attempts: 'id',
  access_codes: 'id',
  ebooks: 'id',
  reading_progress: 'user_id, ebook_id',
  groups: 'id',
  schema_migrations: 'name',
});
const EXPORT_MAX = 1000;

const isoOrNull = (v: unknown): string | null => {
  if (typeof v !== 'string' || !v.trim()) return null;
  const ms = Date.parse(v);
  return Number.isNaN(ms) ? null : new Date(ms).toISOString();
};

export function internalRoutes(deps: Deps) {
  const r = new Hono<AppEnv>();
  r.use('*', requireInternal(deps));

  /** Active BCL form map rows for matchPackage(): {formable_id, amount (number|null), field_value, package_id}. */
  r.get('/bcl-config', async (c) =>
    ok(c, await deps.hive.json(
      `select jsonb_build_object('rows', coalesce(jsonb_agg(jsonb_build_object(
                'id', m.id, 'formable_id', m.formable_id, 'amount', m.amount_rm, 'amount_rm', m.amount_rm,
                'field_value', m.field_value, 'package_id', m.package_id) order by m.formable_id, m.amount_rm), '[]'::jsonb)) as r
         from bcl_form_map m where m.active`,
    )));

  /**
   * Refs already handled: present in purchases, or logged with kind exactly 'ignored' (unmapped form), so the
   * 10-minute poll stays quiet about them. Recovery is explicit: Admin › Pemetaan BCL › "Order tanpa pembelian"
   * › Proses semula (POST /api/admin/orders/:orderRef/reprocess) makes Apps Script evaluate the order again.
   */
  r.post('/known-orders', async (c) => {
    const body = await readBody(c);
    const refs = Array.isArray(body?.refs) ? body!.refs : null;
    if (!refs || refs.length > MAX_REFS || refs.some((x) => typeof x !== 'string' || !x || x.length > REF_MAX)) {
      return fail(c, 400, 'data_tidak_sah');
    }
    return ok(c, await deps.hive.json(
      `select jsonb_build_object('refs', coalesce(jsonb_agg(x.ref order by x.ref), '[]'::jsonb)) as r
         from (select distinct ref from jsonb_array_elements_text($1::jsonb) ref
                where exists (select 1 from purchases p where p.order_ref = ref)
                   or exists (select 1 from bcl_webhook_log l where l.order_ref = ref and l.kind = 'ignored')) x`,
      [JSON.stringify(refs)],
    ));
  });

  /** Bcl.gs.js processOrder body: {order_ref, source, package_id, name, email, phone, amount, raw}. */
  r.post('/purchase', async (c) => {
    const b = await readBody(c);
    const ref = typeof b?.order_ref === 'string' || typeof b?.order_ref === 'number' ? String(b.order_ref).trim() : '';
    if (!b || !ref || ref.length > REF_MAX) return fail(c, 400, 'data_tidak_sah');
    const s = (v: unknown) => (typeof v === 'string' ? v : typeof v === 'number' ? String(v) : null);
    const p = {
      order_ref: ref,
      source: s(b.source),
      package_id: s(b.package_id),
      buyer_name: s(b.buyer_name ?? b.name),
      email: s(b.email),
      phone: s(b.phone),
      amount_rm: s(b.amount_rm ?? b.amount),
      // Apps Script does not send paid_at: the time the Worker receives the verified order stands in for it.
      paid_at: isoOrNull(b.paid_at) ?? new Date(deps.now()).toISOString(),
      review_reason: s(b.review_reason),
      raw: b.raw === undefined ? null : b.raw,
    };
    if (p.amount_rm !== null && !/^\d+(\.\d+)?$/.test(p.amount_rm)) p.amount_rm = null;
    // previous_status is read before the call: a re-evaluated 'perlu_semakan' row reports what it became.
    const res = await deps.hive.json<{ inserted: boolean; id: string; status: string }>(
      `with prev as (select status from purchases where order_ref = $2)
       select jsonb_build_object('inserted', x->'inserted', 'id', x->'row'->'id', 'status', x->'row'->'status',
                                 'reevaluated', coalesce(x->'reevaluated', 'false'::jsonb),
                                 'changed', coalesce(x->'changed', 'false'::jsonb),
                                 'previous_status', (select status from prev),
                                 'review_reason', x->'row'->'review_reason') as r
         from upsert_purchase($1::jsonb) x`,
      [JSON.stringify(p), ref],
    );
    return ok(c, res);
  });

  /** Worker.gs.js logBcl: {order_ref, kind, status, detail, payload}; `kind` wins over `status`. */
  r.post('/bcl-log', async (c) => {
    const b = await readBody(c);
    const kindRaw = b?.kind ?? b?.status;
    const kind = typeof kindRaw === 'string' ? kindRaw.trim().slice(0, 40) : '';
    if (!b || !kind) return fail(c, 400, 'data_tidak_sah');
    const ref = typeof b.order_ref === 'string' || typeof b.order_ref === 'number' ? String(b.order_ref).slice(0, REF_MAX) : null;
    const detail = b.detail == null ? null : (typeof b.detail === 'string' ? b.detail : JSON.stringify(b.detail)).slice(0, 2000);
    const payload = b.payload == null ? null : JSON.stringify(b.payload);
    return ok(c, await deps.hive.json(
      `insert into bcl_webhook_log (order_ref, kind, ok, message, payload)
       values ($1::text, $2::text, $3::boolean, $4::text, $5::jsonb)
       returning jsonb_build_object('id', id) as r`,
      [ref, kind, kind === 'processed' || kind === 'ok', detail, payload],
    ));
  });

  /** Pending welcome emails for Mail.gs.js: {items:[{id, to_email, kind, subject, ref_id, attempts, payload:{name, package_name, order_ref}}]}. */
  r.get('/email-queue', async (c) => {
    const n = Number.parseInt(c.req.query('limit') ?? '20', 10);
    const limit = Number.isFinite(n) ? Math.min(Math.max(n, 1), 50) : 20;
    return ok(c, await deps.hive.json(
      `select jsonb_build_object('items', coalesce(jsonb_agg(jsonb_build_object(
                'id', q.id, 'to_email', q.to_email, 'kind', q.kind, 'subject', q.subject, 'ref_id', q.ref_id,
                'attempts', q.attempts,
                'payload', jsonb_build_object('name', pu.buyer_name, 'package_name', k.name, 'order_ref', pu.order_ref))
              order by q.created_at, q.id), '[]'::jsonb)) as r
         from (select * from email_queue where status = 'pending' order by created_at, id limit $1::int) q
         left join purchases pu on pu.id::text = q.ref_id
         left join packages k on k.id = pu.package_id`,
      [limit],
    ));
  });

  /** Mail.gs.js setQueueStatus: {status: 'sent'|'failed', error}. */
  r.post('/email-queue/:id', async (c) => {
    const id = c.req.param('id');
    const b = await readBody(c);
    const status = b?.status;
    if (!UUID_RE.test(id)) return fail(c, 404, 'tiada');
    if (status !== 'sent' && status !== 'failed') return fail(c, 400, 'data_tidak_sah');
    const error = b?.error == null ? null : String(b.error).slice(0, 500);
    const res = await deps.hive.json<{ updated: number }>(
      `with u as (update email_queue
                     set status = $2::text, attempts = attempts + 1, last_error = $3::text,
                         sent_at = case when $2::text = 'sent' then now() else sent_at end
                   where id = $1::uuid returning id)
       select jsonb_build_object('updated', (select count(*) from u)) as r`,
      [id, status, error],
    );
    return res.updated ? ok(c, {}) : fail(c, 404, 'tiada');
  });

  /** Backup.gs.js nightly backup: {table, offset = 0, limit = 1000} -> {rows (to_jsonb, key order), next | null}. */
  r.post('/export', async (c) => {
    const b = await readBody(c);
    if (!b) return fail(c, 400, 'data_tidak_sah');
    const table = typeof b.table === 'string' && Object.hasOwn(EXPORT_TABLES, b.table) ? b.table : null;
    if (!table) return fail(c, 400, 'tiada_jadual');
    const offset = b.offset === undefined ? 0 : b.offset;
    const limit = b.limit === undefined ? EXPORT_MAX : b.limit;
    if (!Number.isSafeInteger(offset) || (offset as number) < 0
      || !Number.isSafeInteger(limit) || (limit as number) < 1 || (limit as number) > EXPORT_MAX) {
      return fail(c, 400, 'data_tidak_sah');
    }
    const order = EXPORT_TABLES[table];
    const rows = await deps.hive.json<unknown[]>(
      `select coalesce(jsonb_agg(to_jsonb(t) order by ${order}), '[]'::jsonb) as r
         from (select * from ${table} order by ${order} limit $1::int offset $2::bigint) t`,
      [limit, offset],
    );
    return ok(c, { rows, next: rows.length < (limit as number) ? null : (offset as number) + rows.length });
  });

  return r;
}
