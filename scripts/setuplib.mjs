// Pure helpers shared by scripts/setup.mjs, deploy.mjs, smoke.mjs and loadtest.mjs (unit-tested in
// tests/unit/setuplib.test.ts). No file, network or process access here.
import { randomBytes, createHmac } from 'node:crypto';

/** 32 random bytes as base64url (43 chars): used for INTERNAL_SECRET, TICKET_SECRET, BCL_WEBHOOK_KEY. */
export function randomSecret() {
  return randomBytes(32).toString('base64url');
}

/**
 * Set KEY=VALUE lines in .env text: replaces the first existing line for each key (commented-out lines are left
 * alone), appends missing keys at the end. Comments, order and other keys are kept. Returns the new text.
 */
export function mergeEnv(text, updates) {
  const lines = (text ?? '').split(/\r?\n/);
  if (lines.length && lines[lines.length - 1] === '') lines.pop();
  const done = new Set();
  const out = lines.map((line) => {
    const m = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=/.exec(line);
    if (!m || !Object.hasOwn(updates, m[1])) return line;
    if (done.has(m[1])) return line;
    done.add(m[1]);
    return `${m[1]}=${updates[m[1]]}`;
  });
  for (const [k, v] of Object.entries(updates)) if (!done.has(k)) out.push(`${k}=${v}`);
  return out.join('\n') + '\n';
}

/** Placeholder keys in worker/wrangler.toml that only the REST fallback uses (not needed with Hyperdrive). */
export const OPTIONAL_PLACEHOLDERS = ['HIVE_DB_ID'];

/**
 * Non-comment lines of wrangler.toml that still contain a REPLACE placeholder.
 * @returns {{key: string, line: number, optional: boolean}[]}
 */
