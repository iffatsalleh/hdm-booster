// DEV MOCK ONLY (npm run dev:mock). Never imported by a production build.
// Mirrors db/seed.sql: catalogue, Batch Rejab 1448, 7 ebooks, public settings.
import type { Bootstrap, CatalogPackage } from '../state/session';

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
    item_key, number: i + 1, title, description: null, cover_url: null, allow_download: false,
    file_updated_at: null, sort: i + 1,
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
};

/** Unclaimed purchase that /api/register accepts (type `012-345 6789`, any email case). */
export const UNCLAIMED_PURCHASE = { email: 'siti@gmail.com', phone: '60123456789', entitlements: BASIC };

export function bootstrapFor(a: MockAccount): Bootstrap {
  return {
    profile: {
      id: a.uid, full_name: a.full_name, email: a.email, phone: a.phone, onboarded_at: a.onboarded_at,
      created_at: '2026-11-13T10:00:00+08:00',
    },
    roles: a.roles,
    entitlements: a.entitlements,
    batch,
    catalog,
    reading: [],
  };
}
