// Postgres Hive over Cloudflare Hyperdrive (node-postgres, needs `nodejs_compat`).
// One lazily-connected Client per request: index.ts creates the hive per request and ends it with
// ctx.waitUntil(hive.close()) after the response. Hyperdrive pools the origin connections (the HornetHive
// pooled string, PgBouncer transaction mode), so a per-request Client is cheap and nothing outlives the request.
// The Hyperdrive config must be created with query caching DISABLED (`--caching-disabled`): every Worker
// read must see the latest writes (access checks, redeem, registration).
import { Client } from 'pg';
import { hiveFromQuery } from './hive';
import type { Hive } from './types';

/** The subset of pg.Client this module uses (tests inject a fake through the factory). */
export interface PgClientLike {
  connect(): Promise<unknown>;
  query(sql: string, params?: unknown[]): Promise<{ rows: unknown[] }>;
  end(): Promise<unknown>;
}
export type PgClientFactory = (connectionString: string) => PgClientLike;

const defaultFactory: PgClientFactory = (connectionString) =>
  new Client({ connectionString }) as unknown as PgClientLike;

const errCode = (e: unknown): string | undefined => {
  const c = (e as { code?: unknown })?.code;
  return typeof c === 'string' && /^[0-9A-Za-z_]{1,32}$/.test(c) ? c : undefined;
};

/**
 * A query error as a fresh Error carrying only pg's primary message and SQLSTATE: dbFail() needs both (raised
 * reasons such as `pengguna_tidak_wujud`, SQLSTATE 22xxx/23xxx). pg's `detail`, `where`, `hint` and the SQL or
 * params are never copied. Clients only ever see dbFail's mapped reasons or onError's generic 500.
 */
function queryError(e: unknown): Error {
  const code = errCode(e);
  const msg = e instanceof Error ? e.message : 'query failed';
  return Object.assign(new Error(`hive: ${msg}${code ? ` [${code}]` : ''}`), code ? { code } : {});
}

/** Connect failures can echo the host or connection string: replace them with a generic message. */
function connectError(e: unknown): Error {
  const code = errCode(e);
  return new Error(`hive: connect failed${code ? ` [${code}]` : ''}`);
}

export function createPgHive(
  connectionString: string,
  factory: PgClientFactory = defaultFactory,
): Hive & { close(): Promise<void> } {
  let ready: Promise<PgClientLike> | null = null;
  let closed = false;

  function connected(): Promise<PgClientLike> {
    if (closed) return Promise.reject(new Error('hive: closed'));
    if (!ready) {
      const c = factory(connectionString);
      ready = c.connect().then(
        () => c,
        async (e) => {
          // Forget the failed client so a later query (same request) may try again.
          ready = null;
          await c.end().catch(() => {});
          throw connectError(e);
        },
      );
    }
    return ready;
  }

  const hive = hiveFromQuery(async (sql, params) => {
    const c = await connected();
    try {
      return (await c.query(sql, params)).rows;
    } catch (e) {
      throw queryError(e);
    }
  });

  async function close(): Promise<void> {
    if (closed) return;
    closed = true;
    const pending = ready;
    if (!pending) return;
    try {
      const c = await pending;
      await c.end();
    } catch {
      // connect failed (already cleaned up) or end failed: nothing more to release
    } finally {
      ready = null;
    }
  }

  return { ...hive, close };
}
