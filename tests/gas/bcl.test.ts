// Bcl.gs.js / Mail.gs.js / Router.gs.js with fake Apps Script services: no global lock around order processing,
// one non-blocking email attempt after a new purchase, constant-time webhook key, paged polling, email kinds.
import { describe, it, expect } from 'vitest';
import { loadGas, fixture } from './load';

const FILES = ['Hmac.gs.js', 'BclLogic.gs.js', 'Config.gs.js', 'Worker.gs.js', 'Bcl.gs.js', 'Mail.gs.js', 'Router.gs.js'];
const WORKER = 'https://worker.test';
const BCL = 'https://bcl.test/api';

type Opts = {
  /** order_ref -> BCL transaction */
  txns?: Record<string, any>;
  /** BCL list pages (page 1 first) */
  pages?: any[][];
  /** refs the Worker already knows */
  known?: string[];
  /** tryLock result */
  lockFree?: boolean;
  /** form map rows */
  map?: any[];
  /** /internal/purchase data */
  purchase?: (body: any) => any;
  queue?: any[];
};

function gas(opts: Opts = {}) {
  const calls = {
    worker: [] as { method: string; path: string; body: any }[],
    bclPaths: [] as string[],
    locks: [] as number[],
    released: 0,
    mail: [] as any[],
  };
  const props: Record<string, string> = {
    BCL_WEBHOOK_KEY: 'k3y-secret-value', BCL_API_BASE: BCL, BCL_API_TOKEN: 'tok', WORKER_URL: WORKER,
    INTERNAL_SECRET: 'int', APP_URL: 'https://app.test/#/lama',
  };
  const resp = (code: number, body: unknown) => ({ getResponseCode: () => code, getContentText: () => JSON.stringify(body) });
  const workerAnswer = (method: string, path: string, body: any) => {
    if (path === '/internal/bcl-config') return { rows: opts.map ?? [{ formable_id: '77', amount: 100, package_id: 'basic' }] };
    if (path === '/internal/known-orders') return { refs: body.refs.filter((r: string) => (opts.known ?? []).includes(r)) };
    if (path === '/internal/purchase') return (opts.purchase ?? (() => ({ inserted: true, status: 'belum_dituntut' })))(body);
    if (path === '/internal/bcl-log') return { id: 1 };
    if (path.startsWith('/internal/email-queue?')) return { items: opts.queue ?? [] };
    if (path.startsWith('/internal/email-queue/')) return {};
    throw new Error('unexpected worker path ' + path);
  };
  const UrlFetchApp = {
    fetch(url: string, o: any) {
      if (url.startsWith(WORKER)) {
        const path = url.slice(WORKER.length);
        const body = o.payload ? JSON.parse(o.payload) : null;
        calls.worker.push({ method: o.method, path, body });
        return resp(200, { ok: true, data: workerAnswer(o.method, path, body) });
      }
      const path = url.slice(BCL.length);
      calls.bclPaths.push(path);
      const one = /^\/transactions\/([^?]+)$/.exec(path);
      if (one) return resp(200, { data: opts.txns?.[decodeURIComponent(one[1])] ?? null });
      const page = Number(/[?&]page=(\d+)/.exec(path)?.[1] ?? 1);
      return resp(200, { data: (opts.pages ?? [])[page - 1] ?? [] });
    },
  };
  const g = loadGas(FILES, {
    Date, encodeURIComponent, decodeURIComponent, console: { error: () => {}, log: () => {} },
    UrlFetchApp,
    PropertiesService: { getScriptProperties: () => ({ getProperty: (k: string) => props[k] ?? null }) },
    LockService: {
      getScriptLock: () => ({
        tryLock: (ms: number) => { calls.locks.push(ms); return opts.lockFree ?? true; },
        releaseLock: () => { calls.released++; },
      }),
    },
    MailApp: { getRemainingDailyQuota: () => 100, sendEmail: (m: any) => calls.mail.push(m) },
    ContentService: { MimeType: { JSON: 'json' }, createTextOutput: (s: string) => ({ body: JSON.parse(s), setMimeType() { return this; } }) },
  });
  return { g, calls, props };
}

const paidTxn = (ref: string, extra: Record<string, unknown> = {}) => ({ ...fixture('txn-paid-live.json'), order_no: ref, ...extra });
const webhook = (k: string | undefined, ref = 'BCL-1') => ({
  parameter: { src: 'bcl', ...(k === undefined ? {} : { k }) },
  postData: { contents: JSON.stringify({ data: { order_no: ref } }) },
});

