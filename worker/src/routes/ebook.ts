// Ebook file tickets and reading progress. The Drive fileId only ever leaves the Worker INSIDE the
// signed ticket; it is never a field of the JSON response.
import { Hono } from 'hono';
import type { AppEnv, Deps } from '../types';
import { fail, ok, readBody, UUID_RE } from '../errors';
import { requireUser } from '../guard';
import { signTicket } from '../hmac';

type TicketRow = { ok: boolean; reason?: string; fileId?: string; updatedAt?: string | null; allowDownload?: boolean };

export function ebookRoutes(deps: Deps) {
  const r = new Hono<AppEnv>();
  const auth = requireUser(deps);

  r.post('/ebook/:id/ticket', auth, async (c) => {
    const ebookId = c.req.param('id');
    // malformed id looks exactly like an ebook the user cannot open (no existence oracle)
    if (!UUID_RE.test(ebookId)) return fail(c, 403, 'tiada_akses');
    const uid = c.get('user').uid;
    const row = await deps.hive.json<TicketRow>('select ebook_for_ticket($1, $2::uuid) as r', [uid, ebookId]);
    if (!row.ok || !row.fileId) {
      if (row.reason === 'tiada_fail') return fail(c, 404, 'tiada_fail');
      return fail(c, 403, 'tiada_akses');
    }
    const ticket = await signTicket(deps.secrets.ticket, { ebookId, fileId: row.fileId, uid }, Math.floor(deps.now() / 1000));
    return ok(c, { ticket, updatedAt: row.updatedAt ?? null, allowDownload: row.allowDownload === true });
  });

  r.put('/ebook/:id/progress', auth, async (c) => {
    const ebookId = c.req.param('id');
    if (!UUID_RE.test(ebookId)) return fail(c, 403, 'tiada_akses');
    const body = await readBody(c);
    const lastPage = body?.last_page;
    const finished = body?.finished ?? false;
    if (typeof lastPage !== 'number' || !Number.isInteger(lastPage) || lastPage < 0 || lastPage > 100000
        || typeof finished !== 'boolean') {
      return fail(c, 400, 'data_tidak_sah');
    }
    // entitlement check and save in ONE statement: progress only for ebooks the user may open
    const res = await deps.hive.json<{ ok: boolean; reason?: string }>(
      `select case when exists (select 1 from ebooks e where e.id = $2::uuid and e.item_key = any(entitlements_for($1)))
                   then save_reading($1, $2::uuid, $3::int, $4::boolean)
                   else jsonb_build_object('ok', false, 'reason', 'tiada_akses') end as r`,
      [c.get('user').uid, ebookId, lastPage, finished],
    );
    if (!res.ok) return res.reason === 'tiada_akses' ? fail(c, 403, 'tiada_akses') : fail(c, 400, 'data_tidak_sah');
    return ok(c, {});
  });

  return r;
}
