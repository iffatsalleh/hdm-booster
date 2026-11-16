// One-time setup helper for the owner (no prompts). Run from the repo root:
//   node scripts/setup.mjs secrets [--apply] [--show] [--rotate]
//   node scripts/setup.mjs firebase-sa <service-account.json> [--apply]
//   node scripts/setup.mjs superadmin --uid <UID> --name "<Nama>" --email <emel> --phone <telefon>
//   node scripts/setup.mjs role <UID> coach|superadmin [--remove] [--name … --email … --phone …]
//   node scripts/setup.mjs check            (read-only; also counts test_ rows left by the DB test suites)
// Secrets are written only to the gitignored .env.prod and piped to wrangler through stdin: never printed
// unless --show is given.
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { parseEnv } from './hive.mjs';
import {
  randomSecret, mergeEnv, findPlaceholders, tomlValue, originProblems, validateServiceAccount, isFirebaseUid,
  normalizePhone, parseArgs, spawnPlan, testRowCountSql,
} from './setuplib.mjs';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const ENV_FILE = new URL('../.env.prod', import.meta.url);
const ENV_EXAMPLE = new URL('../.env.prod.example', import.meta.url);
const TOML = new URL('../worker/wrangler.toml', import.meta.url);
const WORKER_DIR = fileURLToPath(new URL('../worker/', import.meta.url));

/** Worker secrets generated here, and whether Apps Script needs the same value. */
const GENERATED = [
  { key: 'INTERNAL_SECRET', worker: true, gas: true },
  { key: 'TICKET_SECRET', worker: true, gas: true },
  { key: 'BCL_WEBHOOK_KEY', worker: false, gas: true },
];

// pg prints a long notice about future sslmode semantics on every connect: hide only that one.
process.removeAllListeners('warning');
process.on('warning', (w) => {
  if (!/SSL modes/.test(String(w && w.message))) console.warn(String(w));
});

const { flags, positional } = parseArgs(process.argv.slice(2), ['apply', 'show', 'rotate', 'remove']);
const cmd = positional[0];

function die(msg) {
  console.error(`RALAT: ${msg}`);
  process.exit(1);
}

function readEnvText() {
  if (existsSync(ENV_FILE)) return readFileSync(ENV_FILE, 'utf8');
  return existsSync(ENV_EXAMPLE) ? readFileSync(ENV_EXAMPLE, 'utf8') : '';
}

function envProd() {
  if (!existsSync(ENV_FILE)) die('.env.prod tiada. Salin dahulu: copy .env.prod.example .env.prod');
  return parseEnv(readFileSync(ENV_FILE, 'utf8'));
}

/** `npx wrangler secret put NAME` in worker/, value piped through stdin (never echoed). */
function wranglerSecretPut(name, value) {
  const plan = spawnPlan('npx', ['wrangler', 'secret', 'put', name]);
  const r = spawnSync(plan.cmd, plan.args, {
    cwd: WORKER_DIR,
    input: value,
    stdio: ['pipe', 'inherit', 'inherit'],
    shell: plan.shell,
  });
  if (r.status !== 0) die(`wrangler secret put ${name} gagal (kod ${r.status}). Sudah "npx wrangler login"?`);
  console.log(`OK  ${name} disimpan sebagai secret Worker`);
}

async function withDb(fn) {
  const env = envProd();
  if (!env.HIVE_PG_URL) die('HIVE_PG_URL kosong dalam .env.prod');
  const client = new pg.Client({ connectionString: env.HIVE_PG_URL });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}

// ---------------------------------------------------------------- secrets
function secrets() {
  const current = parseEnv(readEnvText());
  const updates = {};
  for (const { key } of GENERATED) {
    if (current[key] && !flags.rotate) continue;
    updates[key] = randomSecret();
  }
  if (Object.keys(updates).length) {
    writeFileSync(ENV_FILE, mergeEnv(readEnvText(), updates));
    console.log(`.env.prod: ${Object.keys(updates).join(', ')} dijana.`);
  } else {
    console.log('.env.prod: semua rahsia sudah ada (guna --rotate untuk jana semula; Apps Script mesti dikemas kini juga).');
  }
  const env = envProd();

  console.log('\n== Secret Worker (Cloudflare) ==');
  for (const { key, worker } of GENERATED) {
    if (!worker) continue;
    if (flags.apply) wranglerSecretPut(key, env[key]);
    else console.log(`  (dalam folder worker)  npx wrangler secret put ${key}    (tampal nilai ${key} dari .env.prod)`);
  }
  if (!flags.apply) console.log('  Atau jalankan semula dengan --apply supaya skrip ini yang hantar (nilai tidak dipaparkan).');

  console.log('\n== Script Properties (Apps Script › Project Settings › Script properties) ==');
  for (const { key, gas } of GENERATED) {
    if (!gas) continue;
    console.log(flags.show ? `  ${key} = ${env[key]}` : `  ${key}   (salin nilai dari .env.prod: notepad .env.prod)`);
  }
  console.log('  Nilai INTERNAL_SECRET dan TICKET_SECRET mesti SAMA di Worker dan Apps Script.');
}

