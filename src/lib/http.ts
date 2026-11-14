// Transport for the Worker API and the Apps Script web app. Pure factories (no globals) so they are unit-tested;
// src/lib/api.ts and src/lib/gas.ts wire them to the real config / auth.
import { ApiError } from './errors';

export type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type ApiFn = <T>(method: Method, path: string, body?: unknown) => Promise<T>;

type Envelope = { ok?: boolean; data?: unknown; reason?: unknown; message?: unknown };

async function timedFetch(f: typeof fetch, url: string, init: RequestInit, ms: number): Promise<Response> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), ms);
  try {
    return await f(url, { ...init, signal: ctl.signal });
  } catch (e) {
    if (ctl.signal.aborted || (e as { name?: string })?.name === 'AbortError') throw new ApiError('masa_tamat');
    throw new ApiError('rangkaian');
  } finally {
    clearTimeout(timer);
  }
}

async function unwrap<T>(r: Response): Promise<T> {
  let j: Envelope | null = null;
  try {
    j = (await r.json()) as Envelope;
  } catch {
    j = null;
  }
  if (j && j.ok === true && r.ok) return j.data as T;
  if (j && typeof j.reason === 'string') {
    throw new ApiError(j.reason, typeof j.message === 'string' ? j.message : '', r.status);
  }
  throw new ApiError('ralat_pelayan', '', r.status);
}

export function createApi(deps: {
  baseUrl: string;
  fetch: typeof fetch;
  getToken: (force?: boolean) => Promise<string | null>;
  timeoutMs?: number;
}): ApiFn {
  const ms = deps.timeoutMs ?? 20_000;
  const send = async (method: Method, path: string, body: unknown, force: boolean) => {
    const token = await deps.getToken(force);
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    return timedFetch(
      deps.fetch,
      deps.baseUrl + path,
      { method, headers, body: body === undefined ? undefined : JSON.stringify(body) },
      ms,
    );
  };
  return async <T>(method: Method, path: string, body?: unknown): Promise<T> => {
    let r = await send(method, path, body, false);
    if (r.status === 401) r = await send(method, path, body, true); // one forced refresh, one retry
    return unwrap<T>(r);
  };
}

/** Apps Script: `POST text/plain` (no CORS preflight), body `{action, ...payload}`. */
export function createGas(deps: { url: string; fetch: typeof fetch; timeoutMs?: number }) {
  const ms = deps.timeoutMs ?? 30_000;
  return async <T>(action: string, payload: Record<string, unknown>): Promise<T> => {
    const r = await timedFetch(
      deps.fetch,
      deps.url,
      {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action, ...payload }),
        redirect: 'follow',
      },
      ms,
    );
    return unwrap<T>(r);
  };
}
