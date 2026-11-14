// /internal/*: Apps Script -> Worker, HMAC-signed (X-HDM-Sig). Contract = apps-script/Worker.gs.js, Bcl.gs.js, Mail.gs.js.
import { describe, test, expect, afterAll } from 'vitest';
import { makeApp, q, rnd, randomPhone, track, unclaimedPurchase, INTERNAL_SECRET, cleanupAll } from './fixtures';
import { signHmac } from '../../worker/src/hmac';

afterAll(cleanupAll);
const app = makeApp();

/** Signs exactly like apps-script workerCall: GET signs the empty string. */
async function icall(method: string, path: string, body?: unknown, opts: { secret?: string } = {}) {
  const payload = body === undefined || method === 'GET' ? '' : JSON.stringify(body);
  const t = Math.floor(Date.now() / 1000);
  const headers: Record<string, string> = {
    'X-HDM-Sig': `t=${t},v1=${await signHmac(opts.secret ?? INTERNAL_SECRET, t, payload)}`,
  };
  if (payload) headers['Content-Type'] = 'application/json';
  return app.request(path, { method, headers, body: payload || undefined });
}

const newRef = () => {
  const r = `test_w8i_${rnd()}`;
  track.orderRef(r);
  return r;
};

describe('signature', () => {
  test.each([
    ['GET', '/internal/bcl-config'],
    ['POST', '/internal/known-orders'],
    ['POST', '/internal/purchase'],
    ['POST', '/internal/bcl-log'],
    ['GET', '/internal/email-queue'],
    ['POST', '/internal/email-queue/00000000-0000-0000-0000-000000000000'],
  ])('%s %s without / with wrong signature -> 401', async (m, path) => {
    expect((await app.request(path, { method: m })).status).toBe(401);
    expect((await icall(m, path, m === 'GET' ? undefined : {}, { secret: 'wrong' })).status).toBe(401);
  });
});

describe('purchase', () => {
  test('internal purchase twice same order_ref -> one row (via upsert_purchase)', async () => {
    const ref = newRef();
    const email = `test_${rnd()}@example.test`;
    const phone = randomPhone();
    // exactly what Bcl.gs.js processOrder sends
    const body = {
      order_ref: ref, source: 'webhook', package_id: 'basic', name: 'Pembeli  BCL', email,
      phone, amount: 97, raw: { order_no: ref, status: 3 },
    };
    const r1 = await icall('POST', '/internal/purchase', body);
    expect(r1.status).toBe(200);
    const j1 = await r1.json();
    expect(j1.ok).toBe(true);
    expect(j1.data.inserted).toBe(true);
    const r2 = await icall('POST', '/internal/purchase', { ...body, source: 'poll' });
    expect(r2.status).toBe(200);
    expect((await r2.json()).data.inserted).toBe(false);
    const rows = await q('select buyer_name, email, phone, amount_rm::float8 amt, package_id, raw from purchases where order_ref = $1', [ref]);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ buyer_name: 'Pembeli  BCL', email, phone, amt: 97, package_id: 'basic' });
    expect(rows[0].raw).toEqual({ order_no: ref, status: 3 });
    // one welcome email queued (only for the insert)
    expect(await q(`select 1 from email_queue where ref_id = (select id::text from purchases where order_ref = $1)`, [ref])).toHaveLength(1);
  });

  test('paid_at from the body is stored when it parses; otherwise receipt time', async () => {
    const base = { source: 'webhook', package_id: 'basic', name: 'P', email: `test_${rnd()}@example.test`, phone: randomPhone(), amount: 97 };
    const withPaid = newRef();
    expect((await icall('POST', '/internal/purchase', { ...base, order_ref: withPaid, paid_at: '2026-01-02T03:04:05.000Z' })).status).toBe(200);
    const p1 = (await q('select paid_at from purchases where order_ref = $1', [withPaid]))[0].paid_at as Date;
    expect(p1.toISOString()).toBe('2026-01-02T03:04:05.000Z');

    for (const bad of [null, 'semalam', 12345]) {
      const ref = newRef();
      const before = Date.now();
      expect((await icall('POST', '/internal/purchase', { ...base, order_ref: ref, paid_at: bad })).status).toBe(200);
      const p = ((await q('select paid_at from purchases where order_ref = $1', [ref]))[0].paid_at as Date).getTime();
      expect(p).toBeGreaterThanOrEqual(before - 1000);
      expect(p).toBeLessThanOrEqual(Date.now() + 1000);
    }
  });

  test('~50 KB signed purchase (full BCL transaction in raw) is accepted', async () => {
    const ref = newRef();
    const raw = { order_no: ref, notes: 'x'.repeat(50 * 1024) };
    const res = await icall('POST', '/internal/purchase', {
      order_ref: ref, source: 'poll', package_id: 'basic', name: 'P', email: `test_${rnd()}@example.test`, phone: randomPhone(), raw,
    });
    expect(res.status).toBe(200);
    expect(await q('select 1 from purchases where order_ref = $1', [ref])).toHaveLength(1);
  });

  test('missing order_ref -> 400', async () => {
    const res = await icall('POST', '/internal/purchase', { email: 'x@example.test' });
    expect(res.status).toBe(400);
  });
});

