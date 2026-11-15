import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  randomSecret, mergeEnv, findPlaceholders, tomlValue, originProblems, validateServiceAccount, isFirebaseUid,
  normalizePhone, parseArgs, mytYmd, nextTag, parseGithubRemote, cdnUrls, sigHeader, percentile,
} from '../../scripts/setuplib.mjs';
import { normalizePhone as appNormalizePhone } from '../../src/lib/phone';
import { signHmac, verifySigHeader } from '../../worker/src/hmac';

describe('randomSecret', () => {
  it('is 43 base64url chars and different each time', () => {
    const a = randomSecret();
    expect(a).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(randomSecret()).not.toBe(a);
  });
});

describe('mergeEnv', () => {
  it('replaces existing keys in place, appends new ones, keeps comments and other keys', () => {
    const text = '# comment\nHIVE_PG_URL=postgres://x\nINTERNAL_SECRET=old\n# TICKET_SECRET=commented\n';
    expect(mergeEnv(text, { INTERNAL_SECRET: 'new', TICKET_SECRET: 't' })).toBe(
      '# comment\nHIVE_PG_URL=postgres://x\nINTERNAL_SECRET=new\n# TICKET_SECRET=commented\nTICKET_SECRET=t\n',
    );
  });
  it('handles empty input and CRLF', () => {
    expect(mergeEnv('', { A: '1' })).toBe('A=1\n');
    expect(mergeEnv('A=0\r\nB=2\r\n', { A: '1' })).toBe('A=1\nB=2\n');
  });
  it('only rewrites the first duplicate', () => {
    expect(mergeEnv('A=0\nA=9\n', { A: '1' })).toBe('A=1\nA=9\n');
  });
});

describe('findPlaceholders / tomlValue', () => {
  const toml = [
    '# id = "REPLACE_WITH_X" in a comment is ignored',
    '[[hyperdrive]]',
    'id = "REPLACE_WITH_HYPERDRIVE_ID"',
    'HIVE_DB_ID = "REPLACE_WITH_DB_ID"',
    'FIREBASE_PROJECT_ID = "hdm-prod" # REPLACE note in trailing comment',
    'ALLOWED_ORIGINS = "https://REPLACE.blogspot.com"',
  ].join('\n');
  it('lists non-comment placeholders, marking REST-only ones optional', () => {
    expect(findPlaceholders(toml)).toEqual([
      { key: 'id', line: 3, optional: false },
      { key: 'HIVE_DB_ID', line: 4, optional: true },
      { key: 'ALLOWED_ORIGINS', line: 6, optional: false },
    ]);
  });
  it('reads simple values', () => {
    expect(tomlValue(toml, 'FIREBASE_PROJECT_ID')).toBe('hdm-prod');
    expect(tomlValue(toml, 'MISSING')).toBeNull();
  });
  it('the committed wrangler.toml keeps placeholders and no localhost origin', () => {
    const real = readFileSync(new URL('../../worker/wrangler.toml', import.meta.url), 'utf8');
    expect(findPlaceholders(real).map((p) => p.key)).toEqual(
      expect.arrayContaining(['id', 'FIREBASE_PROJECT_ID', 'ALLOWED_ORIGINS', 'GAS_URL']),
    );
    expect(tomlValue(real, 'ALLOWED_ORIGINS')).toBe('https://REPLACE.blogspot.com');
  });
});

describe('originProblems', () => {
  it('accepts https origins only', () => {
    expect(originProblems('https://hdmbooster.blogspot.com')).toEqual([]);
    expect(originProblems('https://a.blogspot.com, https://www.example.my')).toEqual([]);
    expect(originProblems('')).toHaveLength(1);
    expect(originProblems('https://REPLACE.blogspot.com')[0]).toMatch(/placeholder/);
    expect(originProblems('https://a.blogspot.com,http://localhost:5173')[0]).toMatch(/localhost/);
    expect(originProblems('https://a.blogspot.com/')[0]).toMatch(/https/);
  });
});

