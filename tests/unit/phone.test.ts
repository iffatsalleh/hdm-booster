import { describe, it, expect } from 'vitest';
import { normalizePhone, normalizeEmail } from '../../src/lib/phone';

describe('normalizePhone', () => {
  it('normalises Malaysian mobiles', () => {
    expect(normalizePhone('012-345 6789')).toBe('60123456789');
    expect(normalizePhone('+60123456789')).toBe('60123456789');
    expect(normalizePhone('0123456789')).toBe('60123456789');
    expect(normalizePhone('60 11-2345 6789')).toBe('601123456789');
    expect(normalizePhone('123456789')).toBe('60123456789');
  });
  it('rejects invalid', () => {
    expect(normalizePhone('12345')).toBeNull();
    expect(normalizePhone('0312345678')).toBeNull();
    expect(normalizePhone('')).toBeNull();
    expect(normalizePhone(null as unknown as string)).toBeNull();
    expect(normalizePhone(undefined as unknown as string)).toBeNull();
  });
});

describe('normalizeEmail', () => {
  it('trims and lowercases', () => {
    expect(normalizeEmail('  Ali@Gmail.COM ')).toBe('ali@gmail.com');
  });
});
