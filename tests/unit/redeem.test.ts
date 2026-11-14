import { describe, it, expect } from 'vitest';
import { prepareCode, redeemSuccessText, itemNames } from '../../src/lib/redeem';
import { buildTargets } from '../../src/lib/targets';
import { pdpaDeleteText, validatePasswordChange } from '../../src/lib/account';

describe('prepareCode', () => {
  it('normalises before sending', () => {
    expect(prepareCode(' hdmb upgr ade2 ')).toEqual({ ok: true, code: 'HDMB-UPGR-ADE2' });
    expect(prepareCode('upgrade2')).toEqual({ ok: true, code: 'HDMB-UPGR-ADE2' });
  });
  it('empty / bad format -> BM error, no code', () => {
    const e = prepareCode('   ');
    expect(e.ok).toBe(false);
    if (!e.ok) expect(e.error).toMatch(/Sila masukkan kod/);
    const b = prepareCode('HDMB-ABCD-EF01'); // 0 and 1 are not in the alphabet
    expect(b.ok).toBe(false);
    if (!b.ok) expect(b.error).toMatch(/HDMB-XXXX-XXXX/);
  });
});

describe('redeem result text', () => {
  it('counts new items', () => {
    expect(redeemSuccessText(['a', 'b', 'c', 'd', 'e', 'f', 'g'])).toBe('Berjaya! 7 item baharu dibuka.');
    expect(redeemSuccessText(['a'])).toBe('Berjaya! 1 item baharu dibuka.');
    expect(redeemSuccessText([])).toMatch(/sudah memiliki/);
  });
  it('maps item keys to catalogue names', () => {
    const items = [{ key: 'tdee', name: 'Kalkulator TDEE', kind: 'tool', sort: 1 }];
    expect(itemNames(['tdee', 'x_unknown'], items)).toEqual(['Kalkulator TDEE', 'x_unknown']);
  });
});

describe('buildTargets', () => {
  it('PUT /api/me/targets payload for the chosen deficit', () => {
    const i = { sex: 'L' as const, age: 30, heightCm: 175, weightKg: 80, activity: 3 as const };
    expect(buildTargets(i, 1)).toEqual({ tdee_kcal: 2711, kcal_target: 2168, protein_target_g: 144 });
    expect(buildTargets(i, 0).kcal_target).toBe(2304);
    expect(buildTargets(i, 2).kcal_target).toBe(2033);
  });
});

describe('account helpers', () => {
  it('PDPA delete text includes name and email', () => {
    const t = pdpaDeleteText('Ali Bin Abu', 'ali@gmail.com');
    expect(t).toContain('Ali Bin Abu');
    expect(t).toContain('ali@gmail.com');
    expect(t).toMatch(/padam/i);
  });
  it('password change validation', () => {
    expect(validatePasswordChange('', 'abcdefgh', 'abcdefgh')).toEqual({ current: 'Sila masukkan kata laluan semasa.' });
    expect(validatePasswordChange('lama1234', 'short', 'short').next).toMatch(/8 aksara/);
    expect(validatePasswordChange('lama1234', 'baharu123', 'baharu124').confirm).toMatch(/tidak sama/);
    expect(validatePasswordChange('lama1234', 'lama1234', 'lama1234').next).toMatch(/berbeza/);
    expect(validatePasswordChange('lama1234', 'baharu123', 'baharu123')).toEqual({});
  });
});

describe('passwordChangeError', () => {
  it('maps Firebase codes to the right field', async () => {
    const { passwordChangeError } = await import('../../src/lib/account');
    expect(passwordChangeError({ code: 'auth/invalid-credential' })?.field).toBe('current');
    expect(passwordChangeError({ code: 'auth/wrong-password' })?.message).toMatch(/semasa salah/);
    expect(passwordChangeError({ code: 'auth/weak-password' })?.field).toBe('next');
    expect(passwordChangeError({ code: 'auth/requires-recent-login' })).toMatchObject({ field: null });
    expect(passwordChangeError({ code: 'auth/network-request-failed' })).toBeNull();
    expect(passwordChangeError(new Error('x'))).toBeNull();
  });
});
