/** Normalise a Malaysian mobile number to "60…" digits, or null if invalid. */
export function normalizePhone(raw: string): string | null {
  if (raw == null) return null;
  let d = String(raw).replace(/\D/g, '');
  if (!d) return null;
  if (d.startsWith('60')) {
    // keep
  } else if (d.startsWith('0')) {
    d = '60' + d.slice(1);
  } else if (d.startsWith('1')) {
    d = '60' + d;
  } else {
    return null;
  }
  return /^601\d{8,9}$/.test(d) ? d : null;
}

export function normalizeEmail(raw: string): string {
  return String(raw ?? '').trim().toLowerCase();
}
