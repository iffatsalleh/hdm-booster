// Whitelisted table CRUD for superadmin content management. SQL is built ONLY from the identifiers in
// TABLES below (quoted); every value is a parameter with an explicit cast. Each mutation writes exactly one
// audit_logs row in the same statement (data-modifying CTE), and re-checks the superadmin role in SQL.
import type { Hive } from './types';
import { UUID_RE } from './errors';

type ColType = 'text' | 'int' | 'numeric' | 'boolean' | 'timestamptz' | 'date' | 'uuid' | 'jsonb';
export type TableSpec = {
  /** primary key column(s); composite keys are addressed as `a:b` in the URL */
  pk: [string, ColType][];
  /** writable/readable columns (pk columns included when the client supplies them on insert) */
  cols: Record<string, ColType>;
  order: string;
};

export const CONTENT_TABLES: Record<string, TableSpec> = {
  batches: {
    pk: [['id', 'uuid']],
    cols: { name: 'text', sales_open_at: 'timestamptz', sales_close_at: 'timestamptz', program_start: 'date',
      program_end: 'date', phases: 'jsonb', status: 'text' },
    order: '"sales_open_at" desc nulls last, "id"',
  },
  ebooks: {
    pk: [['id', 'uuid']],
    cols: { item_key: 'text', number: 'int', title: 'text', description: 'text', cover_url: 'text',
      file_drive_id: 'text', allow_download: 'boolean', file_updated_at: 'timestamptz', sort: 'int' },
    order: '"sort", "number", "id"',
  },
  groups: {
    pk: [['id', 'uuid']],
    cols: { item_key: 'text', batch_id: 'uuid', name: 'text', coach: 'text', description: 'text', invite_url: 'text' },
    order: '"item_key", "name", "id"',
  },
  packages: {
    pk: [['id', 'text']],
    cols: { id: 'text', name: 'text', price_rm: 'numeric', sellable: 'boolean' },
    order: '"id"',
  },
  package_items: {
    pk: [['package_id', 'text'], ['item_key', 'text']],
    cols: { package_id: 'text', item_key: 'text' },
    order: '"package_id", "item_key"',
  },
  items: {
    pk: [['key', 'text']],
    cols: { key: 'text', name: 'text', kind: 'text', sort: 'int', active: 'boolean' },
    order: '"sort", "key"',
  },
  app_settings: {
    pk: [['key', 'text']],
    cols: { key: 'text', value: 'jsonb', public: 'boolean' },
    order: '"key"',
  },
};

/** Not a content table: managed through /api/admin/bcl-map with the same engine. */
export const BCL_MAP: TableSpec = {
  pk: [['id', 'uuid']],
  cols: { formable_id: 'text', amount_rm: 'numeric', field_value: 'text', package_id: 'text', active: 'boolean' },
  order: '"formable_id", "amount_rm", "id"',
};

export class CrudInputError extends Error {}

const q = (ident: string) => {
  if (!/^[a-z_][a-z0-9_]*$/.test(ident)) throw new Error(`bad identifier ${ident}`);
  return `"${ident}"`;
};

function param(type: ColType, v: unknown): unknown {
  if (v === null) return null;
  if (type === 'jsonb') return JSON.stringify(v);
  if (typeof v === 'object') throw new CrudInputError('object value for a scalar column');
  if (type === 'boolean' && typeof v !== 'boolean') throw new CrudInputError('boolean expected');
  return v;
}

/** Whitelisted [column, type, value] triples from the body (unknown keys ignored). */
function pickCols(spec: TableSpec, body: Record<string, unknown>, includePk: boolean) {
  const pkNames = new Set(spec.pk.map(([n]) => n));
  return Object.entries(spec.cols)
    .filter(([name]) => body[name] !== undefined && (includePk || !pkNames.has(name)))
    .map(([name, type]) => [name, type, param(type, body[name])] as const);
}

