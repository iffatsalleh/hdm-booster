// Hash router: pure parse + guard (unit-tested) and a tiny hook for the current route.
import { useEffect, useState } from 'preact/hooks';

export type RouteName =
  | 'home' | 'masuk' | 'daftar' | 'lupa' | 'onboarding' | 'ebook' | 'ebook_read' | 'tdee' | 'group'
  | 'akaun' | 'akaun_kod' | 'aktif' | 'bantuan' | 'rekod' | 'cabaran' | 'admin' | 'tiada';

export type Route = { name: RouteName; params: Record<string, string>; path: string };

const TABLE: [RouteName, RegExp, string[]][] = [
  ['home', /^\/$/, []],
  ['masuk', /^\/masuk$/, []],
  ['daftar', /^\/daftar$/, []],
  ['lupa', /^\/lupa$/, []],
  ['onboarding', /^\/onboarding$/, []],
  ['ebook', /^\/ebook$/, []],
  ['ebook_read', /^\/ebook\/([^/]+)$/, ['id']],
  ['tdee', /^\/tdee$/, []],
  ['group', /^\/group$/, []],
  ['akaun', /^\/akaun$/, []],
  ['akaun_kod', /^\/akaun\/kod$/, []],
  ['aktif', /^\/aktif$/, []],
  ['bantuan', /^\/bantuan$/, []],
  ['rekod', /^\/rekod$/, []],
  ['cabaran', /^\/cabaran$/, []],
  ['admin', /^\/admin(?:\/(.*))?$/, ['rest']],
];

export const PUBLIC_ROUTES: ReadonlySet<RouteName> = new Set(['masuk', 'daftar', 'lupa']);
export const STAFF_ROLES = ['superadmin', 'coach'];

const safeDecode = (s: string) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};

export function parseHash(hash: string): Route {
  let p = hash.replace(/^#/, '').split('?')[0];
  if (!p.startsWith('/')) p = '/' + p;
  if (p.length > 1) p = p.replace(/\/+$/, '');
  for (const [name, re, keys] of TABLE) {
    const m = re.exec(p);
    if (!m) continue;
    const params: Record<string, string> = {};
    keys.forEach((k, i) => {
      if (m[i + 1] !== undefined) params[k] = safeDecode(m[i + 1]);
    });
    return { name, params, path: p };
  }
  return { name: 'tiada', params: {}, path: p };
}

export type GuardState = {
  status: 'loading' | 'anon' | 'ready' | 'error';
  onboarded: boolean;
  roles: string[];
};

/** Where to redirect for this route, or null to render it. */
export function guard(route: Route, s: GuardState): string | null {
  if (s.status === 'loading' || s.status === 'error') return null;
  const pub = PUBLIC_ROUTES.has(route.name);
  if (s.status === 'anon') return pub ? null : '#/masuk';
  if (!s.onboarded) return route.name === 'onboarding' ? null : '#/onboarding';
  if (pub) return '#/';
  if (route.name === 'admin' && !s.roles.some((r) => STAFF_ROLES.includes(r))) return '#/';
  return null;
}

export function navigate(to: string, replace = false) {
  if (location.hash === to) return;
  if (replace) location.replace(to);
  else location.hash = to;
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseHash(location.hash));
  useEffect(() => {
    const on = () => {
      setRoute(parseHash(location.hash));
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}
