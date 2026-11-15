// DEV MOCK ONLY (npm run dev:mock). Never imported by a production build.
// Mirrors db/seed.sql: catalogue, Batch Rejab 1448, 7 ebooks, public settings.
import type { Bootstrap, CatalogPackage, Reading } from '../state/session';

export const MOCK_PASSWORD = 'rahsia1234';

const BASIC = ['ebook_strategi', 'graduation', 'group_hdm', 'sistem', 'tdee'];
const COMPLETE = [
  'ebook_emergency', 'ebook_food_swap', 'ebook_muscle_mania', 'ebook_strategi', 'ebook_supplement', 'ebook_tas',
  'ebook_traditional_remedy', 'graduation', 'group_hdm', 'group_muscle_mania', 'sistem', 'tdee',
];

export const packages: CatalogPackage[] = [
  { id: 'basic', name: 'Pakej Basic', price_rm: 100, sellable: true, items: BASIC },
  { id: 'complete', name: 'Pakej Complete', price_rm: 150, sellable: true, items: COMPLETE },
  {
    id: 'upgrade_a_b', name: 'Naik Taraf A ke B', price_rm: 50, sellable: false,
    items: ['ebook_emergency', 'ebook_food_swap', 'ebook_muscle_mania', 'ebook_supplement', 'ebook_tas',
      'ebook_traditional_remedy', 'group_muscle_mania'],
  },
];

const items: [string, string, string][] = [
  ['sistem', 'Sistem HDM Booster', 'modul'],
  ['ebook_strategi', 'Ebook Strategi', 'ebook'],
  ['ebook_muscle_mania', 'Ebook Muscle Mania', 'ebook'],
  ['ebook_traditional_remedy', 'Ebook Traditional Remedy', 'ebook'],
  ['ebook_tas', 'Ebook TAS', 'ebook'],
  ['ebook_food_swap', 'Ebook Food Swap', 'ebook'],
  ['ebook_emergency', 'Ebook Emergency', 'ebook'],
  ['ebook_supplement', 'Ebook Supplement', 'ebook'],
  ['tdee', 'Kalkulator TDEE', 'tool'],
  ['graduation', 'Graduation Report', 'modul'],
  ['group_hdm', 'Group HDM', 'group'],
  ['group_muscle_mania', 'Group Muscle Mania', 'group'],
];

const ebooks: [string, string][] = [
  ['ebook_strategi', 'Ebook Strategi HDM BOOSTER (Updated Version)'],
  ['ebook_muscle_mania', 'Ebook MUSCLE MANIA'],
  ['ebook_traditional_remedy', 'Ebook TRADITIONAL REMEDY'],
  ['ebook_tas', 'Ebook TAS'],
  ['ebook_food_swap', 'Ebook FOOD SWAP MATRIX'],
  ['ebook_emergency', 'Ebook HDM EMERGENCY PROTOCOL'],
  ['ebook_supplement', 'Ebook HDM SUPPLEMENT STACK'],
];

export const batch = {
  id: '00000000-0000-4000-8000-000000001448',
  name: 'Batch Rejab 1448',
  status: 'akan_datang',
  sales_open_at: '2026-11-30T16:00:00+00:00',
  sales_close_at: '2027-01-31T15:59:00+00:00',
  program_start: '2026-12-10',
  program_end: '2027-03-10',
  phases: [
    { key: 'rejab' as const, start: '2026-12-10', end: '2027-01-08' },
    { key: 'syaaban' as const, start: '2027-01-09', end: '2027-02-07' },
    { key: 'ramadan' as const, start: '2027-02-08', end: '2027-03-09' },
  ],
};

export const catalog: Bootstrap['catalog'] = {
  items: items.map(([key, name, kind], i) => ({ key, name, kind, sort: i + 1 })),
  packages,
  ebooks: ebooks.map(([item_key, title], i) => ({
    id: `00000000-0000-4000-8000-00000000000${i + 1}`,
    // mock: ebook 01 may be downloaded (exercises the download button); files "updated" 01/12/2026
    item_key, number: i + 1, title, description: null, cover_url: null, allow_download: i === 0,
    file_updated_at: '2026-12-01T02:00:00.000Z', sort: i + 1,
  })),
  settings: {
    support_wa: '60134417042',
    wa_upgrade_text: 'Salam, saya ingin naik taraf ke Pakej Complete HDM BOOSTER. Emel pendaftaran: {emel}',
    upgrade_note: 'Naik taraf ke Pakej Complete untuk buka Ebook 02-07 dan Group Muscle Mania.',
  },
};

