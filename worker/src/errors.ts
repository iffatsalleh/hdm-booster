import type { Context } from 'hono';

export type ErrorBody = { ok: false; reason: string; message: string };

export const MSG = {
  perlu_log_masuk: 'Sila log masuk semula.',
  tiada_profil: 'Akaun ini belum didaftarkan. Sila daftar di halaman Daftar.',
  tiada_kebenaran: 'Anda tidak mempunyai kebenaran untuk tindakan ini.',
  tiada: 'Halaman atau tindakan tidak dijumpai.',
  ralat_pelayan: 'Ralat pada pelayan. Sila cuba lagi sebentar lagi.',
  data_tidak_sah: 'Maklumat tidak lengkap atau tidak sah. Semak semula dan cuba lagi.',
  // redeem
  tidak_sah: 'Kod tidak sah. Semak semula kod anda.',
  sudah_digunakan: 'Kod ini telah digunakan.',
  dibatalkan: 'Kod ini telah dibatalkan, sila hubungi admin.',
  tamat_tempoh: 'Kod ini telah tamat tempoh, sila hubungi admin.',
  terlalu_banyak_cubaan: 'Terlalu banyak cubaan. Cuba lagi selepas 15 minit.',
  // content
  tiada_akses: 'Ebook ini tersedia dalam Pakej Complete.',
  tiada_akses_tdee: 'Kalkulator TDEE tiada dalam akses anda. Aktifkan pakej anda atau hubungi admin.',
  tiada_fail: 'Fail ebook ini belum tersedia. Sila cuba lagi kemudian.',
  // register
  tiada_pembelian: 'Emel/telefon ini tiada rekod pembelian. Pastikan sama seperti semasa beli di BCL, atau WhatsApp 60134417042.',
  sudah_didaftar: 'Emel ini sudah ada akaun. Sila log masuk atau tekan Lupa Kata Laluan.',
  sedang_didaftar: 'Pendaftaran untuk emel ini sedang diproses. Tunggu sebentar, kemudian cuba log masuk.',
  terlalu_besar:'Data yang dihantar terlalu besar.',
  // admin (reasons raised by the SQL admin functions)
  pengguna_tidak_wujud: 'Peserta tidak dijumpai.',
  item_tidak_sah: 'Item tidak sah.',
  pakej_tidak_wujud: 'Pakej tidak dijumpai.',
  tindakan_tidak_sah: 'Tindakan tidak sah.',
  kod_tidak_wujud: 'Kod tidak dijumpai.',
  kod_belum_digunakan: 'Kod ini belum digunakan.',
  pembelian_tidak_wujud: 'Pembelian tidak dijumpai.',
  geran_tidak_wujud: 'Akses manual tidak dijumpai.',
  geran_sudah_ditarik: 'Akses manual ini sudah ditarik balik.',
  bilangan_tidak_sah: 'Bilangan kod mesti antara 1 dan 500.',
  gagal_jana_kod: 'Gagal menjana kod. Sila cuba lagi.',
  tiada_jadual: 'Jadual tidak dikenali.',
  gas_gagal: 'Apps Script tidak dapat dihubungi. Sila cuba lagi sebentar lagi.',
  emel_tidak_sah: 'Emel tidak sah. Semak semula emel pembeli.',
  telefon_tidak_sah: 'Nombor telefon tidak sah. Guna nombor telefon bimbit Malaysia, contoh 0123456789.',
  batch_tidak_wujud: 'Batch tidak dijumpai. Pilih batch daripada senarai.',
  nama_diperlukan: 'Sila isi nama pembeli.',
  jumlah_tidak_sah: 'Jumlah RM tidak sah. Contoh: 97 atau 97.50.',
  order_tidak_sah: 'Nombor order tidak sah.',
} as const;

export type FailStatus = 400 | 401 | 403 | 404 | 409 | 413 | 429 | 500 | 502;

/** Reasons raised (`raise exception '<reason>'`) by SQL admin functions that are the caller's fault (400). */
const SQL_REASONS = [
  'pengguna_tidak_wujud', 'item_tidak_sah', 'pakej_tidak_wujud', 'tindakan_tidak_sah', 'kod_tidak_wujud',
  'kod_belum_digunakan', 'pembelian_tidak_wujud', 'geran_tidak_wujud', 'geran_sudah_ditarik', 'bilangan_tidak_sah',
  'emel_tidak_sah', 'telefon_tidak_sah', 'batch_tidak_wujud', 'nama_diperlukan', 'jumlah_tidak_sah',
] as const;

/** SQLSTATE of a pg error (`.code`) or of a HornetHive REST error (`hive: msg [CODE] ...`). */
function sqlState(e: unknown): string | null {
  const code = (e as { code?: unknown })?.code;
  if (typeof code === 'string' && /^[0-9A-Z]{5}$/.test(code)) return code;
  const m = /\[([0-9A-Z]{5})\]/.exec(e instanceof Error ? e.message : String(e));
  return m ? m[1] : null;
}

/**
 * Maps a DB error to a client response: role refusal -> 403, known SQL reasons -> 400 with that reason,
 * constraint / bad-value errors (SQLSTATE 22xxx, 23xxx) -> 400 data_tidak_sah. Anything else is rethrown (500).
 */
export function dbFail(c: Context, e: unknown) {
  const msg = e instanceof Error ? e.message : String(e);
  if (/\btiada_kebenaran\b/.test(msg)) return fail(c, 403, 'tiada_kebenaran');
  const reason = SQL_REASONS.find((r) => new RegExp(`\\b${r}\\b`).test(msg));
  if (reason) return fail(c, 400, reason);
  const st = sqlState(e);
  if (st && (st.startsWith('22') || st.startsWith('23'))) return fail(c, 400, 'data_tidak_sah');
  throw e;
}

export function fail(c: Context, status: FailStatus, reason: string, message?: string) {
  const msg = message ?? (MSG as Record<string, string>)[reason] ?? MSG.ralat_pelayan;
  return c.json({ ok: false, reason, message: msg } satisfies ErrorBody, status);
}

export function ok<T>(c: Context, data: T) {
  return c.json({ ok: true, data });
}

/** Parsed JSON object body, or null when missing/malformed/not an object. */
export async function readBody(c: Context): Promise<Record<string, unknown> | null> {
  try {
    const v = await c.req.json();
    return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
