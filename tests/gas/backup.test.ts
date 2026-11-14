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

/** Fake Worker /internal/export: `tables` maps name -> row count (rows are {i}); records every call. */
function fakeWorker(tables: Record<string, number> = {}, opts: { fail?: Record<string, any> } = {}) {
  const calls: any[] = [];
  const workerCall = (method: string, path: string, body: any) => {
    calls.push([method, path, body]);
    if (opts.fail && body.table in opts.fail) {
      const f = opts.fail[body.table];
      if (f instanceof Error) throw f;
      return f;
    }
    const total = tables[body.table] ?? 0;
    const rows = [];
    for (let i = body.offset; i < Math.min(total, body.offset + body.limit); i++) rows.push({ i });
    return { ok: true, data: { rows, next: rows.length < body.limit ? null : body.offset + rows.length } };
  };
  return { calls, workerCall };
}

describe('table list', () => {
  it('has the 19 tables (order keys live in the Worker whitelist)', () => {
    expect(g.BACKUP_TABLES).toHaveLength(19);
    expect(g.BACKUP_TABLES).toContain('schema_migrations');
    expect(g.BACKUP_TABLES).toContain('reading_progress');
    expect(new Set(g.BACKUP_TABLES).size).toBe(19);
  });
});

describe('backupFetchTable pagination (Worker /internal/export)', () => {
  it('pages with POST {table, offset, limit:1000} until next is null', () => {
    const w = fakeWorker({ audit_logs: 2500 });
    const out = g.backupFetchTable('audit_logs', w.workerCall);
    expect(out).toHaveLength(2500);
    expect(out[2499]).toEqual({ i: 2499 });
    expect(w.calls).toEqual([
      ['POST', '/internal/export', { table: 'audit_logs', offset: 0, limit: 1000 }],
      ['POST', '/internal/export', { table: 'audit_logs', offset: 1000, limit: 1000 }],
      ['POST', '/internal/export', { table: 'audit_logs', offset: 2000, limit: 1000 }],
    ]);
  });
  it('exact multiple of page size takes one extra empty page; empty table yields []', () => {
    const w = fakeWorker({ t: 1000 });
    expect(g.backupFetchTable('t', w.workerCall)).toHaveLength(1000);
    expect(w.calls).toHaveLength(2);
    expect(g.backupFetchTable('empty', fakeWorker().workerCall)).toEqual([]);
  });
  it('a Worker error response throws with the reason only (no body data)', () => {
    const w = fakeWorker({}, { fail: { items: { ok: false, reason: 'tiada_jadual', message: 'Jadual tidak dikenali.' } } });
    expect(() => g.backupFetchTable('items', w.workerCall)).toThrow(/export items failed: tiada_jadual/);
    const bad = fakeWorker({}, { fail: { items: { ok: true, data: { rows: 'x' } } } });
    expect(() => g.backupFetchTable('items', bad.workerCall)).toThrow(/bad_response/);
  });
  it('a non-advancing next aborts instead of looping forever', () => {
    const loop = () => ({ ok: true, data: { rows: Array.from({ length: 1000 }, () => ({})), next: 0 } });
    expect(() => g.backupFetchTable('items', loop)).toThrow(/bad_response/);
  });
});

describe('runBackup_', () => {
  it('writes each table, continues after a failure, deletes old folders, reports failures', () => {
    const written: string[] = [];
    const deleted: string[] = [];
    const logs: string[] = [];
    const res = g.runBackup_({
      nowMs: day('2026-11-13T19:00:00Z'),
      workerCall: (m: string, p: string, body: any) => {
        if (body.table === 'packages') throw new Error('boom');
        return { ok: true, data: { rows: [{ ok: 1 }], next: null } };
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
    expect(deleted).toEqual([]); // retention skipped when any table failed
    expect(logs.length).toBeGreaterThan(0);
  });
  it('retention runs when every table succeeded', () => {
    const deleted: string[] = [];
    const res = g.runBackup_({
      nowMs: day('2026-11-13T19:00:00Z'),
      workerCall: fakeWorker().workerCall,
      writeJson: () => {},
      listFolderNames: () => ['2026-09-01', '2026-10-14', '2026-10-15', 'misc'],
      deleteFolder: (n: string) => deleted.push(n),
      log: () => {},
    });
    expect(res.failed).toEqual([]);
    expect(deleted).toEqual(['2026-09-01', '2026-10-14']);
  });
  it('time budget: remaining tables marked timeout, no retention', () => {
    let t = 0;
    const deleted: string[] = [];
    const written: string[] = [];
    const res = g.runBackup_({
      nowMs: day('2026-11-13T19:00:00Z'),
      now: () => t,
      budgetMs: 5 * 60 * 1000,
      workerCall: fakeWorker().workerCall,
      writeJson: (d: string, tb: string) => { written.push(tb); if (written.length === 3) t = 5 * 60 * 1000 + 1; },
      listFolderNames: () => ['2020-01-01'],
      deleteFolder: (n: string) => deleted.push(n),
      log: () => {},
    });
    expect(written).toHaveLength(3);
    expect(res.failed).toHaveLength(16);
    expect(res.failed.every((f: any) => f.error === 'timeout')).toBe(true);
    expect(deleted).toEqual([]);
  });
  it('a failing delete or write does not abort the run', () => {
    const res = g.runBackup_({
      nowMs: day('2026-11-13T19:00:00Z'),
      workerCall: fakeWorker().workerCall,
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
