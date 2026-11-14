// Shared fixtures for DB-backed Worker tests. Every row created here carries a `test_` marker and is
// removed by cleanupAll(); seed rows are never touched.
import { randomBytes } from 'node:crypto';
import { createApp } from '../../worker/src/app';
import type { Deps, FirebaseAdmin } from '../../worker/src/types';
import { q as dbq, newUid, cleanup, closeDb } from '../db/helpers';
import { pgHive, closeHive, withConnectRetry } from './pgHive';

export function q<T = Record<string, any>>(sql: string, params: unknown[] = []): Promise<T[]> {
  return withConnectRetry(() => dbq<T>(sql, params));
}
export const TICKET_SECRET = 'test-ticket-secret';

export const INTERNAL_SECRET = 'test-internal-secret';
export const GAS_URL = 'https://gas.test/exec';

const uids: string[] = [];
const orderRefs: string[] = [];
const codeLabels: string[] = [];
const itemKeys: string[] = [];
const formMapIds: string[] = [];
const emailQueueIds: string[] = [];

export const rnd = () => randomBytes(5).toString('hex');

/** Register a test_ uid / order_ref / label / item key / bcl_form_map id / email_queue id for cleanupAll(). */
export const track = {
  uid: (u: string) => { if (!u.startsWith('test_')) throw new Error('track.uid: not a test_ uid'); uids.push(u); },
  orderRef: (r: string) => { orderRefs.push(r); },
  codeLabel: (l: string) => { codeLabels.push(l); },
  itemKey: (k: string) => { itemKeys.push(k); },
  formMapId: (id: string) => { formMapIds.push(id); },
  emailQueueId: (id: string) => { emailQueueIds.push(id); },
};

/** In-memory FirebaseAdmin. Created uids are test_ uids tracked for cleanup. */
export function fakeFirebase() {
  const users = new Map<string, { uid: string; email: string; password: string; displayName?: string }>();
  const calls = { created: [] as string[], deleted: [] as string[], passwords: [] as [string, string][] };
  const admin: FirebaseAdmin = {
    async getUserByEmail(email) {
      const u = users.get(email.toLowerCase());
      return u ? { uid: u.uid, email: u.email } : null;
    },
    async createUser({ email, password, displayName }) {
      const e = email.toLowerCase();
      if (users.has(e)) throw Object.assign(new Error('firebase: EMAIL_EXISTS'), { code: 'EMAIL_EXISTS' });
      const uid = newUid().replace('test_', 'test_fb_');
      track.uid(uid);
      users.set(e, { uid, email: e, password, displayName });
      calls.created.push(uid);
      return { uid, email: e };
    },
    async deleteUser(uid) {
      for (const [e, u] of users) if (u.uid === uid) users.delete(e);
      calls.deleted.push(uid);
    },
    async setPassword(uid, password) {
      for (const u of users.values()) if (u.uid === uid) u.password = password;
      calls.passwords.push([uid, password]);
    },
  };
  /** Pre-existing account (e.g. an orphan from a failed earlier registration). */
  const seed = (email: string) => {
    const uid = newUid().replace('test_', 'test_fb_');
    track.uid(uid);
    users.set(email.toLowerCase(), { uid, email: email.toLowerCase(), password: 'x' });
    return uid;
  };
  return { admin, users, calls, seed };
}

export function makeApp(opts: { firebaseAdmin?: FirebaseAdmin; fetch?: typeof fetch; hive?: Deps['hive'] } = {}) {
  const deps: Deps = {
    verifyToken: async (tok) => {
      const m = /^tok:(.+)$/.exec(tok);
      return m ? { uid: m[1], email: `${m[1]}@example.test` } : null;
    },
    hive: opts.hive ?? pgHive,
    firebaseAdmin: opts.firebaseAdmin ?? fakeFirebase().admin,
    secrets: { internal: INTERNAL_SECRET, ticket: TICKET_SECRET },
    gasUrl: GAS_URL,
    now: () => Date.now(),
    allowedOrigins: [],
    fetch: opts.fetch,
  };
  return createApp(deps);
}

/** Profile with a staff role (superadmin / coach). */
export async function staff(role: 'superadmin' | 'coach'): Promise<string> {
  const u = await profile();
  await q('insert into user_roles (user_id, role) values ($1, $2)', [u, role]);
  return u;
}

/** Unclaimed BCL purchase for a buyer (email + normalised phone). Returns the order_ref. */
export async function unclaimedPurchase(email: string, phone: string, pkg: 'basic' | 'complete' = 'basic'): Promise<string> {
  const ref = `test_w8_${rnd()}`;
  orderRefs.push(ref);
  await q(
    `insert into purchases (order_ref, package_id, entitlements, buyer_name, email, phone, status)
     values ($1, $2, (select array_agg(item_key order by item_key) from package_items where package_id = $2),
             'Test Buyer', $3, $4, 'belum_dituntut')`,
    [ref, pkg, email, phone],
  );
  return ref;
}

/** Random valid Malaysian mobile in normalised form (601 + 9 digits). */
export function randomPhone(): string {
  return '601' + Array.from(randomBytes(9), (b) => String(b % 10)).join('');
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
  await step(() => q(
    `delete from audit_logs where target_type = 'access_code_batch' and target_id = any($1::text[])`, [codeLabels]));
  await step(() => q('delete from access_codes where batch_label = any($1::text[])', [codeLabels]));
  await step(() => q(
    `delete from email_queue where ref_id in (select id::text from purchases where order_ref = any($1::text[]))
        or id = any($2::uuid[])`, [orderRefs, emailQueueIds]));
  await step(() => q('delete from bcl_webhook_log where order_ref = any($1::text[])', [orderRefs]));
  await step(() => q(
    `delete from audit_logs where target_type = 'purchase'
       and target_id in (select id::text from purchases where order_ref = any($1::text[]))`, [orderRefs]));
  await step(() => q('delete from purchases where order_ref = any($1::text[])', [orderRefs]));
  await step(() => q('delete from bcl_form_map where id = any($1::uuid[])', [formMapIds]));
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
