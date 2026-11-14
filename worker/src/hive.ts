// HornetHive REST client (fetch). POST {base}/rest/{dbId}/query, Bearer key, {query, params} -> {columns, rows}.
import type { Hive } from './types';

export type HiveConfig = { base: string; dbId: string; key: string };

export function createHive({ base, dbId, key }: HiveConfig): Hive {
  const url = `${base.replace(/\/+$/, '')}/rest/${encodeURIComponent(dbId)}/query`;

  async function q<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: sql, params }),
    });
    const text = await res.text();
    let body: any;
    try {
      body = text ? JSON.parse(text) : {};
    } catch {
      body = { error: text };
    }
    if (!res.ok || (body && typeof body === 'object' && body.error)) {
      const parts = [String(body?.error || `HTTP ${res.status}`)];
      if (body?.code) parts.push(`[${body.code}]`);
      if (body?.details) parts.push(String(body.details));
      if (body?.hint) parts.push(`hint: ${body.hint}`);
      throw new Error(`hive: ${parts.join(' ')}`);
    }
    const rows: unknown[] = body?.rows ?? [];
    if (rows.length && Array.isArray(rows[0]) && Array.isArray(body.columns)) {
      const names: string[] = body.columns.map((c: string | { name: string }) => (typeof c === 'string' ? c : c.name));
      return rows.map((r) => Object.fromEntries(names.map((nm, i) => [nm, (r as unknown[])[i]]))) as T[];
    }
    return rows as T[];
  }

  async function one<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T> {
    const rows = await q<T>(sql, params);
    if (rows.length !== 1) throw new Error(`hive: expected 1 row, got ${rows.length}`);
    return rows[0];
  }

  async function json<T = unknown>(sql: string, params?: unknown[]): Promise<T> {
    return jsonCell<T>(await one<Record<string, unknown>>(sql, params));
  }

  return { q, one, json };
}

/** The single `r` jsonb cell of a row: REST returns jsonb as a JSON string, pg may return an object. */
export function jsonCell<T = unknown>(row: Record<string, unknown>): T {
  if (!row || !('r' in row)) throw new Error('hive: expected a column named r');
  const v = row.r;
  if (typeof v === 'string') return JSON.parse(v) as T;
  return v as T;
}
