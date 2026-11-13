import { describe, it, expect } from 'vitest';
import { calcTdee } from '../../src/lib/tdee';

describe('calcTdee', () => {
  it('male example', () => {
    const t = calcTdee({ sex: 'L', age: 30, heightCm: 175, weightKg: 80, activity: 3 });
    expect(t.bmr).toBeCloseTo(1748.75, 1);
    expect(Math.round(t.tdee)).toBe(2711);
    expect(t.proteinG).toEqual({ min: 128, max: 160 });
    expect(t.deficits.map((d) => d.label)).toEqual(['Ringan (-15%)', 'Sederhana (-20%)', 'Agresif (-25%)']);
    expect(t.deficits.map((d) => d.pct)).toEqual([15, 20, 25]);
    expect(t.deficits.map((d) => d.kcal)).toEqual([2304, 2168, 2033]);
    expect(t.macros).toEqual({ proteinG: 144, fatG: 60, carbG: 263 });
  });
  it('female bmr', () => {
    expect(calcTdee({ sex: 'P', age: 30, heightCm: 160, weightKg: 60, activity: 1 }).bmr).toBeCloseTo(1289, 0);
  });
});
