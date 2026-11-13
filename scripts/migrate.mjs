// Usage: npm run migrate [-- --env prod] [--seed]   (single environment: prod, reads .env.prod)
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { hiveQuery, loadEnv } from './hive.mjs';
import { splitSql } from './sqlsplit.mjs';

const args = process.argv.slice(2);
const envName = args.includes('--env') ? args[args.indexOf('--env') + 1] : 'prod';
const withSeed = args.includes('--seed');

async function main() {
  const env = loadEnv(envName);
  for (const k of ['HIVE_API_BASE', 'HIVE_DB_ID', 'HIVE_DDL_KEY']) {
    if (!env[k]) throw new Error(`.env.${envName} is missing ${k}`);
  }
  const cfg = { base: env.HIVE_API_BASE, dbId: env.HIVE_DB_ID, key: env.HIVE_DDL_KEY };
  const run = (sql, params) => hiveQuery(cfg, sql, params);

  await run('create table if not exists schema_migrations (name text primary key, applied_at timestamptz not null default now())');
  const applied = new Set((await run('select name from schema_migrations')).map((r) => r.name));

  const dir = new URL('../db/migrations/', import.meta.url);
  const files = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.sql')).sort() : [];
  let count = 0;
  for (const f of files) {
    if (applied.has(f)) continue;
    console.log(`applying ${f}`);
    for (const stmt of splitSql(readFileSync(new URL(f, dir), 'utf8'))) await run(stmt);
    await run('insert into schema_migrations (name) values ($1)', [f]);
    count++;
  }
  console.log(`migrations: ${count} applied, ${files.length - count} already up to date`);

  if (withSeed) {
    const seed = new URL('../db/seed.sql', import.meta.url);
    if (!existsSync(seed)) throw new Error(`seed file not found: ${fileURLToPath(seed)}`);
    const stmts = splitSql(readFileSync(seed, 'utf8'));
    for (const stmt of stmts) await run(stmt);
    console.log(`seed: ${stmts.length} statements`);
  }
}

main().catch((e) => {
  console.error(`migrate failed: ${e.message}`);
  process.exit(1);
});
