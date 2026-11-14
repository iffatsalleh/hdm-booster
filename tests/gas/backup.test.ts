import { describe, it, expect } from 'vitest';
import { loadGas } from './load';

const g = loadGas(['Backup.gs.js'], { Date });
const day = (s: string) => Date.parse(s);

describe('MYT date + retention', () => {
  it('mytDateString uses UTC+8', () => {
    expect(g.mytDateString(day('2026-11-13T16:00:00Z'))).toBe('2026-11-14'); // 00:00 MYT next day
    expect(g.mytDateString(day('2026-11-13T15:59:59Z'))).toBe('2026-11-13');
    expect(g.mytDateString(day('2026-11-13T19:00:00Z'))).toBe('2026-11-14'); // 03:00 MYT
  });
  it('cutoff is 30 days before the MYT date', () => {
    expect(g.backupCutoffDate(day('2026-11-13T19:00:00Z'), 30)).toBe('2026-10-15');
    expect(g.backupCutoffDate(day('2026-03-05T19:00:00Z'), 30)).toBe('2026-02-04');
  });
  it('expired only when strictly older than 30 days and a dated name', () => {
    const now = day('2026-11-13T19:00:00Z'); // MYT 2026-11-14 -> cutoff 2026-10-15
    expect(g.isBackupFolderExpired('2026-10-14', now, 30)).toBe(true);
    expect(g.isBackupFolderExpired('2026-10-15', now, 30)).toBe(false);
    expect(g.isBackupFolderExpired('2026-11-14', now, 30)).toBe(false);
    expect(g.isBackupFolderExpired('Documents', now, 30)).toBe(false);
    expect(g.isBackupFolderExpired('2026-10-1', now, 30)).toBe(false);
  });
});

describe('table list and SQL', () => {
  it('has the 19 tables with the fixed query shape', () => {
    const names = g.BACKUP_TABLES.map((t: any) => t.name);
    expect(names).toHaveLength(19);
    expect(names).toContain('schema_migrations');
    expect(g.backupSql({ name: 'items', order: 'key' })).toBe('select to_jsonb(t) as r from items t order by key limit $1 offset $2');
  });
});

describe('parseBackupRow', () => {
  it('handles object rows, array rows and JSON strings', () => {
    expect(g.parseBackupRow({ r: { a: 1 } }, ['r'])).toEqual({ a: 1 });
    expect(g.parseBackupRow({ r: '{"a":1}' }, ['r'])).toEqual({ a: 1 });
    expect(g.parseBackupRow(['{"a":2}'], ['r'])).toEqual({ a: 2 });
    expect(g.parseBackupRow([{ a: 3 }], ['r'])).toEqual({ a: 3 });
  });
});

describe('backupFetchTable pagination', () => {
  it('pages until a short page, passing limit/offset', () => {
    const total = 2500;
    const calls: any[] = [];
    const query = (sql: string, params: number[]) => {
      calls.push(params);
      const rows = [];
      for (let i = params[1]; i < Math.min(total, params[1] + params[0]); i++) rows.push({ r: { i } });
      return { columns: ['r'], rows };
    };
    const out = g.backupFetchTable({ name: 'audit_logs', order: 'id' }, query);
    expect(out).toHaveLength(2500);
    expect(out[2499]).toEqual({ i: 2499 });
    expect(calls).toEqual([[1000, 0], [1000, 1000], [1000, 2000]]);
  });
  it('exact multiple of page size takes one extra empty query; empty table yields []', () => {
    const calls: any[] = [];
    const query = (sql: string, p: number[]) => {
      calls.push(p);
      return { rows: p[1] < 1000 ? Array.from({ length: 1000 }, () => ({ r: {} })) : [] };
    };
    expect(g.backupFetchTable({ name: 't', order: 'id' }, query)).toHaveLength(1000);
    expect(calls).toHaveLength(2);
    expect(g.backupFetchTable({ name: 't', order: 'id' }, () => ({ rows: [] }))).toEqual([]);
  });
});

describe('runBackup_', () => {
  it('writes each table, continues after a failure, deletes old folders, reports failures', () => {
    const written: string[] = [];
    const deleted: string[] = [];
    const logs: string[] = [];
    const res = g.runBackup_({
      nowMs: day('2026-11-13T19:00:00Z'),
      query: (sql: string) => {
        if (sql.includes(' from packages ')) throw new Error('boom');
        return { columns: ['r'], rows: [{ r: { ok: 1 } }] };
      },
      writeJson: (date: string, table: string, rows: any[]) => written.push(date + '/' + table + ':' + rows.length),
      listFolderNames: () => ['2026-09-01', '2026-10-14', '2026-10-15', '2026-11-13', 'misc'],
      deleteFolder: (n: string) => deleted.push(n),
      log: (m: string) => logs.push(m),
    });
    expect(res.date).toBe('2026-11-14');
    expect(written).toHaveLength(18);
    expect(written).toContain('2026-11-14/items:1');
    expect(written.join()).not.toContain('packages');
    expect(res.failed).toEqual([{ table: 'packages', error: 'Error: boom' }]);
    expect(deleted).toEqual(['2026-09-01', '2026-10-14']);
    expect(logs.length).toBeGreaterThan(0);
  });
  it('a failing delete or write does not abort the run', () => {
    const res = g.runBackup_({
      nowMs: day('2026-11-13T19:00:00Z'),
      query: () => ({ rows: [] }),
      writeJson: (d: string, t: string) => { if (t === 'items') throw new Error('drive full'); },
      listFolderNames: () => ['2020-01-01'],
      deleteFolder: () => { throw new Error('nope'); },
      log: () => {},
    });
    expect(res.failed.map((f: any) => f.table)).toEqual(['items']);
  });
});

describe('failure email body', () => {
  it('lists tables and errors, no row data', () => {
    const b = g.backupFailureBody('2026-11-14', [{ table: 'items', error: 'Error: x' }]);
    expect(b).toContain('items');
    expect(b).toContain('2026-11-14');
  });
});
