// Bottom tab bar items. The Admin tab is UI-only convenience for staff; the Worker enforces roles.
import { STAFF_ROLES, type RouteName } from '../router';

export type Tab = { href: string; label: string; icon: string; match: RouteName[] };

const BASE: Tab[] = [
  { href: '#/', label: 'Utama', icon: 'house', match: ['home'] },
  { href: '#/rekod', label: 'Rekod', icon: 'note-pencil', match: ['rekod'] },
  { href: '#/ebook', label: 'Ebook', icon: 'books', match: ['ebook', 'ebook_read'] },
  { href: '#/cabaran', label: 'Cabaran', icon: 'trophy', match: ['cabaran'] },
  { href: '#/akaun', label: 'Akaun', icon: 'user-circle', match: ['akaun', 'akaun_kod', 'aktif'] },
];
const ADMIN: Tab = { href: '#/admin', label: 'Admin', icon: 'shield-check', match: ['admin'] };

export function tabsFor(roles: string[]): Tab[] {
  return roles.some((r) => STAFF_ROLES.includes(r)) ? [...BASE, ADMIN] : BASE;
}