describe('webhook', () => {
  it('rejects a missing / wrong / prefix key without calling BCL or the Worker', () => {
    const { g, calls } = gas();
    for (const k of [undefined, '', 'wrong', 'k3y-secret-valu', 'k3y-secret-value ']) {
      expect(g.doPost(webhook(k)).body).toEqual({ ok: false, reason: 'forbidden' });
    }
    expect(calls.bclPaths).toEqual([]);
    expect(calls.worker).toEqual([]);
  });

  it('compares the key with _safeEqual (constant time)', () => {
    const { g } = gas();
    let used = 0;
    const orig = g._safeEqual;
    g._safeEqual = (a: string, b: string) => { used++; return orig(a, b); };
    g.doPost(webhook('wrong'));
    expect(used).toBe(1);
  });

  it('processes the order WITHOUT the script lock, even while the lock is busy (mail runs later)', () => {
    const { g, calls } = gas({ txns: { 'BCL-1': paidTxn('BCL-1') }, lockFree: false });
    const out = g.doPost(webhook('k3y-secret-value'));
    expect(out.body).toEqual({ ok: true, result: 'processed' });
    const purchase = calls.worker.find((c) => c.path === '/internal/purchase');
    expect(purchase?.body).toMatchObject({ order_ref: 'BCL-1', source: 'webhook', package_id: 'basic', email: 'ali@gmail.com', phone: '60123456789' });
    // one non-blocking attempt for the email queue; busy -> skipped, the 30-min trigger sends it
    expect(calls.locks).toEqual([0]);
    expect(calls.worker.some((c) => c.path.startsWith('/internal/email-queue'))).toBe(false);
  });

  it('new purchase + free lock -> email queue processed once, lock released', () => {
    const { g, calls } = gas({
      txns: { 'BCL-1': paidTxn('BCL-1') },
      queue: [{ id: 'q1', to_email: 'ali@gmail.com', kind: 'purchase_welcome', payload: { name: 'Ali', package_name: 'Pakej Basic' } }],
    });
    g.doPost(webhook('k3y-secret-value'));
    expect(calls.locks).toEqual([0]);
    expect(calls.released).toBe(1);
    expect(calls.mail).toHaveLength(1);
    expect(calls.worker.find((c) => c.path === '/internal/email-queue/q1')?.body).toEqual({ status: 'sent', error: null });
  });

  it('an existing, unchanged purchase does not touch the email queue', () => {
    const { g, calls } = gas({ txns: { 'BCL-1': paidTxn('BCL-1') }, purchase: () => ({ inserted: false, changed: false, status: 'dituntut' }) });
    g.doPost(webhook('k3y-secret-value'));
    expect(calls.locks).toEqual([]);
  });
});

describe('reprocess (Worker -> Apps Script)', () => {
  const signed = (g: any, payload: object) => {
    const p = JSON.stringify(payload);
    const t = Math.floor(Date.now() / 1000);
    return { postData: { contents: JSON.stringify({ src: 'worker', t, sig: g.gasSign('int', t, p), payload: p }) }, parameter: {} };
  };

  it('processes a previously ignored ref (force) without the lock and logs the new outcome', () => {
    const { g, calls } = gas({ txns: { 'R-9': paidTxn('R-9') }, known: ['R-9'], lockFree: false });
    const out = g.doPost(signed(g, { action: 'reprocess', order_ref: 'R-9', force: true }));
    expect(out.body.ok).toBe(true);
    expect(out.body.result.data).toMatchObject({ inserted: true, status: 'belum_dituntut' });
    expect(calls.worker.find((c) => c.path === '/internal/purchase')?.body.source).toBe('reprocess');
    const log = calls.worker.filter((c) => c.path === '/internal/bcl-log').at(-1);
    expect(log?.body).toMatchObject({ order_ref: 'R-9', kind: 'processed' });
    expect(log?.body.detail).toContain('belum_dituntut');
  });

  it('still unmapped -> ok:false reason unmapped, logged ignored again', () => {
    const { g, calls } = gas({ txns: { 'R-8': paidTxn('R-8', { formable_id: '999' }) } });
    const out = g.doPost(signed(g, { action: 'reprocess', order_ref: 'R-8', force: true }));
    expect(out.body).toMatchObject({ ok: false, result: { ok: false, reason: 'unmapped' } });
    expect(calls.worker.filter((c) => c.path === '/internal/bcl-log').at(-1)?.body.kind).toBe('ignored');
  });
});

