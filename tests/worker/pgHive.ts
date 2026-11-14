// Test-only Hive adapter: runs the Worker's SQL over the direct Postgres connection (HIVE_PG_URL)
// and returns values the way HornetHive REST does: json/jsonb as a JSON *string*, text[] in Postgres
// text form ({a,b}), numeric as a string. That way the Worker's json<T>() parsing path is exercised
// and any Worker SQL selecting a raw array would break here just as it would in production.
import pg from 'pg';
// @ts-expect-error plain .mjs helper without types
import { loadEnv } from '../../scripts/hive.mjs';
import { jsonCell } from '../../worker/src/hive';
import type { Hive } from '../../worker/src/types';

const env = loadEnv('prod') as Record<string, string>;
if (!env.HIVE_PG_URL) throw new Error('.env.prod is missing HIVE_PG_URL');

const RAW_OIDS = new Set([114 /* json */, 3802 /* jsonb */, 1009 /* text[] */, 1700 /* numeric */]);
const types = {
  getTypeParser(oid: number, format?: any) {
    if (RAW_OIDS.has(oid)) return (v: string) => v;
    return (pg.types.getTypeParser as any)(oid, format);
  },
};

export const hivePool = new pg.Pool({
  connectionString: env.HIVE_PG_URL,
  max: 3,
  connectionTimeoutMillis: 45000,
  types: types as any,
});

async function q<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
  return (await hivePool.query(sql, params as any[])).rows as T[];
}

async function one<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T> {
  const rows = await q<T>(sql, params);
  if (rows.length !== 1) throw new Error(`hive: expected 1 row, got ${rows.length}`);
  return rows[0];
}

async function json<T = unknown>(sql: string, params?: unknown[]): Promise<T> {
  return jsonCell<T>(await one<Record<string, unknown>>(sql, params));
}

export const pgHive: Hive = { q, one, json };

export async function closeHive(): Promise<void> {
  await hivePool.end();
}
