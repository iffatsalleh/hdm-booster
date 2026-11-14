// PUT /api/me/targets payload from the TDEE calculator (unit-tested).
import { calcTdee, type TdeeInput } from './tdee';

export type TargetsPayload = { tdee_kcal: number; kcal_target: number; protein_target_g: number };

/** deficitIdx: 0 Ringan, 1 Sederhana (recommended), 2 Agresif. */
export function buildTargets(i: TdeeInput, deficitIdx: number): TargetsPayload {
  const t = calcTdee(i);
  const d = t.deficits[deficitIdx] ?? t.deficits[1];
  return { tdee_kcal: Math.round(t.tdee), kcal_target: d.kcal, protein_target_g: t.macros.proteinG };
}
