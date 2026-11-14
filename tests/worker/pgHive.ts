// Test-only Hive adapter: runs the Worker's SQL over the direct Postgres connection (HIVE_PG_URL)
// and returns values the way HornetHive REST does: json/jsonb as a JSON *string*, text[] in Postgres
// text form ({a,b}), numeric as a string. That way the Worker's json<T>() parsing path is exercised
// and any Worker SQL selecting a raw array would break here just as it would in production.
import pg from 'pg';
// @ts-expect-error plain .mjs helper without types
import { loadEnv } from '../../scripts/hive.mjs';
import { hiveFromQuery } from '../../worker/src/hive';
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

const CONNECT_ERRORS = new Set(['ETIMEDOUT', 'ECONNREFUSED', 'EAI_AGAIN', 'ENOTFOUND']);
/** Retries only failures to CONNECT (the remote pooler occasionally drops a SYN); query errors are never retried. */
export async function withConnectRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  for (let i = 1; ; i++) {
    try {
      return await fn();
    } catch (e) {
      const code = (e as { code?: string }).code ?? '';
      const connectFail = CONNECT_ERRORS.has(code) || /timeout exceeded when trying to connect/i.test(String((e as Error).message));
      if (!connectFail || i >= attempts) throw e;
    }
  }
}

/** Same q/one/json (row -> `r` cell) logic as the Worker's clients, over this retrying pool. */
export const pgHive: Hive = hiveFromQuery(async (sql, params) =>
  withConnectRetry(async () => (await hivePool.query(sql, params as any[])).rows));

export async function closeHive(): Promise<void> {
  await hivePool.end();
}
