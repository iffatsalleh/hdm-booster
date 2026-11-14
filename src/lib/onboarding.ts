// Onboarding form: pure validation + payload builder for PUT /api/me/onboarding (unit-tested).
// Ranges mirror save_onboarding() in db/migrations/0004_content.sql.
import { todayMYT } from './dates';

export type OnboardingForm = {
  sex: '' | 'L' | 'P';
  age: string;
  height: string;
  weight: string;
  bodyFat: string;
  waist: string;
  activity: 0 | 1 | 2 | 3 | 4 | 5;
  target: string;
  protein: string;
  healthAck: boolean;
  privacyAck: boolean;
};

export type OnboardingPayload = {
  sex: 'L' | 'P';
  birth_year: number;
  height_cm: number;
  start_weight_kg: number;
  start_body_fat_pct: number | null;
  start_waist_cm: number | null;
  activity_level: number;
  target_weight_kg: number | null;
  protein_target_g: number | null;
  health_ack: true;
  privacy_ack: true;
};

export type OnboardingErrors = Partial<Record<keyof OnboardingForm, string>>;

export const ACTIVITY_LEVELS: { lv: 1 | 2 | 3 | 4 | 5; name: string; desc: string }[] = [
  { lv: 1, name: 'Tidak aktif', desc: 'Kerja duduk' },
  { lv: 2, name: 'Ringan', desc: 'Senaman 1-3x seminggu' },
  { lv: 3, name: 'Sederhana', desc: 'Senaman 3-5x seminggu' },
  { lv: 4, name: 'Aktif', desc: 'Senaman 6-7x seminggu' },
  { lv: 5, name: 'Sangat aktif', desc: 'Kerja fizikal + latihan' },
];

export function emptyOnboarding(): OnboardingForm {
  return {
    sex: '', age: '', height: '', weight: '', bodyFat: '', waist: '', activity: 0, target: '', protein: '',
    healthAck: false, privacyAck: false,
  };
}

/** Calendar year in Asia/Kuala_Lumpur. */
export function mytYear(now: Date = new Date()): number {
  return Number(todayMYT(now).slice(0, 4));
}

export function ageToBirthYear(age: number, now: Date = new Date()): number {
  return mytYear(now) - age;
}

export function birthYearToAge(by: unknown, now: Date = new Date()): number | null {
  const n = typeof by === 'number' ? by : typeof by === 'string' && by.trim() ? Number(by) : NaN;
  return Number.isFinite(n) ? mytYear(now) - n : null;
}

/** Accepts "72,5" as well as "72.5"; NaN when empty or not a number. */
export function num(s: string): number {
  const t = String(s ?? '').trim().replace(',', '.');
  return t && /^-?\d+(\.\d+)?$/.test(t) ? Number(t) : NaN;
}

/** Suggested daily protein: round(1.8 g x body weight), as a string for the input ('' if no weight). */
export function suggestProtein(weight: string): string {
  const w = num(weight);
  return Number.isFinite(w) && w > 0 ? String(Math.round(1.8 * w)) : '';
}

export function validateOnboarding(f: OnboardingForm, now: Date = new Date()):
  { errors: OnboardingErrors; payload: OnboardingPayload | null } {
  const e: OnboardingErrors = {};
  const maxAge = mytYear(now) - 1900;

  if (f.sex !== 'L' && f.sex !== 'P') e.sex = 'Pilih jantina anda: Lelaki atau Perempuan.';

  const age = num(f.age);
  if (!f.age.trim()) e.age = 'Masukkan umur anda dalam tahun (contoh: 30).';
  else if (!Number.isInteger(age) || age < 1 || age > maxAge) e.age = 'Masukkan umur dalam nombor bulat, contoh: 30.';

  const h = num(f.height);
  if (!f.height.trim()) e.height = 'Masukkan tinggi anda dalam cm (contoh: 165).';
  else if (!(h > 0 && h <= 300)) e.height = 'Tinggi mesti antara 1 hingga 300 cm. Semak semula, contoh: 165.';

  const w = num(f.weight);
  if (!f.weight.trim()) e.weight = 'Masukkan berat anda dalam kg (contoh: 70).';
  else if (!(w > 0 && w <= 500)) e.weight = 'Berat mesti antara 1 hingga 500 kg. Semak semula, contoh: 70.';

  const opt = (s: string) => (s.trim() ? num(s) : null);
  const bf = opt(f.bodyFat);
  if (bf !== null && !(bf > 0 && bf < 100)) e.bodyFat = 'Lemak badan mesti antara 1 hingga 99%, atau biarkan kosong.';
  const waist = opt(f.waist);
  if (waist !== null && !(waist > 0)) e.waist = 'Masukkan ukuran pinggang dalam cm (contoh: 90), atau biarkan kosong.';

  if (!(f.activity >= 1 && f.activity <= 5)) e.activity = 'Pilih tahap aktiviti yang paling hampir dengan rutin anda.';

  const tw = opt(f.target);
  if (tw !== null && !(tw > 0)) e.target = 'Masukkan berat sasaran dalam kg (contoh: 65), atau biarkan kosong.';
  const prot = opt(f.protein);
  if (prot !== null && !(Number.isInteger(prot) && prot > 0)) {
    e.protein = 'Masukkan sasaran protein dalam gram, nombor bulat (contoh: 120).';
  }

  if (!f.healthAck) e.healthAck = 'Tandakan kotak ini untuk sahkan anda faham nota kesihatan.';
  if (!f.privacyAck) e.privacyAck = 'Tandakan kotak ini untuk bersetuju dengan Notis Privasi.';

  if (Object.keys(e).length) return { errors: e, payload: null };
  return {
    errors: {},
    payload: {
      sex: f.sex as 'L' | 'P',
      birth_year: ageToBirthYear(age, now),
      height_cm: h,
      start_weight_kg: w,
      start_body_fat_pct: bf,
      start_waist_cm: waist,
      activity_level: f.activity,
      target_weight_kg: tw,
      protein_target_g: prot,
      health_ack: true,
      privacy_ack: true,
    },
  };
}

const str = (v: unknown) => (v == null || v === '' ? '' : String(v));

/** Prefill from a saved profile (acks always start unticked). */
export function profileToForm(p: Record<string, unknown> | null | undefined, now: Date = new Date()): OnboardingForm {
  if (!p) return emptyOnboarding();
  const act = Number(p.activity_level);
  const age = birthYearToAge(p.birth_year, now);
  return {
    sex: p.sex === 'L' || p.sex === 'P' ? p.sex : '',
    age: age == null ? '' : String(age),
    height: str(p.height_cm),
    weight: str(p.start_weight_kg),
    bodyFat: str(p.start_body_fat_pct),
    waist: str(p.start_waist_cm),
    activity: act >= 1 && act <= 5 ? (act as 1 | 2 | 3 | 4 | 5) : 0,
    target: str(p.target_weight_kg),
    protein: str(p.protein_target_g),
    healthAck: false,
    privacyAck: false,
  };
}