// ---------------------------------------------------------------- firebase-sa
function firebaseSa() {
  const path = positional[1];
  if (!path) die('Guna: node scripts/setup.mjs firebase-sa <fail-akaun-servis.json> --apply');
  if (!existsSync(path)) die(`Fail tidak dijumpai: ${path}`);
  let sa;
  try {
    sa = JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    die('Fail itu bukan JSON yang sah.');
  }
  const v = validateServiceAccount(sa);
  if (!v.ok) die(`Akaun servis tidak sah: ${v.errors.join('; ')}`);
  console.log(`OK  akaun servis ${v.clientEmail} (projek ${v.projectId})`);
  const fpid = tomlValue(readFileSync(TOML, 'utf8'), 'FIREBASE_PROJECT_ID');
  if (fpid && !/REPLACE/.test(fpid) && fpid !== v.projectId) {
    die(`project_id (${v.projectId}) tidak sama dengan FIREBASE_PROJECT_ID dalam worker/wrangler.toml (${fpid}).`);
  }
  if (!flags.apply) {
    console.log('Semakan sahaja. Jalankan semula dengan --apply untuk simpan sebagai secret FIREBASE_SA_JSON.');
    return;
  }
  wranglerSecretPut('FIREBASE_SA_JSON', JSON.stringify(sa));
  console.log('Selepas ini, padam fail JSON itu dari komputer (ia kunci penuh projek Firebase).');
}

// ---------------------------------------------------------------- roles
async function grantRole(uid, role, profile) {
  if (!isFirebaseUid(uid)) die('UID tidak sah. Salin UID dari Firebase console › Authentication › Users.');
  if (!['superadmin', 'coach'].includes(role)) die('Peranan mesti superadmin atau coach.');
  await withDb(async (db) => {
    await db.query('begin');
    try {
      const exists = (await db.query('select 1 from profiles where id = $1', [uid])).rowCount > 0;
      if (profile) {
        await db.query(
          `insert into profiles (id, full_name, email, phone) values ($1, $2, $3, $4)
           on conflict (id) do update set full_name = excluded.full_name, email = excluded.email, phone = excluded.phone`,
          [uid, profile.name, profile.email, profile.phone],
        );
      } else if (!exists) {
        throw new Error('Profil untuk UID ini belum wujud. Tambah --name, --email dan --phone.');
      }
      if (flags.remove) {
        await db.query('delete from user_roles where user_id = $1 and role = $2', [uid, role]);
      } else {
        await db.query('insert into user_roles (user_id, role) values ($1, $2) on conflict do nothing', [uid, role]);
      }
      await db.query(
        `insert into audit_logs (actor, action, target_type, target_id, detail) values ('setup-script', $1, 'user', $2, $3)`,
        [flags.remove ? 'role.remove' : 'role.grant', uid, JSON.stringify({ role })],
      );
      await db.query('commit');
    } catch (e) {
      await db.query('rollback').catch(() => {});
      if (e && e.code === '23505') throw new Error('Emel itu sudah digunakan oleh profil lain.');
      throw e;
    }
    const roles = (await db.query('select role from user_roles where user_id = $1 order by role', [uid])).rows.map((r) => r.role);
    console.log(`OK  ${uid}: peranan sekarang = ${roles.join(', ') || '(tiada)'}`);
  });
}

function profileFlags(required) {
  const has = flags.name || flags.email || flags.phone;
  if (!has && !required) return null;
  const name = typeof flags.name === 'string' ? flags.name.trim() : '';
  const email = typeof flags.email === 'string' ? flags.email.trim().toLowerCase() : '';
  const phone = typeof flags.phone === 'string' ? normalizePhone(flags.phone) : null;
  if (!name) die('--name "<Nama Penuh>" diperlukan.');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) die('--email tidak sah (guna emel yang sama seperti di Firebase).');
  if (!phone) die('--phone tidak sah. Contoh: 0123456789');
  return { name, email, phone };
}

