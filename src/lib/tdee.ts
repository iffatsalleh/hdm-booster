export type TdeeInput = {
  sex: 'L' | 'P';
  age: number;
  heightCm: number;
  weightKg: number;
  activity: 1 | 2 | 3 | 4 | 5;
};

const FACTORS = [1.2, 1.375, 1.55, 1.725, 1.9];

export function calcTdee(i: TdeeInput) {
  const bmr = 10 * i.weightKg + 6.25 * i.heightCm - 5 * i.age + (i.sex === 'L' ? 5 : -161);
  const tdee = bmr * FACTORS[i.activity - 1];
  const deficits = [
    { label: 'Ringan (-15%)', pct: 15 },
    { label: 'Sederhana (-20%)', pct: 20 },
    { label: 'Agresif (-25%)', pct: 25 },
  ].map((d) => ({ ...d, kcal: Math.round(tdee * (1 - d.pct / 100)) }));
  const target = deficits[1].kcal;
  const proteinG = Math.round(1.8 * i.weightKg);
  const fatG = Math.round((0.25 * target) / 9);
  const carbG = Math.round((target - proteinG * 4 - fatG * 9) / 4);
  return {
    bmr,
    tdee,
    deficits,
    proteinG: { min: Math.round(1.6 * i.weightKg), max: Math.round(2.0 * i.weightKg) },
    macros: { proteinG, fatG, carbG },
  };
}
