// DB test helpers. Single environment (hdm_prod): every test uid starts with `test_`
// and is removed by cleanup(). Connects directly over HIVE_PG_URL from .env.prod.
import { randomBytes } from 'node:crypto';
import pg from 'pg';
// @ts-expect-error plain .mjs helper without types
import { loadEnv } from '../../scripts/hive.mjs';

const env = loadEnv('prod') as Record<string, string>;
if (!env.HIVE_PG_URL) throw new Error('.env.prod is missing HIVE_PG_URL');

export const pool = new pg.Pool({ connectionString: env.HIVE_PG_URL, max: 3 });

export async function q<T = Record<string, any>>(sql: string, params: unknown[] = []): Promise<T[]> {
  return (await pool.query(sql, params as any[])).rows as T[];
}

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';
export function newUid(): string {
  const b = randomBytes(20);
  return 'test_' + Array.from(b, (x) => ALPHABET[x % ALPHABET.length]).join('');
}

/** Tables holding per-user data, keyed by the listed column. Extended as later tasks add tables. */
const USER_TABLES: [string, string][] = [
  ['manual_grants', 'user_id'],
  ['user_roles', 'user_id'],
  ['profiles', 'id'],
];

/** Delete every row belonging to the given test uids. Refuses non-test uids. */
export async function cleanup(uids: string[]): Promise<void> {
  if (!uids.length) return;
  if (uids.some((u) => !u.startsWith('test_'))) throw new Error('cleanup refuses non test_ uids');
  for (const [table, col] of USER_TABLES) {
    // later-task tables may not exist yet; skip those quietly
    const exists = (await q('select to_regclass($1) as r', [`public.${table}`]))[0].r;
    if (exists) await q(`delete from ${table} where ${col} = any($1::text[])`, [uids]);
  }
  await q(`delete from audit_logs where actor = any($1::text[]) or target_id = any($1::text[])`, [uids]);
}

export async function closeDb(): Promise<void> {
  await pool.end();
}
