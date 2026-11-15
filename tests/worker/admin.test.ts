// /api/admin/*: superadmin manages everything; coach may only read summary + participants.
import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import {
  makeApp, call, q, staff, profile, purchase, unclaimedPurchase, randomPhone, rnd, fakeFirebase, track,
  INTERNAL_SECRET, GAS_URL, cleanupAll,
} from './fixtures';
import { verifySigHeader } from '../../worker/src/hmac';

afterAll(cleanupAll);

let SA = '';
let COACH = '';
let P = '';
const fb = fakeFirebase();
const gasCalls: { url: string; body: string }[] = [];
const fakeFetch = (async (url: string | URL | Request, init?: RequestInit) => {
  gasCalls.push({ url: String(url), body: String(init?.body ?? '') });
  return new Response(JSON.stringify({ ok: true, result: { ok: true } }), { headers: { 'Content-Type': 'application/json' } });
}) as typeof fetch;
const app = makeApp({ firebaseAdmin: fb.admin, fetch: fakeFetch });

const auditCount = async (actor: string) =>
  (await q('select count(*)::int n from audit_logs where actor = $1', [actor]))[0].n as number;

beforeAll(async () => {
  SA = await staff('superadmin');
  COACH = await staff('coach');
  P = await profile();
  await purchase(P, 'basic');
});

describe('coach access', () => {
  test('coach: summary/participants 200; grant, codes, content, purchases -> 403', async () => {
    const sum = await call(app, 'GET', '/api/admin/summary', { uid: COACH });
    expect(sum.status).toBe(200);
    const s = (await sum.json()).data;
    expect(typeof s.participants).toBe('number');
    const list = await call(app, 'GET', `/api/admin/participants?q=${encodeURIComponent(P)}`, { uid: COACH });
    expect(list.status).toBe(200);
    const rows = (await list.json()).data as any[];
    expect(rows.map((r) => r.id)).toContain(P);
    const one = await call(app, 'GET', `/api/admin/participants/${P}`, { uid: COACH });
    expect(one.status).toBe(200);
    expect((await one.json()).data.profile.id).toBe(P);

    const denied: [string, string, unknown?][] = [
      ['POST', `/api/admin/participants/${P}/grant`, { item_key: 'tdee', reason: 'x' }],
      ['POST', `/api/admin/participants/${P}/reset-password`, {}],
      ['GET', '/api/admin/codes'],
      ['POST', '/api/admin/codes/generate', { package_id: 'basic', count: 1, label: 'x' }],
      ['GET', '/api/admin/content/items'],
      ['POST', '/api/admin/content/items', { key: 'test_x', name: 'x', kind: 'tool' }],
      ['GET', '/api/admin/purchases'],
      ['GET', '/api/admin/audit'],
      ['GET', '/api/admin/bcl-map'],
    ];
    for (const [m, path, body] of denied) {
      const res = await call(app, m, path, { uid: COACH, body });
      expect(res.status, `${m} ${path}`).toBe(403);
      expect((await res.json()).reason).toBe('tiada_kebenaran');
    }
    expect(await q('select 1 from manual_grants where user_id = $1', [P])).toHaveLength(0);
    expect(fb.calls.passwords).toHaveLength(0);
  });

  test('participant uid of a missing user -> 404', async () => {
    const res = await call(app, 'GET', '/api/admin/participants/test_nobody_here', { uid: SA });
    expect(res.status).toBe(404);
  });
});

describe('summary extras and list paging (0006)', () => {
  test('summary: superadmin gets webhook_errors + email_queue; coach gets counts but no webhook rows', async () => {
    const sa = (await (await call(app, 'GET', '/api/admin/summary', { uid: SA })).json()).data;
    expect(Array.isArray(sa.webhook_errors)).toBe(true);
    expect(typeof sa.email_queue.pending).toBe('number');
    expect(typeof sa.email_queue.failed).toBe('number');
    const co = (await (await call(app, 'GET', '/api/admin/summary', { uid: COACH })).json()).data;
    expect(co.webhook_errors).toEqual([]);
    expect(typeof co.email_queue.pending).toBe('number');
  });

  test('offset: validated integer >= 0 on purchases / participants / codes', async () => {
    for (const base of ['/api/admin/purchases', '/api/admin/participants', '/api/admin/codes']) {
      for (const bad of ['-1', 'abc', '1.5', '1e3']) {
        const res = await call(app, 'GET', `${base}?offset=${bad}`, { uid: SA });
        expect(res.status, `${base} ${bad}`).toBe(400);
        expect((await res.json()).reason).toBe('data_tidak_sah');
      }
      const page = await call(app, 'GET', `${base}?offset=0`, { uid: SA });
      expect(page.status, base).toBe(200);
      const rows = (await page.json()).data as any[];
      expect(Array.isArray(rows)).toBe(true);
      if (rows.length) expect(Number(rows[0].total)).toBeGreaterThanOrEqual(rows.length);
      const far = await call(app, 'GET', `${base}?offset=999999999`, { uid: SA });
      expect((await far.json()).data).toEqual([]);
    }
    const one = await call(app, 'GET', `/api/admin/participants?q=${encodeURIComponent(P)}&offset=0`, { uid: COACH });
    expect(((await one.json()).data as any[]).map((r) => r.id)).toEqual([P]);
    const rows = (await (await call(app, 'GET', '/api/admin/purchases', { uid: SA })).json()).data as any[];
    if (rows.length) expect(typeof rows[0].squatter_suspect).toBe('boolean');
  });
});

