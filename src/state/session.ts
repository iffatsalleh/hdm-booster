// Session store: Firebase user + GET /api/me (app_bootstrap). Components read it with useSession().
import { useEffect, useState } from 'preact/hooks';
import { api } from '../lib/api';
import { authPort, type AuthUser } from '../lib/firebase';
import { ApiError, bm } from '../lib/errors';
import type { BatchDates } from '../lib/dates';

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  onboarded_at: string | null;
  [k: string]: unknown;
};

export type Batch = {
  id: string;
  name: string;
  status: string;
  sales_open_at: string;
  sales_close_at: string;
  program_start: string;
  program_end: string;
  phases: BatchDates['phases'];
};

export type CatalogItem = { key: string; name: string; kind: string; sort: number };
export type CatalogPackage = { id: string; name: string; price_rm: number; sellable: boolean; items: string[] };
export type CatalogEbook = {
  id: string;
  item_key: string;
  number: number | null;
  title: string;
  description: string | null;
  cover_url: string | null;
  allow_download: boolean;
  file_updated_at: string | null;
  sort: number;
};
export type Catalog = {
  items: CatalogItem[];
  packages: CatalogPackage[];
  ebooks: CatalogEbook[];
  settings: Record<string, unknown>;
};
export type Reading = { user_id: string; ebook_id: string; last_page: number; finished_at: string | null; updated_at: string };

/** Shape of the Worker's GET /api/me data (app_bootstrap without `ok`). */
export type Bootstrap = {
  profile: Profile;
  roles: string[];
  entitlements: string[];
  batch: Batch | null;
  catalog: Catalog;
  reading: Reading[];
};

export type SessionState = {
  status: 'loading' | 'anon' | 'ready' | 'error';
  user: AuthUser | null;
  profile: Profile | null;
  roles: string[];
  entitlements: Set<string>;
  batch: Batch | null;
  catalog: Catalog | null;
  reading: Reading[];
  /** BM message when status === 'error'. */
  error: string | null;
  errorReason: string | null;
};

const EMPTY: Omit<SessionState, 'status' | 'user'> = {
  profile: null,
  roles: [],
  entitlements: new Set(),
  batch: null,
  catalog: null,
  reading: [],
  error: null,
  errorReason: null,
};

let state: SessionState = { status: 'loading', user: null, ...EMPTY };
const subs = new Set<(s: SessionState) => void>();

function set(patch: Partial<SessionState>) {
  state = { ...state, ...patch };
  subs.forEach((f) => f(state));
}

export function getSession(): SessionState {
  return state;
}

export function subscribe(f: (s: SessionState) => void): () => void {
  subs.add(f);
  return () => subs.delete(f);
}

let inflight: { uid: string | undefined; token: object; p: Promise<void> } | null = null;

/** GET /api/me into the store. Concurrent calls for the same user share one request. */
export function refresh(): Promise<void> {
  const uid = state.user?.uid;
  if (inflight && inflight.uid === uid) return inflight.p;
  const token = {};
  const run = async () => {
    try {
      const d = await api<Bootstrap>('GET', '/api/me');
      if (state.user?.uid !== uid) return; // signed out / switched meanwhile
      set({
        status: 'ready',
        profile: d.profile,
        roles: d.roles ?? [],
        entitlements: new Set(d.entitlements ?? []),
        batch: d.batch ?? null,
        catalog: d.catalog ?? null,
        reading: d.reading ?? [],
        error: null,
        errorReason: null,
      });
    } catch (e) {
      if (state.user?.uid !== uid) return;
      set({ status: 'error', error: bm(e), errorReason: e instanceof ApiError ? e.reason : null });
    } finally {
      if (inflight?.token === token) inflight = null;
    }
  };
  const p = run();
  inflight = { uid, token, p };
  return p;
}

/** Resolves once a signed-in user's /api/me has loaded (or failed). */
export function settled(): Promise<SessionState> {
  const done = (s: SessionState) => !!s.user && (s.status === 'ready' || s.status === 'error');
  if (done(state)) return Promise.resolve(state);
  return new Promise((resolve) => {
    const off = subscribe((s) => {
      if (done(s)) {
        off();
        resolve(s);
      }
    });
  });
}

let started = false;

/** Subscribe to Firebase auth once; every sign-in loads /api/me. */
export function startSession() {
  if (started) return;
  started = true;
  authPort()
    .then((p) =>
      p.onChange((u) => {
        if (!u) {
          set({ status: 'anon', user: null, ...EMPTY });
          return;
        }
        if (state.user?.uid === u.uid && state.status !== 'anon') return;
        set({ status: 'loading', user: u, ...EMPTY });
        void refresh();
      }),
    )
    .catch((e) => set({ status: 'error', error: bm(e), errorReason: null }));
}

export async function signIn(email: string, password: string) {
  const p = await authPort();
  await p.signIn(email.trim().toLowerCase(), password);
}

export async function signOut() {
  const p = await authPort();
  await p.signOut();
}

export async function resetPassword(email: string) {
  const p = await authPort();
  await p.resetPassword(email.trim().toLowerCase());
}

export function useSession(): SessionState {
  const [s, setS] = useState(state);
  useEffect(() => {
    setS(state);
    return subscribe(setS);
  }, []);
  return s;
}

/** Public app setting (jsonb value) as a string, with a fallback. */
export function setting(s: SessionState, key: string, fallback = ''): string {
  const v = s.catalog?.settings?.[key];
  return typeof v === 'string' ? v : v == null ? fallback : String(v);
}
