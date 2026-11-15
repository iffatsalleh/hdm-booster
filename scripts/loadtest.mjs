// PRE-LAUNCH ONLY load test against the single (prod) Worker.
//   node scripts/loadtest.mjs https://hdm-api.<akaun>.workers.dev --sebelum-lancar [--n 200]
// Fires N concurrent unauthenticated GET /api/me (expect 401) and N concurrent POST /api/register with invalid
// data (expect 400; each one runs a rate-limit query on the database). Reports errors and p95.
// Target: 0 errors and p95 < 2000 ms. Uses part of the Hyperdrive daily query quota (100,000/day on Free).
import { parseArgs, percentile } from './setuplib.mjs';

const { flags, positional } = parseArgs(process.argv.slice(2), ['sebelum-lancar']);
const api = String(positional[0] ?? '').replace(/\/+$/, '');
const n = Number(flags.n ?? 200);

console.log(`
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
!  AMARAN: ujian beban ini menembak Worker PRODUKSI.                              !
!  Jalankan SEBELUM PELANCARAN sahaja. JANGAN jalankan selepas peserta mula guna: !
!  ia boleh melambatkan aplikasi untuk peserta sebenar.                           !
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
`);
if (!/^https?:\/\/\S+$/.test(api) || !Number.isInteger(n) || n < 1 || n > 1000) {
  console.error('Guna: node scripts/loadtest.mjs https://hdm-api.<akaun>.workers.dev --sebelum-lancar [--n 200]');
  process.exit(1);
}
if (!flags['sebelum-lancar']) {
  console.error('Tambah --sebelum-lancar untuk mengesahkan aplikasi BELUM dilancarkan.');
  process.exit(1);
}

async function hit(kind) {
  const started = performance.now();
  const init = kind === 'me'
    ? {}
    : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'x', phone: '', name: '', password: '' }) };
  const expected = kind === 'me' ? 401 : 400;
  try {
    const res = await fetch(`${api}${kind === 'me' ? '/api/me' : '/api/register'}`, { ...init, signal: AbortSignal.timeout(30000) });
    await res.arrayBuffer();
    return { kind, ok: res.status === expected, status: res.status, ms: performance.now() - started };
  } catch (e) {
    return { kind, ok: false, status: e?.name ?? 'network', ms: performance.now() - started };
  }
}

async function main() {
  console.log(`${n} × GET /api/me + ${n} × POST /api/register serentak → ${api}\n`);
  const t0 = performance.now();
  const results = await Promise.all([...Array(n)].flatMap(() => [hit('me'), hit('register')]));
  const wall = performance.now() - t0;

  let bad = 0;
  for (const kind of ['me', 'register']) {
    const rs = results.filter((r) => r.kind === kind);
    const errs = rs.filter((r) => !r.ok);
    bad += errs.length;
    const ms = rs.map((r) => r.ms);
    const byStatus = {};
    for (const r of errs) byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
    console.log(`${kind === 'me' ? 'GET /api/me      ' : 'POST /api/register'}  ralat=${errs.length}/${rs.length}`
      + `  p50=${Math.round(percentile(ms, 50))} ms  p95=${Math.round(percentile(ms, 95))} ms  max=${Math.round(Math.max(...ms))} ms`
      + (errs.length ? `  status ralat: ${JSON.stringify(byStatus)}` : ''));
  }
  const p95 = percentile(results.map((r) => r.ms), 95);
  console.log(`\nKeseluruhan: ${results.length} permintaan dalam ${Math.round(wall)} ms, ralat=${bad}, p95=${Math.round(p95)} ms`);
  const pass = bad === 0 && p95 < 2000;
  console.log(pass ? 'LULUS (0 ralat, p95 < 2 s)' : 'GAGAL (sasaran: 0 ralat dan p95 < 2000 ms)');
  process.exitCode = pass ? 0 : 1;
}

main();