describe('content CRUD', () => {
  test('content/:table outside whitelist -> 404; column outside whitelist ignored', async () => {
    for (const t of ['profiles', 'user_roles', 'audit_logs', 'purchases', 'bcl_form_map', 'items;drop']) {
      const res = await call(app, 'GET', `/api/admin/content/${encodeURIComponent(t)}`, { uid: SA });
      expect(res.status, t).toBe(404);
      const post = await call(app, 'POST', `/api/admin/content/${encodeURIComponent(t)}`, { uid: SA, body: { id: 'x' } });
      expect(post.status, t).toBe(404);
    }
    const key = `test_item_${rnd()}`;
    track.itemKey(key);
    const res = await call(app, 'POST', '/api/admin/content/items', {
      uid: SA, body: { key, name: 'Item Ujian', kind: 'tool', sort: 950, evil: 'x', 'name"; drop table items; --': 1 },
    });
    expect(res.status).toBe(200);
    const row = (await res.json()).data;
    expect(row).toMatchObject({ key, name: 'Item Ujian', kind: 'tool', sort: 950, active: true });
    expect(row).not.toHaveProperty('evil');

    const upd = await call(app, 'PUT', `/api/admin/content/items/${key}`, { uid: SA, body: { name: 'Baru', key: 'test_other', bogus: 1 } });
    expect(upd.status).toBe(200);
    expect((await q('select key, name from items where key = $1', [key]))[0]).toEqual({ key, name: 'Baru' });

    const only = await call(app, 'PUT', `/api/admin/content/items/${key}`, { uid: SA, body: { bogus: 1 } });
    expect(only.status).toBe(400);

    const get = await call(app, 'GET', `/api/admin/content/items/${key}`, { uid: SA });
    expect((await get.json()).data.name).toBe('Baru');
    const list = await call(app, 'GET', '/api/admin/content/items', { uid: SA });
    expect(((await list.json()).data as any[]).some((r) => r.key === key)).toBe(true);

    const del = await call(app, 'DELETE', `/api/admin/content/items/${key}`, { uid: SA });
    expect(del.status).toBe(200);
    expect(await q('select 1 from items where key = $1', [key])).toHaveLength(0);
    const missing = await call(app, 'PUT', `/api/admin/content/items/${key}`, { uid: SA, body: { name: 'x' } });
    expect(missing.status).toBe(404);
  });

  test('superadmin reads and writes ebooks.file_drive_id via content routes', async () => {
    const key = `test_ebook_${rnd()}`;
    track.itemKey(key);
    expect((await call(app, 'POST', '/api/admin/content/items', { uid: SA, body: { key, name: 'E', kind: 'ebook' } })).status).toBe(200);
    const res = await call(app, 'POST', '/api/admin/content/ebooks', {
      uid: SA, body: { item_key: key, title: 'Ebook Ujian', number: 98, file_drive_id: 'drive_abc', allow_download: true, sort: 990 },
    });
    expect(res.status).toBe(200);
    const eb = (await res.json()).data;
    expect(eb.file_drive_id).toBe('drive_abc');
    const upd = await call(app, 'PUT', `/api/admin/content/ebooks/${eb.id}`, { uid: SA, body: { file_drive_id: 'drive_xyz' } });
    expect(upd.status).toBe(200);
    expect((await upd.json()).data.file_drive_id).toBe('drive_xyz');
    const bad = await call(app, 'PUT', '/api/admin/content/ebooks/not-a-uuid', { uid: SA, body: { title: 'x' } });
    expect(bad.status).toBe(404);
    expect((await call(app, 'DELETE', `/api/admin/content/ebooks/${eb.id}`, { uid: SA })).status).toBe(200);
  });

  test('constraint violation -> 400, not 500', async () => {
    const res = await call(app, 'POST', '/api/admin/content/items', { uid: SA, body: { key: `test_bad_${rnd()}`, name: 'x', kind: 'nonsense' } });
    expect(res.status).toBe(400);
    expect((await res.json()).reason).toBe('data_tidak_sah');
  });
});