/** Parses the URL id into pk values; null when malformed (treated as not found). */
function pkValues(spec: TableSpec, id: string): string[] | null {
  const parts = spec.pk.length === 1 ? [id] : id.split(':');
  if (parts.length !== spec.pk.length || parts.some((p) => !p)) return null;
  for (let i = 0; i < parts.length; i++) if (spec.pk[i][1] === 'uuid' && !UUID_RE.test(parts[i])) return null;
  return parts;
}

const pkWhere = (spec: TableSpec, start: number, alias = '') =>
  spec.pk.map(([n, t], i) => `${alias}${q(n)} = $${start + i}::${t}`).join(' and ');
const pkText = (spec: TableSpec, alias: string) =>
  spec.pk.map(([n]) => `${alias}.${q(n)}::text`).join(` || ':' || `);
const SA = (n: number) => `'superadmin' = any(roles_for($${n}))`;

/** `auditPrefix` names the audit actions: `<prefix>.create|update|delete`. */
export function crud(hive: Hive, table: string, spec: TableSpec, actor: string, auditPrefix = 'content') {
  const t = q(table);
  q(auditPrefix);
  const audit = (verb: 'create' | 'update' | 'delete', detail: string) =>
    `a as (insert into audit_logs (actor, action, target_type, target_id, detail)
           select $1, '${auditPrefix}.${verb}', '${table}', ${pkText(spec, 'x')}, ${detail} from x returning 1)`;

  return {
    list: () =>
      hive.json<unknown[]>(
        `select coalesce(jsonb_agg(to_jsonb(s) order by ${spec.order}), '[]'::jsonb) as r
           from (select * from ${t} where ${SA(1)} order by ${spec.order} limit 1000) s`,
        [actor],
      ),

    get: async (id: string) => {
      const pk = pkValues(spec, id);
      if (!pk) return null;
      return hive.json<Record<string, unknown> | null>(
        `select (select to_jsonb(s) from ${t} s where ${pkWhere(spec, 2, 's.')} and ${SA(1)}) as r`,
        [actor, ...pk],
      );
    },

    create: (body: Record<string, unknown>) => {
      const cols = pickCols(spec, body, true);
      if (!cols.length) throw new CrudInputError('no writable columns');
      const names = cols.map(([n]) => q(n)).join(', ');
      const vals = cols.map(([, ty], i) => `$${i + 2}::${ty}`).join(', ');
      return hive.json<Record<string, unknown> | null>(
        `with x as (insert into ${t} (${names}) select ${vals} where ${SA(1)} returning *),
              ${audit('create', 'to_jsonb(x)')}
         select (select to_jsonb(x) from x) as r`,
        [actor, ...cols.map(([, , v]) => v)],
      );
    },

    update: async (id: string, body: Record<string, unknown>) => {
      const pk = pkValues(spec, id);
      const cols = pickCols(spec, body, false);
      if (!cols.length) throw new CrudInputError('no writable columns');
      if (!pk) return null;
      const set = cols.map(([n, ty], i) => `${q(n)} = $${i + 2}::${ty}`).join(', ');
      const changes = `jsonb_build_object(${cols.map(([n], i) => `'${n}', to_jsonb($${i + 2}::${cols[i][1]})`).join(', ')})`;
      const pkStart = cols.length + 2;
      return hive.json<Record<string, unknown> | null>(
        `with x as (update ${t} set ${set} where ${pkWhere(spec, pkStart)} and ${SA(1)} returning *),
              ${audit('update', `jsonb_build_object('changes', ${changes})`)}
         select (select to_jsonb(x) from x) as r`,
        [actor, ...cols.map(([, , v]) => v), ...pk],
      );
    },

    remove: async (id: string) => {
      const pk = pkValues(spec, id);
      if (!pk) return null;
      return hive.json<Record<string, unknown> | null>(
        `with x as (delete from ${t} where ${pkWhere(spec, 2)} and ${SA(1)} returning *),
              ${audit('delete', 'to_jsonb(x)')}
         select (select to_jsonb(x) from x) as r`,
        [actor, ...pk],
      );
    },
  };
}
