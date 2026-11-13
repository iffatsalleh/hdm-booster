import type { Context } from 'hono';

export type ErrorBody = { ok: false; reason: string; message: string };

export const MSG = {
  perlu_log_masuk: 'Sila log masuk semula.',
  tiada_profil: 'Akaun ini belum didaftarkan. Sila daftar di halaman Daftar.',
  tiada_kebenaran: 'Anda tidak mempunyai kebenaran untuk tindakan ini.',
  tiada: 'Halaman atau tindakan tidak dijumpai.',
  ralat_pelayan: 'Ralat pada pelayan. Sila cuba lagi sebentar lagi.',
} as const;

export function fail(c: Context, status: 401 | 403 | 404 | 500 | 400, reason: string, message?: string) {
  const msg = message ?? (MSG as Record<string, string>)[reason] ?? MSG.ralat_pelayan;
  return c.json({ ok: false, reason, message: msg } satisfies ErrorBody, status);
}

export function ok<T>(c: Context, data: T) {
  return c.json({ ok: true, data });
}
