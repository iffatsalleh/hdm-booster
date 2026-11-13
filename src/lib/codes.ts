export const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

/** Normalise an access code to HDMB-XXXX-XXXX, or null if invalid. */
export function normalizeCode(raw: string): string | null {
  if (raw == null) return null;
  let s = String(raw).toUpperCase().replace(/[\s-]+/g, '');
  if (s.startsWith('HDMB')) s = s.slice(4);
  if (s.length !== 8) return null;
  for (const ch of s) if (!CODE_ALPHABET.includes(ch)) return null;
  return `HDMB-${s.slice(0, 4)}-${s.slice(4)}`;
}