describe('pollBcl', () => {
  const page = (refs: string[], unpaid: string[] = []) => [
    ...refs.map((r) => paidTxn(r)), ...unpaid.map((r) => paidTxn(r, { status: 1, is_paid: false })),
  ];
  const full = (start: number, n = 100) => page(Array.from({ length: n }, (_, i) => `P-${start + i}`));

  it('pages back until a page whose paid refs are all known', () => {
    const p1 = full(1), p2 = full(101), p3 = full(201), p4 = full(301);
    const known = [...Array.from({ length: 100 }, (_, i) => `P-${201 + i}`), ...Array.from({ length: 50 }, (_, i) => `P-${151 + i}`)];
    const txns = Object.fromEntries([...p1, ...p2].map((t) => [t.order_no, t]));
    const { g, calls } = gas({ pages: [p1, p2, p3, p4], known, txns, lockFree: false });
    g.pollBcl();
    const listCalls = calls.bclPaths.filter((p) => p.startsWith('/transactions?'));
    expect(listCalls).toEqual([
      '/transactions?per_page=100&sort=-id&page=1', '/transactions?per_page=100&sort=-id&page=2', '/transactions?per_page=100&sort=-id&page=3',
    ]);
    const processed = calls.worker.filter((c) => c.path === '/internal/purchase').map((c) => c.body.order_ref);
    expect(processed).toHaveLength(150); // page 1 (100) + unknown half of page 2 (50)
    expect(processed).not.toContain('P-151');
    expect(calls.locks.every((ms) => ms === 0)).toBe(true); // never a blocking lock
  });

  it('stops at the page cap (5) and on a short page', () => {
    const pages = Array.from({ length: 7 }, (_, i) => full(i * 100 + 1));
    const { g, calls } = gas({ pages, txns: {} });
    g.pollBcl();
    expect(calls.bclPaths.filter((p) => p.startsWith('/transactions?'))).toHaveLength(5);
    const short = gas({ pages: [page(['A-1'], ['A-2'])], known: ['A-1'] });
    short.g.pollBcl();
    expect(short.calls.bclPaths.filter((p) => p.startsWith('/transactions?'))).toHaveLength(1);
    expect(short.calls.worker.find((c) => c.path === '/internal/known-orders')?.body).toEqual({ refs: ['A-1'] });
  });

  it('a failing order is logged and the poll goes on', () => {
    const { g, calls } = gas({ pages: [page(['E-1', 'E-2'])], txns: { 'E-2': paidTxn('E-2') } });
    g.pollBcl(); // E-1 -> BCL returns null -> not paid live (skipped); E-2 processed
    expect(calls.worker.filter((c) => c.path === '/internal/purchase').map((c) => c.body.order_ref)).toEqual(['E-2']);
  });
});

describe('pollBclPages (pure)', () => {
  it('a page with no paid orders does not stop the walk', () => {
    const { g } = gas();
    const seen: number[] = [];
    const pages = [[{ status: 1 }], [{ ...fixture('txn-paid-live.json'), order_no: 'Z-1' }]];
    const r = g.pollBclPages((p: number) => { seen.push(p); return pages[p - 1] ?? []; }, () => [], () => {}, { perPage: 1, maxPages: 5 });
    expect(seen).toEqual([1, 2, 3]);
    expect(r.processed).toEqual(['Z-1']);
  });
});

describe('emails by kind', () => {
  it('purchase_welcome: register link with the same email + phone', () => {
    const { g } = gas();
    const m = g.renderEmail({ kind: 'purchase_welcome', payload: { name: 'Ali', package_name: 'Pakej Basic' } });
    expect(m.subject).toContain('daftar akaun');
    expect(m.body).toContain('https://app.test/#/daftar');
    expect(m.body).toContain('emel dan nombor telefon yang SAMA');
  });

  it('purchase_added: access added + login link, no register step, no result promises', () => {
    const { g } = gas();
    const m = g.renderEmail({ kind: 'purchase_added', payload: { name: 'Ali', package_name: 'Pakej Complete', order_ref: 'BCL-7' } });
    expect(m.subject).toBe('Akses baharu telah ditambah ke akaun anda - HDM Booster');
    expect(m.body).toContain('Akses baharu telah ditambah ke akaun anda');
    expect(m.body).toContain('Pakej Complete');
    expect(m.body).toContain('https://app.test/#/masuk');
    expect(m.body).not.toContain('#/daftar');
    expect(m.body).not.toMatch(/dijamin|pasti turun|jaminan/i);
  });

  it('queue sends each kind with its own text', () => {
    const { g, calls } = gas({ queue: [
      { id: 'a', to_email: 'x@y.z', kind: 'purchase_added', payload: { name: 'X', package_name: 'Pakej Complete' } },
      { id: 'b', to_email: 'w@y.z', kind: 'purchase_welcome', payload: { name: 'W' } },
    ] });
    g.processEmailQueueTrigger();
    expect(calls.locks).toEqual([30000]);
    expect(calls.mail.map((m) => m.subject)).toEqual([
      'Akses baharu telah ditambah ke akaun anda - HDM Booster', 'Selamat datang ke HDM Booster - daftar akaun anda',
    ]);
  });
});
