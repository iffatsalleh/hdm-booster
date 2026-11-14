import type { RouteName } from '../router';

const TABS: { href: string; label: string; icon: string; match: RouteName[] }[] = [
  { href: '#/', label: 'Utama', icon: 'house', match: ['home'] },
  { href: '#/rekod', label: 'Rekod', icon: 'note-pencil', match: ['rekod'] },
  { href: '#/ebook', label: 'Ebook', icon: 'books', match: ['ebook', 'ebook_read'] },
  { href: '#/cabaran', label: 'Cabaran', icon: 'trophy', match: ['cabaran'] },
  { href: '#/akaun', label: 'Akaun', icon: 'user-circle', match: ['akaun', 'akaun_kod', 'aktif'] },
];

export function TabBar(p: { active: RouteName }) {
  return (
    <nav class="tabbar" aria-label="Navigasi utama">
      {TABS.map((t) => {
        const on = t.match.includes(p.active);
        return (
          <a key={t.href} class={on ? 'on' : undefined} href={t.href} aria-current={on ? 'page' : undefined}>
            <i class={`${on ? 'ph-fill' : 'ph'} ph-${t.icon}`} aria-hidden="true" />
            {t.label}
          </a>
        );
      })}
    </nav>
  );
}
