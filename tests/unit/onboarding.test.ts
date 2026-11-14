import { describe, it, expect } from 'vitest';
import {
  ageToBirthYear, birthYearToAge, emptyOnboarding, mytYear, profileToForm, suggestProtein, validateOnboarding,
  type OnboardingForm,
} from '../../src/lib/onboarding';

// 31/12/2026 17:00 UTC = 01/01/2027 01:00 MYT
const NEW_YEAR_MYT = new Date('2026-12-31T17:00:00Z');
const MID = new Date('2026-11-14T04:00:00Z');

const good = (over: Partial<OnboardingForm> = {}): OnboardingForm => ({
  ...emptyOnboarding(),
  sex: 'L', age: '30', height: '175', weight: '80', activity: 3, target: '72', protein: '144',
  healthAck: true, privacyAck: true, ...over,
});

describe('MYT year / birth year', () => {
  it('uses the Malaysian calendar year', () => {
    expect(mytYear(NEW_YEAR_MYT)).toBe(2027);
    expect(mytYear(MID)).toBe(2026);
  });
  it('age <-> birth year', () => {
    expect(ageToBirthYear(30, MID)).toBe(1996);
    expect(ageToBirthYear(30, NEW_YEAR_MYT)).toBe(1997);
    expect(birthYearToAge(1996, MID)).toBe(30);
    expect(birthYearToAge(null, MID)).toBeNull();
  });
});

describe('suggestProtein', () => {
  it('round(1.8 x weight)', () => {
    expect(suggestProtein('80')).toBe('144');
    expect(suggestProtein('72,5')).toBe('131');
    expect(suggestProtein('')).toBe('');
    expect(suggestProtein('abc')).toBe('');
  });
});

describe('validateOnboarding', () => {
  it('builds the PUT /api/me/onboarding payload', () => {
    const r = validateOnboarding(good({ bodyFat: '25,5', waist: '92' }), MID);
    expect(r.errors).toEqual({});
    expect(r.payload).toEqual({
      sex: 'L', birth_year: 1996, height_cm: 175, start_weight_kg: 80, start_body_fat_pct: 25.5,
      start_waist_cm: 92, activity_level: 3, target_weight_kg: 72, protein_target_g: 144,
      health_ack: true, privacy_ack: true,
    });
  });

  it('optional fields become null', () => {
    const r = validateOnboarding(good({ target: '', protein: '' }), MID);
    expect(r.payload).toMatchObject({ start_body_fat_pct: null, start_waist_cm: null, target_weight_kg: null, protein_target_g: null });
  });

  it('empty form: every required field has a BM message', () => {
    const r = validateOnboarding(emptyOnboarding(), MID);
    expect(r.payload).toBeNull();
    expect(Object.keys(r.errors).sort()).toEqual(['activity', 'age', 'healthAck', 'height', 'privacyAck', 'sex', 'weight']);
    expect(r.errors.sex).toMatch(/Pilih jantina/);
  });

  it('mirrors save_onboarding ranges', () => {
    const bad: [Partial<OnboardingForm>, keyof OnboardingForm][] = [
      [{ height: '0' }, 'height'], [{ height: '301' }, 'height'], [{ weight: '0' }, 'weight'], [{ weight: '501' }, 'weight'],
      [{ age: '0' }, 'age'], [{ age: '30.5' }, 'age'], [{ age: '200' }, 'age'],
      [{ bodyFat: '0' }, 'bodyFat'], [{ bodyFat: '100' }, 'bodyFat'], [{ waist: '-1' }, 'waist'],
      [{ target: '0' }, 'target'], [{ protein: '0' }, 'protein'], [{ protein: '12.5' }, 'protein'],
      [{ activity: 0 }, 'activity'], [{ healthAck: false }, 'healthAck'], [{ privacyAck: false }, 'privacyAck'],
    ];
    for (const [over, key] of bad) {
      const r = validateOnboarding(good(over), MID);
      expect(r.payload, JSON.stringify(over)).toBeNull();
      expect(r.errors[key], JSON.stringify(over)).toBeTruthy();
    }
    expect(validateOnboarding(good({ height: '300', weight: '500', bodyFat: '99.9' }), MID).payload).not.toBeNull();
  });
});

describe('profileToForm', () => {
  it('prefills from a saved profile', () => {
    const f = profileToForm({
      sex: 'P', birth_year: 1996, height_cm: 160, start_weight_kg: '62.5', start_body_fat_pct: null, start_waist_cm: 80,
      activity_level: 2, target_weight_kg: 55, protein_target_g: 113,
    }, MID);
    expect(f).toMatchObject({ sex: 'P', age: '30', height: '160', weight: '62.5', bodyFat: '', waist: '80', activity: 2,
      target: '55', protein: '113', healthAck: false, privacyAck: false });
  });
  it('empty profile -> empty form', () => {
    expect(profileToForm(null, MID)).toEqual(emptyOnboarding());
  });
});
