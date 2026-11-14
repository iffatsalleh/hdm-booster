// Participant shell (mockup `.phone`): topbar (wordmark + avatar) or titlebar (back + title), page body, tab bar.
import type { ComponentChildren } from 'preact';
import type { RouteName } from '../router';
import { useSession } from '../state/session';
import { initials } from '../lib/home';
import { TabBar } from './TabBar';

type Props = {
  route: RouteName;
  /** Shows a titlebar with a back button instead of the wordmark topbar. */
  title?: string;
  /** Small line under the title (titlebar only). */
  subtitle?: string;
  back?: string;
  tabs?: boolean;
  children: ComponentChildren;
};

export function Layout(p: Props) {
  const s = useSession();
  const tabs = p.tabs ?? true;
  return (
    <div class={'phone' + (tabs ? '' : ' no-tabs')}>
      {p.title ? (
        <header class="titlebar">
          <a class="back" href={p.back ?? '#/'} aria-label="Kembali"><i class="ph-bold ph-caret-left" aria-hidden="true" /></a>
          <div><h1>{p.title}</h1>{p.subtitle ? <p class="tiny muted">{p.subtitle}</p> : null}</div>
        </header>
      ) : (
        <header class="topbar">
          <a href="#/" style="color:inherit" aria-label="Utama"><span class="wordmark">HDM <b>BOOSTER</b></span></a>
          <a href="#/akaun" class="avatar" aria-label="Akaun">{initials(s.profile?.full_name)}</a>
        </header>
      )}
      <main class="page">{p.children}</main>
      {tabs ? <TabBar active={p.route} /> : null}
    </div>
  );
}
