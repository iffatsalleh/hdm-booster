// Post-deploy smoke checks against the live Worker (no writes, no user data).
//   node scripts/smoke.mjs https://hdm-api.<akaun>.workers.dev [--origin https://<blog>.blogspot.com] [--internal-secret]
// --origin defaults to the first ALLOWED_ORIGINS entry in worker/wrangler.toml.
// --internal-secret reads INTERNAL_SECRET from .env.prod (never from the command line) and runs a signed
// /internal/export {table:'items', limit:1}: proves the Worker → Hyperdrive → HornetHive path.
import { readFileSync, existsSync } from 'node:fs';
import { parseEnv } from './hive.mjs';
import { parseArgs, tomlValue, sigHeader } from './setuplib.mjs';

const { flags, positional } = parseArgs(process.argv.slice(2), ['internal-secret']);
const api = String(positional[0] ?? '').replace(/\/+$/, '');
if (!/^https?:\/\/\S+$/.test(api)) {
  console.error('Guna: node scripts/smoke.mjs https://hdm-api.<akaun>.workers.dev [--internal-secret]');
  process.exit(1);
}
const toml = readFileSync(new URL('../worker/wrangler.toml', import.meta.url), 'utf8');
const origin = String(flags.origin ?? (tomlValue(toml, 'ALLOWED_ORIGINS') ?? '').split(',')[0].trim());

let failed = 0;
const line = (ok, name, detail) => {
  if (!ok) failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
};

async function call(path, init = {}) {
  const started = Date.now();
  try {
    const res = await fetch(api + path, { ...init, signal: AbortSignal.timeout(20000) });
    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch { /* not JSON */ }
    return { status: res.status, headers: res.headers, json, ms: Date.now() - started };
  } catch (e) {
    return { status: 0, headers: new Headers(), json: null, ms: Date.now() - started, error: e?.name ?? 'network' };
  }
}

async function main() {
  console.log(`Worker: ${api}\nOrigin: ${origin || '(tiada)'}\n`);

  const me = await call('/api/me');
  line(me.status === 401 && me.json?.ok === false, 'GET /api/me tanpa token → 401 JSON', `HTTP ${me.status}${me.error ? ` ${me.error}` : ''}, ${me.ms} ms`);

  const pre = await call('/api/me', { method: 'OPTIONS', headers: { Origin: origin, 'Access-Control-Request-Method': 'GET' } });
  const acao = pre.headers.get('Access-Control-Allow-Origin');
  line(pre.status === 204 && acao === origin, `OPTIONS dari ${origin} → CORS dibenarkan`, `HTTP ${pre.status}, allow-origin=${acao ?? '-'}`);

  const evil = await call('/api/me', { method: 'OPTIONS', headers: { Origin: 'https://contoh-jahat.example', 'Access-Control-Request-Method': 'GET' } });
  line(!evil.headers.get('Access-Control-Allow-Origin'), 'OPTIONS dari origin asing → tiada CORS', `HTTP ${evil.status}`);

  const reg = await call('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: origin },
    body: JSON.stringify({ email: 'bukan-emel', phone: '1', name: '', password: '' }),
  });
  line(reg.status === 400 && reg.json?.ok === false && typeof reg.json?.message === 'string' && reg.json.message.length > 0,
    'POST /api/register data salah → 400 + mesej BM (juga sentuh pangkalan data)',
    `HTTP ${reg.status}${reg.json?.message ? `: ${reg.json.message}` : ''}`);

  const unsigned = await call('/internal/export', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ table: 'items', limit: 1 }),
  });
  line(unsigned.status === 401, 'POST /internal/export tanpa tandatangan → 401', `HTTP ${unsigned.status}`);

  if (flags['internal-secret']) {
    const envFile = new URL('../.env.prod', import.meta.url);
    const secret = existsSync(envFile) ? parseEnv(readFileSync(envFile, 'utf8')).INTERNAL_SECRET : '';
    if (!secret) {
      line(false, 'INTERNAL_SECRET dalam .env.prod', 'tiada: jalankan node scripts/setup.mjs secrets');
    } else {
      const body = JSON.stringify({ table: 'items', limit: 1 });
      const t = Math.floor(Date.now() / 1000);
      const exp = await call('/internal/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-HDM-Sig': sigHeader(secret, t, body) },
        body,
      });
      const rows = exp.json?.data?.rows;
      line(exp.status === 200 && exp.json?.ok === true && Array.isArray(rows) && rows.length === 1,
        'POST /internal/export bertandatangan → 1 baris items (Hyperdrive → Postgres OK)',
        `HTTP ${exp.status}, ${Array.isArray(rows) ? rows.length : '-'} baris, ${exp.ms} ms${exp.status === 401 ? ' — INTERNAL_SECRET Worker lain daripada .env.prod?' : ''}`);
    }
  } else {
    console.log('NOTA  tambah --internal-secret untuk uji laluan pangkalan data penuh (Hyperdrive).');
  }

  console.log(failed ? `\n${failed} semakan GAGAL.` : '\nSemua semakan LULUS.');
  process.exitCode = failed ? 1 : 0;
}

main();