export type MockAccount = {
  uid: string;
  email: string;
  password: string;
  full_name: string;
  phone: string;
  onboarded_at: string | null;
  roles: string[];
  entitlements: string[];
  /** Onboarding / target columns of `profiles` (sex, birth_year, height_cm, ...). */
  profile?: Record<string, unknown>;
  /** reading_progress rows (PUT /api/ebook/:id/progress). */
  reading?: Reading[];
};

/** Registered fixture user: Ali Bin Abu, Pakej Basic, already onboarded. */
export const ALI: MockAccount = {
  uid: 'mock-ali',
  email: 'ali@gmail.com',
  password: MOCK_PASSWORD,
  full_name: 'Ali Bin Abu',
  phone: '60123456789',
  onboarded_at: '2026-11-13T10:00:00+08:00',
  roles: [],
  entitlements: BASIC,
  profile: {
    sex: 'L', birth_year: 1996, height_cm: 175, start_weight_kg: 80, start_body_fat_pct: null, start_waist_cm: 92,
    activity_level: 3, target_weight_kg: 72, protein_target_g: 144, tdee_kcal: null, kcal_target: null,
  },
};

/** Onboarded user without the `tdee` / group items (e.g. bought a partial package): TDEE + groups locked. */
export const AHMAD: MockAccount = {
  uid: 'mock-ahmad',
  email: 'ahmad@gmail.com',
  password: MOCK_PASSWORD,
  full_name: 'Ahmad Kassim',
  phone: '60198765432',
  onboarded_at: '2026-11-13T11:00:00+08:00',
  roles: [],
  entitlements: ['ebook_strategi', 'sistem'],
  profile: {
    sex: 'L', birth_year: 1988, height_cm: 168, start_weight_kg: 90, activity_level: 2, protein_target_g: 162,
  },
};

/** account_summary purchases per fixture uid. */
export const PURCHASES: Record<string, unknown[]> = {
  'mock-ali': [{
    id: 'p-ali-1', order_ref: 'BCL-10293', package_id: 'basic', package_name: 'Pakej Basic', status: 'dituntut',
    amount_rm: 100, paid_at: '2026-11-12T02:00:00+00:00', batch_id: batch.id, entitlements: BASIC,
  }],
};

export const GROUPS = [
  { id: 'g-hdm', item_key: 'group_hdm', name: 'Group Support HDM', coach: 'Coach Iffat Salleh',
    description: 'Pemakanan, intermittent fasting & soal jawab harian', invite_url: 'https://chat.whatsapp.com/MOCK-GROUP-HDM' },
  { id: 'g-mm', item_key: 'group_muscle_mania', name: 'Group Support MUSCLE MANIA', coach: 'Coach Anuar Yusof "Toy"',
    description: 'Latihan rintangan & jaga otot', invite_url: 'https://chat.whatsapp.com/MOCK-GROUP-MUSCLE-MANIA' },
];

export type MockCode = { code: string; package_id: string; status: 'baru' | 'aktif' | 'dibatalkan'; expired?: boolean;
  redeemed_by?: string; redeemed_at?: string };

/** Access codes: HDMB-UPGR-ADE2 upgrades Basic to Complete (7 new items); the rest exercise each failure reason. */
export const CODES: MockCode[] = [
  { code: 'HDMB-UPGR-ADE2', package_id: 'upgrade_a_b', status: 'baru' },
  { code: 'HDMB-PENU-H234', package_id: 'complete', status: 'baru' },
  { code: 'HDMB-USED-CDE3', package_id: 'complete', status: 'aktif', redeemed_by: 'mock-other', redeemed_at: '2026-11-10T03:00:00+00:00' },
  { code: 'HDMB-BAT9-KAN2', package_id: 'complete', status: 'dibatalkan' },
  { code: 'HDMB-TAMA-TEMP', package_id: 'complete', status: 'baru', expired: true },
];

/** Unclaimed purchase that /api/register accepts (type `012-345 6789`, any email case). */
export const UNCLAIMED_PURCHASE = { email: 'siti@gmail.com', phone: '60123456789', entitlements: BASIC };

export function bootstrapFor(a: MockAccount): Bootstrap {
  return {
    profile: {
      id: a.uid, full_name: a.full_name, email: a.email, phone: a.phone, onboarded_at: a.onboarded_at,
      created_at: '2026-11-13T10:00:00+08:00', ...(a.profile ?? {}),
    },
    roles: a.roles,
    entitlements: a.entitlements,
    batch,
    catalog,
    reading: a.reading ?? [],
  };
}
