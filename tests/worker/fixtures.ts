// Shared fixtures for DB-backed Worker tests. Every row created here carries a `test_` marker and is
// removed by cleanupAll(); seed rows are never touched.
import { randomBytes } from 'node:crypto';
import { createApp } from '../../worker/src/app';
import type { Deps, FirebaseAdmin } from '../../worker/src/types';
import { q, newUid, cleanup, closeDb } from '../db/helpers';
import { pgHive, closeHive } from './pgHive';

export { q };
export const TICKET_SECRET = 'test-ticket-secret';

const uids: string[] = [];
const orderRefs: string[] = [];
const codeLabels: string[] = [];
const itemKeys: string[] = [];

export const rnd = () => randomBytes(5).toString('hex');

export function makeApp() {
  const deps: Deps = {
    verifyToken: async (tok) => {
      const m = /^tok:(.+)$/.exec(tok);
      return m ? { uid: m[1], email: `${m[1]}@example.test` } : null;
    },
    hive: pgHive,
    firebaseAdmin: {} as FirebaseAdmin,
    secrets: { internal: 'test-internal-secret', ticket: TICKET_SECRET },
    gasUrl: 'https://gas.test',
    now: () => Date.now(),
    allowedOrigins: [],
  };
  return createApp(deps);
}

/** A fresh test IP subject for rate limiting (starts with test_ so cleanup() may delete its rows). */
export function newIp(): string {
  const ip = newUid().replace('test_', 'test_ip_');
  uids.push(ip);
  return ip;
}

export async function profile(): Promise<string> {
  const u = newUid();
  uids.push(u);
  await q('insert into profiles (id, full_name, email, phone) values ($1,$2,$3,$4)', [
    u, 'Test User', `${u}@example.test`, '0123456789',
  ]);
  return u;
}

/** Claimed purchase of a package for uid (entitlements copied from package_items). */
export async function purchase(uid: string, pkg: 'basic' | 'complete'): Promise<void> {
  const ref = `test_w7_${rnd()}`;
  orderRefs.push(ref);
  await q(
    `insert into purchases (order_ref, package_id, entitlements, status, claimed_by, claimed_at)
     values ($1, $2, (select array_agg(item_key order by item_key) from package_items where package_id = $2),
             'dituntut', $3, now())`,
    [ref, pkg, uid],
  );
}

const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export function randomCode(): string {
  const b = randomBytes(8);
  const s = Array.from(b, (x) => CODE_ALPHABET[x % CODE_ALPHABET.length]).join('');
  return `HDMB-${s.slice(0, 4)}-${s.slice(4)}`;
}

/** Unused access code for a package, labelled test_ for cleanup. */
export async function accessCode(pkg: 'basic' | 'complete', extra: { status?: string; endsAt?: string } = {}): Promise<string> {
  const label = `test_lbl_${rnd()}`;
  codeLabels.push(label);
  const code = randomCode();
  await q(
    `insert into access_codes (code, package_id, entitlements, batch_label, status, access_ends_at)
     values ($1, $2, (select array_agg(item_key order by item_key) from package_items where package_id = $2), $3, $4, $5)`,
    [code, pkg, label, extra.status ?? 'belum_guna', extra.endsAt ?? null],
  );
  return code;
}

/** Test catalogue item + ebook with a file; returns the ebook id. Grant it with grant(). */
export async function testEbook(fileId: string): Promise<{ id: string; itemKey: string }> {
  const key = `test_ebook_${rnd()}`;
  itemKeys.push(key);
  await q(`insert into items (key, name, kind, sort) values ($1, 'Test Ebook', 'ebook', 900)`, [key]);
  const id = (await q(
    `insert into ebooks (item_key, number, title, file_drive_id, allow_download, file_updated_at, sort)
     values ($1, 99, 'Test Ebook', $2, true, now(), 900) returning id`,
    [key, fileId],
  ))[0].id as string;
  return { id, itemKey: key };
}

export async function grant(uid: string, itemKey: string): Promise<void> {
  await q('insert into manual_grants (user_id, item_key) values ($1, $2)', [uid, itemKey]);
}

export async function ebookId(itemKey: string): Promise<string> {
  return (await q('select id from ebooks where item_key = $1', [itemKey]))[0].id as string;
}

export async function cleanupAll(): Promise<void> {
  const step = async (fn: () => Promise<unknown>) => {
    try { await fn(); } catch (e) { console.error('cleanup step failed:', (e as Error).message); }
  };
  await step(() => q(
    `delete from audit_logs where target_type = 'access_code'
       and target_id in (select id::text from access_codes where batch_label = any($1::text[]))`, [codeLabels]));
  await step(() => q('delete from access_codes where batch_label = any($1::text[])', [codeLabels]));
  await step(() => q('delete from purchases where order_ref = any($1::text[])', [orderRefs]));
  await step(() => cleanup(uids));
  await step(() => q('delete from manual_grants where item_key = any($1::text[])', [itemKeys]));
  await step(() => q('delete from ebooks where item_key = any($1::text[])', [itemKeys]));
  await step(() => q('delete from items where key = any($1::text[])', [itemKeys]));
  await step(() => closeHive());
  await step(() => closeDb());
}

/** Request helper: JSON body, bearer token for uid, fixed test IP. */
export function call(
  app: ReturnType<typeof makeApp>,
  method: string,
  path: string,
  opts: { uid?: string; body?: unknown; ip?: string; rawBody?: string } = {},
) {
  const headers: Record<string, string> = {};
  if (opts.uid) headers.Authorization = `Bearer tok:${opts.uid}`;
  if (opts.ip) headers['CF-Connecting-IP'] = opts.ip;
  let body: string | undefined;
  if (opts.rawBody !== undefined) body = opts.rawBody;
  else if (opts.body !== undefined) body = JSON.stringify(opts.body);
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  return app.request(path, { method, headers, body });
}
