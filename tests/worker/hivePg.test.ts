// Unit tests for the Hyperdrive Postgres Hive (worker/src/hivePg.ts) with a fake pg Client: no database needed.
import { describe, test, expect } from 'vitest';
import { createPgHive, type PgClientLike } from '../../worker/src/hivePg';

type Call = { sql: string; params: unknown[] };

function fakeClient(opts: { rows?: (sql: string) => Record<string, unknown>[]; failConnect?: Error; failQuery?: Error } = {}) {
  const state = { created: 0, connects: 0, ends: 0, calls: [] as Call[], conn: '' };
  const factory = (cs: string): PgClientLike => {
    state.created++;
    state.conn = cs;
    return {
      async connect() {
        state.connects++;
        if (opts.failConnect) throw opts.failConnect;
      },
      async query(sql: string, params?: unknown[]) {
        state.calls.push({ sql, params: params ?? [] });
        if (opts.failQuery) throw opts.failQuery;
        return { rows: opts.rows ? opts.rows(sql) : [{ r: { ok: true } }] };
      },
      async end() {
        state.ends++;
      },
    };
  };
  return { state, factory };
}

describe('createPgHive', () => {
  test('lazy: no client until the first query; close() without queries is a no-op', async () => {
    const { state, factory } = fakeClient();
    const hive = createPgHive('postgres://x', factory);
    expect(state.created).toBe(0);
    await hive.close();
    expect(state.created).toBe(0);
    expect(state.ends).toBe(0);
  });

  test('one client per hive: connects once across several queries, passes sql+params, close ends it once', async () => {
    const { state, factory } = fakeClient();
    const hive = createPgHive('postgres://hyperdrive', factory);
    await hive.json('select 1 as r', [1]);
    await hive.q('select 2', ['a']);
    expect(state.created).toBe(1);
    expect(state.connects).toBe(1);
    expect(state.conn).toBe('postgres://hyperdrive');
    expect(state.calls).toEqual([{ sql: 'select 1 as r', params: [1] }, { sql: 'select 2', params: ['a'] }]);
    await hive.close();
    await hive.close();
    expect(state.ends).toBe(1);
  });

  test('concurrent first queries share one connect', async () => {
    const { state, factory } = fakeClient();
    const hive = createPgHive('pg://x', factory);
    await Promise.all([hive.json('a'), hive.json('b'), hive.json('c')]);
    expect(state.created).toBe(1);
    expect(state.connects).toBe(1);
  });

  test('json: object cell returned as is, string cell parsed', async () => {
    const obj = createPgHive('x', fakeClient({ rows: () => [{ r: { a: 1, list: ['x'] } }] }).factory);
    expect(await obj.json('s')).toEqual({ a: 1, list: ['x'] });
    const str = createPgHive('x', fakeClient({ rows: () => [{ r: '{"a":2}' }] }).factory);
    expect(await str.json('s')).toEqual({ a: 2 });
    const arr = createPgHive('x', fakeClient({ rows: () => [{ r: [] }] }).factory);
    expect(await arr.json('s')).toEqual([]);
  });

  test('json/one: zero or two rows, or no r column, throw', async () => {
    await expect(createPgHive('x', fakeClient({ rows: () => [] }).factory).json('s')).rejects.toThrow(/expected 1 row, got 0/);
    await expect(createPgHive('x', fakeClient({ rows: () => [{ r: 1 }, { r: 2 }] }).factory).one('s')).rejects.toThrow(/got 2/);
    await expect(createPgHive('x', fakeClient({ rows: () => [{ x: 1 }] }).factory).json('s')).rejects.toThrow(/column named r/);
  });

  test('query error keeps message + SQLSTATE code (for dbFail) but never the SQL, params or detail', async () => {
    const pgErr = Object.assign(new Error('pengguna_tidak_wujud'), {
      code: 'P0001', detail: 'secret detail 0123', where: 'PL/pgSQL function x', query: 'select secret',
    });
    const hive = createPgHive('x', fakeClient({ failQuery: pgErr }).factory);
    const err = await hive.json('select secret_fn($1) as r', ['secret-param']).catch((e) => e);
    expect(err).toBeInstanceOf(Error);
    expect(err.code).toBe('P0001');
    expect(err.message).toContain('pengguna_tidak_wujud');
    expect(err.message).toContain('[P0001]');
    for (const leak of ['secret_fn', 'secret-param', 'secret detail', 'PL/pgSQL', 'select secret']) {
      expect(err.message).not.toContain(leak);
      expect(JSON.stringify(err)).not.toContain(leak);
    }
  });

  test('connect error -> generic message without the connection string; next query retries connect; close safe', async () => {
    const { state, factory } = fakeClient({
      failConnect: Object.assign(new Error('connect ECONNREFUSED postgres://user:pw@host:5432/db'), { code: 'ECONNREFUSED' }),
    });
    const hive = createPgHive('postgres://user:pw@host:5432/db', factory);
    const err = await hive.json('s').catch((e) => e);
    expect(err.message).toBe('hive: connect failed [ECONNREFUSED]');
    expect(err.message).not.toContain('pw');
    await hive.json('s').catch(() => {});
    expect(state.created).toBe(2);
    await hive.close();
  });
});
