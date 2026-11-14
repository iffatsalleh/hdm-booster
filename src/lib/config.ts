// Runtime configuration. On Blogspot the template sets `window.HDM_CONFIG` (public values only);
// in local development the Vite env (.env / .env.mock) is used instead.
export type HdmConfig = {
  firebase: { apiKey: string; authDomain: string; projectId: string };
  apiUrl: string;
  gasUrl: string;
};

type Partial2 = {
  firebase?: Partial<HdmConfig['firebase']>;
  apiUrl?: string;
  gasUrl?: string;
};
type EnvLike = Record<string, unknown>;

const s = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');
const noSlash = (u: string): string => u.replace(/\/+$/, '');

/** `window.HDM_CONFIG ?? import.meta.env` — the window object wins as a whole (never merged with env). */
export function resolveConfig(win: unknown, env: EnvLike): HdmConfig {
  const w = (win as { HDM_CONFIG?: Partial2 } | undefined)?.HDM_CONFIG;
  if (w && typeof w === 'object') {
    return {
      firebase: { apiKey: s(w.firebase?.apiKey), authDomain: s(w.firebase?.authDomain), projectId: s(w.firebase?.projectId) },
      apiUrl: noSlash(s(w.apiUrl)),
      gasUrl: s(w.gasUrl),
    };
  }
  return {
    firebase: {
      apiKey: s(env.VITE_FIREBASE_API_KEY),
      authDomain: s(env.VITE_FIREBASE_AUTH_DOMAIN),
      projectId: s(env.VITE_FIREBASE_PROJECT_ID),
    },
    apiUrl: noSlash(s(env.VITE_API_URL)),
    gasUrl: s(env.VITE_GAS_URL),
  };
}

export const config: HdmConfig = resolveConfig(
  typeof window !== 'undefined' ? window : undefined,
  import.meta.env as unknown as EnvLike,
);

/** Fallback support number when app settings are not loaded yet (e.g. on the login screen). */
export const DEFAULT_SUPPORT_WA = '60134417042';
/** Label shown on the public auth screens (no batch data is available before login). */
export const PUBLIC_BATCH_LABEL = 'Batch Rejab 1448';
