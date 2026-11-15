import type { RouteName } from '../router';
import { tabsFor } from '../lib/nav';
import { useSession } from '../state/session';

export function TabBar(p: { active: RouteName }) {
  const tabs = tabsFor(useSession().roles);
  return (
    <nav class="tabbar" aria-label="Navigasi utama" style={`--tabs:${tabs.length}`}>
      {tabs.map((t) => {
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
