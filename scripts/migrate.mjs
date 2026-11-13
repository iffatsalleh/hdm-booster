// Usage: npm run migrate [-- --env prod] [--seed]   (single environment: prod, reads HIVE_PG_URL from .env.prod)
// Direct Postgres over `pg`. Each migration file runs in ONE transaction together with its
// schema_migrations row; --seed runs db/seed.sql in one transaction.
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { loadEnv } from './hive.mjs';

const args = process.argv.slice(2);
const envName = args.includes('--env') ? args[args.indexOf('--env') + 1] : 'prod';
const withSeed = args.includes('--seed');

async function inTx(client, fn) {
  await client.query('begin');
  try {
    await fn();
    await client.query('commit');
  } catch (e) {
    await client.query('rollback').catch(() => {});
    throw e;
  }
}

async function main() {
  const env = loadEnv(envName);
  if (!env.HIVE_PG_URL) throw new Error(`.env.${envName} is missing HIVE_PG_URL`);
  const client = new pg.Client({ connectionString: env.HIVE_PG_URL });
  await client.connect();
  try {
    await client.query('create table if not exists schema_migrations (name text primary key, applied_at timestamptz not null default now())');
    const applied = new Set((await client.query('select name from schema_migrations')).rows.map((r) => r.name));

    const dir = new URL('../db/migrations/', import.meta.url);
    const files = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.sql')).sort() : [];
    let count = 0;
    for (const f of files) {
      if (applied.has(f)) continue;
      console.log(`applying ${f}`);
      // simple-query protocol: the whole file (many statements) goes in one call, inside our transaction
      await inTx(client, async () => {
        await client.query(readFileSync(new URL(f, dir), 'utf8'));
        await client.query('insert into schema_migrations (name) values ($1)', [f]);
      });
      count++;
    }
    console.log(`migrations: ${count} applied, ${files.length - count} already up to date`);

    if (withSeed) {
      const seed = new URL('../db/seed.sql', import.meta.url);
      if (!existsSync(seed)) throw new Error(`seed file not found: ${fileURLToPath(seed)}`);
      await inTx(client, () => client.query(readFileSync(seed, 'utf8')));
      console.log('seed: applied');
    }
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(`migrate failed: ${e.message}`);
  process.exit(1);
});
