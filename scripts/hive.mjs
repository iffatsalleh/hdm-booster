// HornetHive REST client. Source: https://hornethive.io/docs/rest-api
//   POST {base}/rest/{dbId}/query   Authorization: Bearer <key>
//   body {"query": "... $1 ...", "params": [...]}  ->  {"columns": [...], "rows": [...]}
//   error -> {"error": "...", code?, details?, hint?}
import { readFileSync, existsSync } from 'node:fs';

/** Tiny .env parser (KEY=VALUE, # comments, optional quotes). */
export function parseEnv(text) {
  const env = {};
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq < 1) continue;
    let v = line.slice(eq + 1).trim();
    if (/^(".*"|'.*')$/.test(v)) v = v.slice(1, -1);
    env[line.slice(0, eq).trim()] = v;
  }
  return env;
}

/** Load .env.<name> from the repo root; throws a clear error if missing. */
export function loadEnv(name) {
  if (name !== 'test' && name !== 'prod') throw new Error('--env must be "test" or "prod"');
  const file = new URL(`../.env.${name}`, import.meta.url);
  if (!existsSync(file)) {
    throw new Error(`Missing .env.${name} (copy .env.test.example and fill in HornetHive values)`);
  }
  return parseEnv(readFileSync(file, 'utf8'));
}

/**
 * @param {{base: string, dbId: string, key: string}} cfg
 * @param {string} sql
 * @param {unknown[]} [params]
 * @returns {Promise<Record<string, unknown>[]>}
 */
export async function hiveQuery({ base, dbId, key }, sql, params = []) {
  const url = `${base.replace(/\/+$/, '')}/rest/${encodeURIComponent(dbId)}/query`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql, params }),
  });
  const text = await res.text();
  let body;
  try { body = text ? JSON.parse(text) : {}; } catch { body = { error: text }; }
  if (!res.ok) {
    const parts = [body.error || `HTTP ${res.status}`];
    if (body.code) parts.push(`[${body.code}]`);
    if (body.details) parts.push(String(body.details));
    if (body.hint) parts.push(`hint: ${body.hint}`);
    throw new Error(parts.join(' '));
  }
  const rows = body.rows ?? [];
  // Rows are documented only loosely; accept objects or arrays aligned with `columns`.
  if (rows.length && Array.isArray(rows[0]) && Array.isArray(body.columns)) {
    const names = body.columns.map((c) => (typeof c === 'string' ? c : c.name));
    return rows.map((r) => Object.fromEntries(names.map((nm, i) => [nm, r[i]])));
  }
  return rows;
}
