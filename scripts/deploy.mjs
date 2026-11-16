// Release the app: clean-tree check → tests → build → commit dist/ (only if it changed) → tag vYYYYMMDD-N
// (Malaysia date) → print the jsDelivr URLs and the template lines to change.
//   node scripts/deploy.mjs [--worker] [--push] [--allow-dirty]
//     --worker       also type-checks worker/ and runs `npx wrangler deploy` in worker/
//     --push         also runs `git push origin HEAD --tags` (jsDelivr only sees pushed tags)
//     --allow-dirty  release even with uncommitted changes in src, worker, apps-script, db or scripts
// `npm test` includes the Worker security suite against a fake Hive (tests/security: route inventory, 401 without
// token, participant/coach 403 matrix, unsigned /internal 401), so no Worker is deployed with a broken boundary.
// The DB-backed suites (npm run test:db / test:worker) write to the production database: never after launch.
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseArgs, mytYmd, nextTag, parseGithubRemote, cdnUrls, spawnPlan, dirtyStatusArgs, dirtyRefusal } from './setuplib.mjs';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const { flags } = parseArgs(process.argv.slice(2), ['worker', 'push', 'allow-dirty']);

function run(cmd, args, opts = {}) {
  console.log(`\n> ${cmd} ${args.join(' ')}`);
  const plan = spawnPlan(cmd, args);
  const r = spawnSync(plan.cmd, plan.args, { cwd: ROOT, stdio: 'inherit', shell: plan.shell, ...opts });
  if (r.status !== 0) {
    console.error(`\nGAGAL: ${cmd} ${args.join(' ')} (kod ${r.status}). Tiada apa-apa ditolak.`);
    process.exit(1);
  }
}

function out(cmd, args) {
  const plan = spawnPlan(cmd, args);
  const r = spawnSync(plan.cmd, plan.args, { cwd: ROOT, encoding: 'utf8', shell: plan.shell });
  return r.status === 0 ? r.stdout.trim() : '';
}

// The tag must point at what was tested: refuse uncommitted source changes (git status failing counts as dirty).
{
  const plan = spawnPlan('git', dirtyStatusArgs());
  const st = spawnSync(plan.cmd, plan.args, { cwd: ROOT, encoding: 'utf8', shell: plan.shell });
  const refusal = st.status === 0 ? dirtyRefusal(st.stdout, !!flags['allow-dirty']) : 'git status gagal: semak folder ini repo git.';
  if (refusal) {
    console.error(`\nDIHENTIKAN: ${refusal}`);
    process.exit(1);
  }
  if (flags['allow-dirty'] && st.stdout.trim()) console.warn('\nAMARAN: --allow-dirty, ada perubahan belum di-commit.');
}

run('npm', ['test']); // includes the fake-Hive Worker security suite (tests/security)
if (flags.worker) run('npx', ['tsc', '-p', 'worker', '--noEmit']);
run('npm', ['run', 'build']);

if (out('git', ['status', '--porcelain', '--', 'dist'])) {
  const tagPreview = nextTag(out('git', ['tag', '--list', `v${mytYmd()}-*`]).split('\n'), mytYmd());
  run('git', ['add', '--', 'dist']);
  run('git', ['commit', '-m', `build: dist ${tagPreview}`, '--', 'dist']);
} else {
  console.log('\ndist/ tidak berubah: tiada commit baharu.');
}

// Reuse a release tag already on HEAD, else create the next one for today.
const onHead = out('git', ['tag', '--points-at', 'HEAD']).split('\n').filter((t) => /^v\d{8}-\d+$/.test(t));
let tag = onHead.sort().pop();
if (tag) {
  console.log(`\nHEAD sudah ada tag ${tag}: guna semula.`);
} else {
  const ymd = mytYmd();
  tag = nextTag(out('git', ['tag', '--list', `v${ymd}-*`]).split('\n'), ymd);
  run('git', ['tag', tag]);
}

if (flags.worker) run('npx', ['wrangler', 'deploy'], { cwd: fileURLToPath(new URL('../worker/', import.meta.url)) });
if (flags.push) run('git', ['push', 'origin', 'HEAD', '--tags']);

const gh = parseGithubRemote(out('git', ['remote', 'get-url', 'origin'])) ?? { owner: '<github-user>', repo: 'hdm-booster' };
const url = cdnUrls(gh.owner, gh.repo, tag);
console.log(`
==================================================================
Tag: ${tag}
  ${url.css}
  ${url.js}

Dalam Blogger › Tema › Edit HTML, tukar DUA baris ini (cari "@v" lama) kepada:
  <link href='${url.css}' rel='stylesheet'/>
  <script src='${url.js}' type='module'></script>
Kemudian Simpan, dan buka blog di telefon untuk semak.
${flags.push ? '' : '\nNOTA: belum ditolak ke GitHub. jsDelivr hanya nampak selepas: git push origin HEAD --tags\n'}==================================================================`);
