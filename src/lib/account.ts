// Account page helpers (unit-tested).

export function pdpaDeleteText(name: string | null | undefined, email: string | null | undefined): string {
  return `Salam, saya ingin memohon supaya akaun dan data peribadi saya dalam HDM BOOSTER dipadam (PDPA).\n` +
    `Nama: ${name ?? '-'}\nEmel pendaftaran: ${email ?? '-'}`;
}

export type PwErrors = Partial<Record<'current' | 'next' | 'confirm', string>>;

export function validatePasswordChange(current: string, next: string, confirm: string): PwErrors {
  if (!current) return { current: 'Sila masukkan kata laluan semasa.' };
  const e: PwErrors = {};
  if (next.length < 8) e.next = 'Kata laluan baharu mesti sekurang-kurangnya 8 aksara.';
  else if (next === current) e.next = 'Kata laluan baharu mesti berbeza daripada kata laluan semasa.';
  if (!e.next && confirm !== next) e.confirm = 'Kata laluan tidak sama. Taip semula kata laluan baharu.';
  return e;
}

const WRONG_CURRENT = new Set(['auth/invalid-credential', 'auth/invalid-login-credentials', 'auth/wrong-password']);

/** Firebase reauthenticate/updatePassword error -> which field + BM message (null field = whole form). */
export function passwordChangeError(e: unknown): { field: 'current' | 'next' | null; message: string } | null {
  const code = (e as { code?: unknown })?.code;
  if (typeof code !== 'string') return null;
  if (WRONG_CURRENT.has(code)) return { field: 'current', message: 'Kata laluan semasa salah. Cuba lagi atau tekan Lupa kata laluan.' };
  if (code === 'auth/weak-password') return { field: 'next', message: 'Kata laluan baharu terlalu lemah. Guna sekurang-kurangnya 8 aksara.' };
  if (code === 'auth/requires-recent-login' || code === 'auth/user-mismatch' || code === 'auth/user-token-expired') {
    return { field: null, message: 'Sesi anda telah tamat. Sila log keluar, log masuk semula dan cuba lagi.' };
  }
  if (code === 'auth/too-many-requests') return { field: null, message: 'Terlalu banyak cubaan. Cuba lagi selepas beberapa minit.' };
  return null;
}
