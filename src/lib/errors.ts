// Every error shown to a participant goes through bm(): Worker message first, then reason / Firebase code maps.

export class ApiError extends Error {
  reason: string;
  status: number;
  constructor(reason: string, message = '', status = 0) {
    super(message);
    this.name = 'ApiError';
    this.reason = reason;
    this.status = status;
  }
}

const NETWORK = 'Tiada sambungan internet. Cuba lagi sebentar.';
const GENERIC = 'Ralat tidak dijangka. Sila cuba lagi sebentar.';
const WRONG_LOGIN = 'Emel atau kata laluan salah.';

/** Mirrors worker/src/errors.ts MSG for the reasons a participant can meet, plus client-side reasons. */
const REASONS: Record<string, string> = {
  perlu_log_masuk: 'Sila log masuk semula.',
  tiada_profil: 'Akaun ini belum didaftarkan. Sila daftar di halaman Daftar.',
  tiada_kebenaran: 'Anda tidak mempunyai kebenaran untuk tindakan ini.',
  tiada: 'Halaman atau tindakan tidak dijumpai.',
  ralat_pelayan: 'Ralat pada pelayan. Sila cuba lagi sebentar lagi.',
  data_tidak_sah: 'Maklumat tidak lengkap atau tidak sah. Semak semula dan cuba lagi.',
  tidak_sah: 'Kod tidak sah. Semak semula kod anda.',
  sudah_digunakan: 'Kod ini telah digunakan.',
  dibatalkan: 'Kod ini telah dibatalkan, sila hubungi admin.',
  tamat_tempoh: 'Kod ini telah tamat tempoh, sila hubungi admin.',
  terlalu_banyak_cubaan: 'Terlalu banyak cubaan. Cuba lagi selepas 15 minit.',
  tiada_akses: 'Ebook ini tersedia dalam Pakej Complete.',
  tiada_fail: 'Fail ebook ini belum tersedia. Sila cuba lagi kemudian.',
  tiada_pembelian:
    'Emel/telefon ini tiada rekod pembelian. Pastikan sama seperti semasa beli di BCL, atau WhatsApp 60134417042.',
  sudah_didaftar: 'Emel ini sudah ada akaun. Sila log masuk atau tekan Lupa Kata Laluan.',
  sedang_didaftar: 'Pendaftaran untuk emel ini sedang diproses. Tunggu sebentar, kemudian cuba log masuk.',
  terlalu_besar: 'Data yang dihantar terlalu besar.',
  rangkaian: NETWORK,
  masa_tamat: 'Sambungan terlalu perlahan. Cuba lagi sebentar.',
};

const FIREBASE: Record<string, string> = {
  'auth/invalid-credential': WRONG_LOGIN,
  'auth/invalid-login-credentials': WRONG_LOGIN,
  'auth/wrong-password': WRONG_LOGIN,
  'auth/user-not-found': WRONG_LOGIN,
  'auth/invalid-email': 'Emel tidak sah.',
  'auth/missing-email': 'Sila masukkan emel.',
  'auth/missing-password': 'Sila masukkan kata laluan.',
  'auth/user-disabled': 'Akaun ini telah dinyahaktifkan. Sila hubungi admin.',
  'auth/too-many-requests': 'Terlalu banyak cubaan. Cuba lagi selepas beberapa minit.',
  'auth/network-request-failed': NETWORK,
  'auth/user-token-expired': 'Sila log masuk semula.',
};

export function bm(e: unknown): string {
  if (e instanceof ApiError && e.message) return e.message;
  const o = (e && typeof e === 'object' ? e : {}) as { reason?: unknown; code?: unknown; message?: unknown };
  if (typeof o.reason === 'string' && REASONS[o.reason]) return REASONS[o.reason];
  if (typeof o.code === 'string' && FIREBASE[o.code]) return FIREBASE[o.code];
  if (e instanceof TypeError && /fetch|network/i.test(String(o.message))) return NETWORK;
  return GENERIC;
}
