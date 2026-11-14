// Worker API: api<T>(method, path, body?) — Firebase ID token attached, 20 s timeout, ApiError on failure,
// one forced token refresh + retry on 401. Mock mode (VITE_MOCK=1) answers from src/mock/api.ts.
import { config } from './config';
import { authPort } from './firebase';
import { createApi, type ApiFn, type Method } from './http';

const real: ApiFn = createApi({
  baseUrl: config.apiUrl,
  fetch: (...a) => fetch(...a),
  getToken: async (force) => (await authPort()).getIdToken(force),
});

export async function api<T>(method: Method, path: string, body?: unknown): Promise<T> {
  if (import.meta.env.VITE_MOCK === '1') {
    const m = await import('../mock/api');
    return m.mockApi<T>(method, path, body);
  }
  return real<T>(method, path, body);
}

export type { Method };