describe('audit', () => {
  test('every superadmin mutation adds one audit_logs row', async () => {
    const actor = await staff('superadmin');
    const target = await profile();
    let n = await auditCount(actor);
    const step = async (label: string, m: string, path: string, body?: unknown) => {
      const res = await call(app, m, path, { uid: actor, body });
      expect(res.status, `${label}: ${await res.clone().text()}`).toBe(200);
      const now = await auditCount(actor);
      expect(now, label).toBe(n + 1);
      n = now;
      return (await res.json()).data;
    };

    const g = await step('grant', 'POST', `/api/admin/participants/${target}/grant`, { item_key: 'tdee', reason: 'ujian' });
    expect((await q('select entitlements_for($1) e', [target]))[0].e).toEqual(['tdee']);
    await step('revoke', 'POST', `/api/admin/grants/${g.id}/revoke`);
    expect((await q('select entitlements_for($1) e', [target]))[0].e).toEqual([]);

    fb.users.set(`${target}@example.test`, { uid: target, email: `${target}@example.test`, password: 'old' });
    const pw = await step('reset-password', 'POST', `/api/admin/participants/${target}/reset-password`);
    expect(pw.password).toMatch(/^[A-HJ-NP-Za-km-np-z2-9]{10}$/);
    expect(fb.calls.passwords.at(-1)).toEqual([target, pw.password]);
    const auditRow = (await q(`select detail::text d from audit_logs where actor = $1 and action = 'participant.reset_password'`, [actor]))[0];
    expect(auditRow.d).not.toContain(pw.password);

    const label = `test_lbl_${rnd()}`;
    track.codeLabel(label);
    const codes = await step('codes.generate', 'POST', '/api/admin/codes/generate', { package_id: 'basic', count: 2, label });
    expect(codes).toHaveLength(2);
    expect(codes[0].code).toMatch(/^HDMB-/);
    const listed = await call(app, 'GET', `/api/admin/codes?q=${label}`, { uid: actor });
    expect((await listed.json()).data).toHaveLength(2);
    await step('codes.action', 'POST', `/api/admin/codes/${codes[0].id}/action`, { action: 'cancel' });
    expect((await q('select status from access_codes where id = $1', [codes[0].id]))[0].status).toBe('dibatalkan');

    const b = { email: `test_${rnd()}@example.test`, phone: randomPhone() };
    const ref = await unclaimedPurchase(b.email, b.phone);
    const pid = (await q('select id from purchases where order_ref = $1', [ref]))[0].id as string;
    const pl = await call(app, 'GET', `/api/admin/purchases?q=${ref}`, { uid: actor });
    expect(((await pl.json()).data as any[]).map((r) => r.id)).toEqual([pid]);
    await step('purchase.action', 'POST', `/api/admin/purchases/${pid}/action`, { action: 'assign', payload: { user_id: target } });
    expect((await q('select claimed_by from purchases where id = $1', [pid]))[0].claimed_by).toBe(target);

    const before = gasCalls.length;
    const rp = await step('reprocess', 'POST', `/api/admin/purchases/${pid}/reprocess`);
    expect(rp).toEqual({ ok: true, result: { ok: true } });
    expect(gasCalls.length).toBe(before + 1);
    const sent = JSON.parse(gasCalls.at(-1)!.body);
    expect(gasCalls.at(-1)!.url).toBe(GAS_URL);
    expect(Object.keys(sent).sort()).toEqual(['payload', 'sig', 'src', 't']);
    expect(sent.src).toBe('worker');
    expect(typeof sent.payload).toBe('string');
    expect(JSON.parse(sent.payload)).toEqual({ action: 'reprocess', order_ref: ref });
    expect(await verifySigHeader(INTERNAL_SECRET, `t=${sent.t},v1=${sent.sig}`, sent.payload, Math.floor(Date.now() / 1000))).toBe(true);

    await step('resend-welcome', 'POST', `/api/admin/purchases/${pid}/resend-welcome`);
    expect((await q(`select to_email, status from email_queue where ref_id = $1`, [pid]))).toEqual([{ to_email: b.email, status: 'pending' }]);

    const fm = await step('bcl-map create', 'POST', '/api/admin/bcl-map', {
      formable_id: `test_form_${rnd()}`, amount_rm: 97, package_id: 'basic', active: false, junk: 1,
    });
    track.formMapId(fm.id);
    expect(Number(fm.amount_rm)).toBe(97);
    await step('bcl-map update', 'PUT', `/api/admin/bcl-map/${fm.id}`, { amount_rm: 98 });
    const maps = await call(app, 'GET', '/api/admin/bcl-map', { uid: actor });
    expect(((await maps.json()).data as any[]).some((r) => r.id === fm.id)).toBe(true);
    await step('bcl-map delete', 'DELETE', `/api/admin/bcl-map/${fm.id}`);

    const key = `test_item_${rnd()}`;
    track.itemKey(key);
    await step('content create', 'POST', '/api/admin/content/items', { key, name: 'A', kind: 'tool' });
    await step('content update', 'PUT', `/api/admin/content/items/${key}`, { name: 'B' });
    await step('content delete', 'DELETE', `/api/admin/content/items/${key}`);

    const audit = await call(app, 'GET', '/api/admin/audit?limit=5', { uid: actor });
    const rows = (await audit.json()).data as any[];
    expect(rows).toHaveLength(5);
    expect(rows[0].actor).toBe(actor);
  });

  test('failed mutation (unknown item) -> 400, no audit row', async () => {
    const actor = await staff('superadmin');
    const target = await profile();
    const res = await call(app, 'POST', `/api/admin/participants/${target}/grant`, { uid: actor, body: { item_key: 'no_such_item' } });
    expect(res.status).toBe(400);
    expect((await res.json()).reason).toBe('item_tidak_sah');
    expect(await auditCount(actor)).toBe(0);
  });
});
