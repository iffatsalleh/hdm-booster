import { describe, it, expect } from 'vitest';
import { normalizeCode } from '../../src/lib/codes';

describe('normalizeCode', () => {
  it('normalises case, spaces and hyphens', () => {
    expect(normalizeCode('hdmb a7k3-q9xp')).toBe('HDMB-A7K3-Q9XP');
    expect(normalizeCode('a7k3q9xp')).toBe('HDMB-A7K3-Q9XP');
    expect(normalizeCode('HDMB-A7K3-Q9XP')).toBe('HDMB-A7K3-Q9XP');
  });
  it('rejects chars outside alphabet', () => {
    expect(normalizeCode('HDMB-A7K3-Q9X0')).toBeNull();
    expect(normalizeCode('HDMB-I7K3-Q9XP')).toBeNull();
    expect(normalizeCode('HDMB-A7K3-O9XP')).toBeNull();
    expect(normalizeCode('HDMB-A7K3-Q9X1')).toBeNull();
  });
  it('rejects wrong length', () => {
    expect(normalizeCode('A7K3Q9X')).toBeNull();
    expect(normalizeCode('HDMBA7K3Q9XPA')).toBeNull();
    expect(normalizeCode('')).toBeNull();
  });
});