describe('validateServiceAccount', () => {
  const good = {
    type: 'service_account',
    project_id: 'hdm-prod',
    client_email: 'firebase-adminsdk-x@hdm-prod.iam.gserviceaccount.com',
    private_key: '-----BEGIN PRIVATE KEY-----\nSECRETKEYBODY\n-----END PRIVATE KEY-----\n',
  };
  it('accepts a service account', () => {
    expect(validateServiceAccount(good)).toEqual({
      ok: true, errors: [], projectId: 'hdm-prod', clientEmail: good.client_email,
    });
  });
  it('rejects bad shapes without echoing the key', () => {
    expect(validateServiceAccount(null).ok).toBe(false);
    expect(validateServiceAccount([]).ok).toBe(false);
    const r = validateServiceAccount({ ...good, private_key: 'SECRETKEYBODY', client_email: 'me@gmail.com', project_id: '' });
    expect(r.ok).toBe(false);
    expect(r.errors).toHaveLength(3);
    expect(JSON.stringify(r)).not.toContain('SECRETKEYBODY');
    expect(validateServiceAccount({ ...good, type: 'authorized_user' }).ok).toBe(false);
  });
});

describe('small helpers', () => {
  it('isFirebaseUid', () => {
    expect(isFirebaseUid('aB3dE5fG7hI9jK1lM3nO5pQ7rS9t')).toBe(true);
    expect(isFirebaseUid('')).toBe(false);
    expect(isFirebaseUid("x'; drop table")).toBe(false);
  });
  it('normalizePhone matches the app rule', () => {
    for (const p of ['0123456789', '+60 12-345 6789', '60111234567', '123456789', '0812345678', '012', 'abc', '']) {
      expect(normalizePhone(p)).toBe(appNormalizePhone(p));
    }
  });
  it('parseArgs', () => {
    expect(parseArgs(['superadmin', '--uid', 'U1', '--name=Ali Abu', '--apply'], ['apply'])).toEqual({
      flags: { uid: 'U1', name: 'Ali Abu', apply: true }, positional: ['superadmin'],
    });
    expect(parseArgs(['x', '--worker']).flags.worker).toBe(true);
  });
  it('mytYmd uses UTC+8', () => {
    expect(mytYmd(new Date('2026-11-14T16:30:00Z'))).toBe('20261115');
    expect(mytYmd(new Date('2026-11-14T15:59:00Z'))).toBe('20261114');
  });
  it('nextTag', () => {
    expect(nextTag([], '20261115')).toBe('v20261115-1');
    expect(nextTag(['v20261115-1', 'v20261115-3', 'v20261114-9', 'x'], '20261115')).toBe('v20261115-4');
  });
  it('parseGithubRemote + cdnUrls', () => {
    expect(parseGithubRemote('https://github.com/ali/hdm-booster.git')).toEqual({ owner: 'ali', repo: 'hdm-booster' });
    expect(parseGithubRemote('git@github.com:ali/hdm-booster.git')).toEqual({ owner: 'ali', repo: 'hdm-booster' });
    expect(parseGithubRemote('https://gitlab.com/a/b')).toBeNull();
    expect(cdnUrls('ali', 'hdm-booster', 'v20261115-1').js).toBe(
      'https://cdn.jsdelivr.net/gh/ali/hdm-booster@v20261115-1/dist/app.js',
    );
  });
  it('percentile (nearest rank)', () => {
    expect(percentile([], 95)).toBeNaN();
    const v = Array.from({ length: 100 }, (_, i) => i + 1);
    expect(percentile(v, 95)).toBe(95);
    expect(percentile([5, 1, 3], 50)).toBe(3);
  });
});

describe('sigHeader', () => {
  it('matches the Worker signature and verifies', async () => {
    const t = 1_763_000_000;
    const body = JSON.stringify({ table: 'items', limit: 1 });
    expect(sigHeader('s3cret', t, body)).toBe(`t=${t},v1=${await signHmac('s3cret', t, body)}`);
    expect(await verifySigHeader('s3cret', sigHeader('s3cret', t, body), body, t + 10)).toBe(true);
  });
});
