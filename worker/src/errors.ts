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
} as const;

export type FailStatus = 400 | 401 | 403 | 404 | 429 | 500;

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