// ---------------------------------------------------------------- check
async function check() {
  let bad = 0;
  const pass = (m) => console.log(`PASS  ${m}`);
  const fail = (m) => {
    bad++;
    console.log(`FAIL  ${m}`);
  };
  const warn = (m) => console.log(`NOTA  ${m}`);

  const env = existsSync(ENV_FILE) ? parseEnv(readFileSync(ENV_FILE, 'utf8')) : null;
  if (!env) fail('.env.prod tiada (copy .env.prod.example .env.prod)');
  else {
    for (const k of ['HIVE_PG_URL', 'INTERNAL_SECRET', 'TICKET_SECRET', 'BCL_WEBHOOK_KEY']) {
      if (env[k]) pass(`.env.prod ada ${k}`);
      else fail(`.env.prod tiada ${k}${k === 'HIVE_PG_URL' ? '' : ' (jalankan: node scripts/setup.mjs secrets)'}`);
    }
  }

  const toml = readFileSync(TOML, 'utf8');
  const ph = findPlaceholders(toml);
  for (const p of ph) {
    if (p.key === 'ALLOWED_ORIGINS') continue; // reported by originProblems below
    if (p.optional) warn(`wrangler.toml baris ${p.line}: ${p.key} masih placeholder (hanya untuk fallback REST, boleh dibiar)`);
    else fail(`wrangler.toml baris ${p.line}: ${p.key} masih placeholder REPLACE`);
  }
  if (!ph.some((p) => !p.optional)) pass('wrangler.toml: semua placeholder wajib sudah diganti');
  const op = originProblems(tomlValue(toml, 'ALLOWED_ORIGINS') ?? '');
  if (op.length) op.forEach((m) => fail(`ALLOWED_ORIGINS: ${m}`));
  else pass(`ALLOWED_ORIGINS = ${tomlValue(toml, 'ALLOWED_ORIGINS')}`);

  if (env?.HIVE_PG_URL) {
    try {
      await withDb(async (db) => {
        await db.query('select 1');
        pass('pangkalan data HornetHive boleh dihubungi (select 1)');
        const files = readdirSync(new URL('../db/migrations/', import.meta.url)).filter((f) => f.endsWith('.sql'));
        const has = (await db.query("select to_regclass('schema_migrations') is not null as ok")).rows[0].ok;
        const applied = has ? Number((await db.query('select count(*) as n from schema_migrations')).rows[0].n) : 0;
        if (applied >= files.length) pass(`migrasi: ${applied}/${files.length} sudah dijalankan`);
        else fail(`migrasi: ${applied}/${files.length} sahaja (jalankan: npm run migrate -- --seed)`);
        if (has && applied) {
          const admins = Number((await db.query("select count(*) as n from user_roles where role = 'superadmin'")).rows[0].n);
          if (admins) pass(`superadmin: ${admins}`);
          else warn('belum ada superadmin (Langkah 7 dalam README)');
          // read-only: rows left by `npm run test:db` / `npm run test:worker` (test_ markers, 'Test…' titles)
          const left = (await db.query(testRowCountSql())).rows.filter((r) => Number(r.n) > 0);
          if (!left.length) pass('data ujian: tiada baris test_ tertinggal');
          else fail(`data ujian tertinggal: ${left.map((r) => `${r.t} ${r.n}`).join(', ')} (bersihkan sebelum lancar; README Langkah 8)`);
        }
      });
    } catch (e) {
      fail(`pangkalan data: ${e && e.code ? e.code : 'tidak dapat disambung'} (semak HIVE_PG_URL)`);
    }
  }
  console.log(bad ? `\n${bad} perkara perlu dibetulkan.` : '\nSemua semakan lulus.');
  process.exitCode = bad ? 1 : 0;
}

// ---------------------------------------------------------------- main
async function main() {
  process.chdir(ROOT);
  switch (cmd) {
    case 'secrets':
      return secrets();
    case 'firebase-sa':
      return firebaseSa();
    case 'superadmin':
      return grantRole(String(flags.uid ?? ''), 'superadmin', profileFlags(true));
    case 'role':
      return grantRole(String(positional[1] ?? ''), String(positional[2] ?? ''), profileFlags(false));
    case 'check':
      return check();
    default:
      console.log(readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(0, 7).join('\n'));
      process.exitCode = cmd ? 1 : 0;
  }
}

main().catch((e) => die(e && e.message ? e.message : String(e)));
