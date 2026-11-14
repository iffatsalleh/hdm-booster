// Access-code input handling (unit-tested). The Worker normalises again; we never send a malformed code.
import { normalizeCode } from './codes';

export function prepareCode(raw: string): { ok: true; code: string } | { ok: false; error: string } {
  if (!String(raw ?? '').trim()) return { ok: false, error: 'Sila masukkan kod akses anda.' };
  const code = normalizeCode(raw);
  if (!code) {
    return { ok: false, error: 'Format kod tidak sah. Kod berbentuk HDMB-XXXX-XXXX (huruf dan nombor). Semak semula.' };
  }
  return { ok: true, code };
}

export function redeemSuccessText(items: string[]): string {
  if (!items.length) return 'Kod diterima. Anda sudah memiliki semua akses dalam kod ini.';
  return `Berjaya! ${items.length} item baharu dibuka.`;
}

export function itemNames(keys: string[], catalog: { key: string; name: string }[] | null | undefined): string[] {
  return keys.map((k) => catalog?.find((i) => i.key === k)?.name ?? k);
}
