import { normalizePhone } from './phone';

export function waLink(phone: string, text: string): string {
  const num = normalizePhone(phone) ?? String(phone).replace(/\D/g, '');
  return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
}

/** Replace {key} placeholders; unknown placeholders are left untouched. */
export function fillTemplate(tpl: string, vars: Record<string, string>): string {
  return tpl.replace(/\{(\w+)\}/g, (m, k) => (Object.prototype.hasOwnProperty.call(vars, k) ? vars[k] : m));
}