describe('known-orders, bcl-log, bcl-config', () => {
  test("known-orders: refs in purchases or logged with kind 'ignored' (not 'skipped')", async () => {
    const inPurchases = await unclaimedPurchase(`test_${rnd()}@example.test`, randomPhone());
    const ignored = newRef();
    const skipped = newRef();
    const unknown = newRef();
    // logBcl sends both kind and status
    for (const [ref, kind] of [[ignored, 'ignored'], [skipped, 'skipped']]) {
      const res = await icall('POST', '/internal/bcl-log', { order_ref: ref, kind, status: kind, detail: 'ujian', payload: { a: 1 } });
      expect(res.status).toBe(200);
    }
    const res = await icall('POST', '/internal/known-orders', { refs: [inPurchases, ignored, skipped, unknown] });
    expect(res.status).toBe(200);
    const d = (await res.json()).data;
    expect([...d.refs].sort()).toEqual([inPurchases, ignored].sort());
  });

  test('bcl-log stores kind/message/payload; status-only body accepted; null order_ref and string payload ok', async () => {
    const ref = newRef();
    expect((await icall('POST', '/internal/bcl-log', { order_ref: ref, status: 'error', detail: 'gagal', payload: 'raw text' })).status).toBe(200);
    expect((await icall('POST', '/internal/bcl-log', { order_ref: ref, kind: 'processed', status: 'processed', detail: null, payload: null })).status).toBe(200);
    const rows = await q('select kind, ok, message, payload from bcl_webhook_log where order_ref = $1 order by id', [ref]);
    expect(rows).toEqual([
      { kind: 'error', ok: false, message: 'gagal', payload: 'raw text' },
      { kind: 'processed', ok: true, message: null, payload: null },
    ]);
    expect((await icall('POST', '/internal/bcl-log', { order_ref: ref })).status).toBe(400);
  });

  test('bcl-config returns active rows with amount as a number', async () => {
    const fid = `test_form_${rnd()}`;
    const ids = await q(
      `insert into bcl_form_map (formable_id, amount_rm, package_id, active) values ($1, 97, 'basic', true), ($1, 197, 'complete', false) returning id`,
      [fid]);
    for (const r of ids) track.formMapId(r.id);
    const res = await icall('GET', '/internal/bcl-config');
    expect(res.status).toBe(200);
    const rows = ((await res.json()).data.rows as any[]).filter((r) => r.formable_id === fid);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ formable_id: fid, amount: 97, package_id: 'basic', field_value: null });
  });
});

describe('email queue', () => {
  test('pending items shaped for Mail.gs.js (payload object); status update sent/failed', async () => {
    const email = `test_${rnd()}@example.test`;
    const ref = await unclaimedPurchase(email, randomPhone(), 'complete');
    const pid = (await q('select id from purchases where order_ref = $1', [ref]))[0].id as string;
    const id = (await q(
      `insert into email_queue (to_email, subject, kind, ref_id, created_at) values ($1, 's', 'purchase_welcome', $2, now() - interval '30 days') returning id`,
      [email, pid]))[0].id as string;
    track.emailQueueId(id);

    const res = await icall('GET', '/internal/email-queue?limit=20');
    expect(res.status).toBe(200);
    const items = (await res.json()).data.items as any[];
    const it = items.find((x) => x.id === id);
    expect(it).toBeTruthy();
    expect(it.to_email).toBe(email);
    expect(it.payload).toEqual({ name: 'Test Buyer', package_name: 'Pakej Complete', order_ref: ref });
    expect(items.length).toBeLessThanOrEqual(20);

    const up = await icall('POST', `/internal/email-queue/${id}`, { status: 'failed', error: 'quota' });
    expect(up.status).toBe(200);
    expect((await q('select status, last_error, attempts from email_queue where id = $1', [id]))[0])
      .toEqual({ status: 'failed', last_error: 'quota', attempts: 1 });
    expect((await icall('POST', `/internal/email-queue/${id}`, { status: 'sent', error: null })).status).toBe(200);
    const row = (await q('select status, sent_at from email_queue where id = $1', [id]))[0];
    expect(row.status).toBe('sent');
    expect(row.sent_at).not.toBeNull();
    expect((await icall('POST', `/internal/email-queue/${id}`, { status: 'bogus' })).status).toBe(400);
    expect((await icall('POST', '/internal/email-queue/00000000-0000-0000-0000-000000000000', { status: 'sent' })).status).toBe(404);
  });
});

describe('body limit', () => {
  test('internal body over 256 KB -> 413', async () => {
    const res = await icall('POST', '/internal/bcl-log', { order_ref: 'x', kind: 'error', detail: 'a'.repeat(257 * 1024) });
    expect(res.status).toBe(413);
  });
});