export function findPlaceholders(toml) {
  const found = [];
  (toml ?? '').split(/\r?\n/).forEach((raw, i) => {
    const line = raw.replace(/\s+#.*$/, '');
    if (/^\s*#/.test(raw) || !/REPLACE/.test(line)) return;
    const key = (/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=/.exec(line) ?? [])[1] ?? line.trim();
    found.push({ key, line: i + 1, optional: OPTIONAL_PLACEHOLDERS.includes(key) });
  });
  return found;
}

/** Value of a simple `KEY = "value"` line in wrangler.toml, or null. */
export function tomlValue(toml, key) {
  const re = new RegExp(`^\\s*${key}\\s*=\\s*"([^"]*)"`, 'm');
  const m = re.exec(toml ?? '');
  return m ? m[1] : null;
}

/** Problems with an ALLOWED_ORIGINS value for the deployed Worker (empty array = fine). */
export function originProblems(value) {
  const list = String(value ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  if (!list.length) return ['ALLOWED_ORIGINS kosong'];
  const out = [];
  for (const o of list) {
    if (/REPLACE/.test(o)) out.push(`${o}: masih placeholder`);
    else if (/localhost|127\.0\.0\.1/.test(o)) out.push(`${o}: localhost tidak boleh ada dalam prod`);
    else if (!/^https:\/\/[a-z0-9.-]+$/i.test(o)) out.push(`${o}: mesti https://nama-hos sahaja (tiada laluan, tiada / di hujung)`);
  }
  return out;
}

/**
 * Validate a Firebase service-account object. Never includes the key itself in messages.
 * @returns {{ok: boolean, errors: string[], projectId?: string, clientEmail?: string}}
 */
export function validateServiceAccount(sa) {
  const errors = [];
  if (!sa || typeof sa !== 'object' || Array.isArray(sa)) return { ok: false, errors: ['fail bukan objek JSON'] };
  if (sa.type !== undefined && sa.type !== 'service_account') errors.push('type mesti "service_account"');
  if (typeof sa.project_id !== 'string' || !sa.project_id.trim()) errors.push('project_id tiada');
  if (typeof sa.client_email !== 'string' || !/^[^@\s]+@[^@\s]+\.iam\.gserviceaccount\.com$/.test(sa.client_email)) {
    errors.push('client_email tiada atau bukan akaun servis (…@….iam.gserviceaccount.com)');
  }
  if (typeof sa.private_key !== 'string' || !sa.private_key.includes('-----BEGIN PRIVATE KEY-----')
    || !sa.private_key.includes('-----END PRIVATE KEY-----')) {
    errors.push('private_key tiada atau rosak');
  }
  return errors.length
    ? { ok: false, errors }
    : { ok: true, errors, projectId: sa.project_id, clientEmail: sa.client_email };
}

/** Firebase uid shape (console-created uids are 28 chars; allow 1-128 safe chars). */
export function isFirebaseUid(uid) {
  return typeof uid === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(uid);
}

/** Same rule as src/lib/phone.ts normalizePhone (Malaysian mobile → "60…" digits, or null). */
export function normalizePhone(raw) {
  if (raw == null) return null;
  let d = String(raw).replace(/\D/g, '');
  if (!d) return null;
  if (d.startsWith('60')) {
    // keep
  } else if (d.startsWith('0')) {
    d = '60' + d.slice(1);
  } else if (d.startsWith('1')) {
    d = '60' + d;
  } else {
    return null;
  }
  return /^601\d{8,9}$/.test(d) ? d : null;
}

/** Parse `--flag value` / `--flag=value` / boolean `--flag` arguments; the rest are positionals. */
export function parseArgs(argv, booleans = []) {
  const flags = {};
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) {
      positional.push(a);
      continue;
    }
    const eq = a.indexOf('=');
    if (eq > 0) flags[a.slice(2, eq)] = a.slice(eq + 1);
    else if (booleans.includes(a.slice(2)) || i + 1 >= argv.length || argv[i + 1].startsWith('--')) flags[a.slice(2)] = true;
    else flags[a.slice(2)] = argv[++i];
  }
  return { flags, positional };
}

/** YYYYMMDD in Malaysia time (UTC+8, no DST). */
export function mytYmd(date = new Date()) {
  return new Date(date.getTime() + 8 * 3600 * 1000).toISOString().slice(0, 10).replace(/-/g, '');
}

/** Next release tag `vYYYYMMDD-N` given the existing tag names. */
export function nextTag(existing, ymd) {
  let max = 0;
  const re = new RegExp(`^v${ymd}-(\\d+)$`);
  for (const t of existing) {
    const m = re.exec(String(t).trim());
    if (m) max = Math.max(max, Number(m[1]));
  }
  return `v${ymd}-${max + 1}`;
}

/** {owner, repo} from a GitHub remote URL (https or ssh), or null. */
export function parseGithubRemote(url) {
  const m = /github\.com[:/]([^/\s]+)\/([^/\s]+?)(?:\.git)?\/?$/.exec(String(url ?? '').trim());
  return m ? { owner: m[1], repo: m[2] } : null;
}

/** jsDelivr URLs of the built app for a tag. */
export function cdnUrls(owner, repo, tag) {
  const base = `https://cdn.jsdelivr.net/gh/${owner}/${repo}@${tag}/dist`;
  return { js: `${base}/app.js`, css: `${base}/app.css` };
}

/** X-HDM-Sig header value (same algorithm as worker/src/hmac.ts and apps-script/Hmac.gs.js). */
export function sigHeader(secret, t, body) {
  return `t=${t},v1=${createHmac('sha256', secret).update(`${t}.${body}`).digest('hex')}`;
}

/** Nearest-rank percentile (p in 0..100) of a list of numbers; NaN for an empty list. */
export function percentile(values, p) {
  if (!values.length) return NaN;
  const s = [...values].sort((a, b) => a - b);
  const rank = Math.ceil((p / 100) * s.length);
  return s[Math.min(s.length, Math.max(1, rank)) - 1];
}
