import { describe, it, expect, vi } from 'vitest';
import { createApi, createGas } from '../../src/lib/http';
import { ApiError } from '../../src/lib/errors';

type Call = { url: string; init: RequestInit };

/** Resolves to the rejection (typed), fails the test if the promise resolves. */
const failure = (p: Promise<unknown>): Promise<ApiError> =>
  p.then(
    () => { throw new Error('expected a rejection'); },
    (x: unknown) => x as ApiError,
  );

function res(status: number, body: unknown): Response {
  return new Response(typeof body === 'string' ? body : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function setup(responses: Response[], tokens: (string | null)[] = ['t1', 't2']) {
  const calls: Call[] = [];
  const fetchFn = vi.fn(async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    const r = responses.shift();
    if (!r) throw new Error('no more responses');
    return r;
  });
  const forced: boolean[] = [];
  const getToken = vi.fn(async (force?: boolean) => {
    forced.push(!!force);
    return force ? tokens[1] : tokens[0];
  });
  const api = createApi({ baseUrl: 'https://w.example', fetch: fetchFn as unknown as typeof fetch, getToken, timeoutMs: 50 });
  return { api, calls, forced };
}

describe('createApi', () => {
  it('sends JSON with the bearer token and unwraps data', async () => {
    const { api, calls } = setup([res(200, { ok: true, data: { x: 1 } })]);
    await expect(api('POST', '/api/register', { a: 1 })).resolves.toEqual({ x: 1 });
    expect(calls[0].url).toBe('https://w.example/api/register');
    const h = calls[0].init.headers as Record<string, string>;
    expect(h.Authorization).toBe('Bearer t1');
    expect(h['Content-Type']).toBe('application/json');
    expect(calls[0].init.body).toBe('{"a":1}');
    expect(calls[0].init.method).toBe('POST');
  });

  it('omits Authorization when signed out and body on GET', async () => {
    const { api, calls } = setup([res(200, { ok: true, data: 1 })], [null, null]);
    await api('GET', '/api/me');
    const h = calls[0].init.headers as Record<string, string>;
    expect(h.Authorization).toBeUndefined();
    expect(calls[0].init.body).toBeUndefined();
  });

  it('throws ApiError(reason, message, status) on {ok:false}', async () => {
    const { api } = setup([res(400, { ok: false, reason: 'tiada_pembelian', message: 'Tiada.' })]);
    const e = await failure(api('POST', '/api/register', {}));
    expect(e).toBeInstanceOf(ApiError);
    expect([e.reason, e.message, e.status]).toEqual(['tiada_pembelian', 'Tiada.', 400]);
  });

  it('on 401 forces one token refresh and retries once', async () => {
    const { api, calls, forced } = setup([
      res(401, { ok: false, reason: 'perlu_log_masuk', message: 'Sila log masuk semula.' }),
      res(200, { ok: true, data: 'ok' }),
    ]);
    await expect(api('GET', '/api/me')).resolves.toBe('ok');
    expect(forced).toEqual([false, true]);
    expect((calls[1].init.headers as Record<string, string>).Authorization).toBe('Bearer t2');
  });

  it('second 401 is thrown (no loop)', async () => {
    const r401 = () => res(401, { ok: false, reason: 'perlu_log_masuk', message: 'Sila log masuk semula.' });
    const { api, calls } = setup([r401(), r401()]);
    const e = await failure(api('GET', '/api/me'));
    expect(e.reason).toBe('perlu_log_masuk');
    expect(calls).toHaveLength(2);
  });

  it('non-JSON error body -> ralat_pelayan', async () => {
    const { api } = setup([new Response('<html>502</html>', { status: 502 })]);
    const e = await failure(api('GET', '/api/me'));
    expect([e.reason, e.status]).toEqual(['ralat_pelayan', 502]);
  });

  it('network failure -> rangkaian', async () => {
    const api = createApi({
      baseUrl: '',
      fetch: (async () => { throw new TypeError('Failed to fetch'); }) as unknown as typeof fetch,
      getToken: async () => null,
    });
    const e = await failure(api('GET', '/api/me'));
    expect(e.reason).toBe('rangkaian');
  });

  it('times out -> masa_tamat', async () => {
    const hang = ((_u: string, init: RequestInit) =>
      new Promise((_r, rej) => init.signal!.addEventListener('abort', () => rej(new DOMException('x', 'AbortError'))))) as unknown as typeof fetch;
    const api = createApi({ baseUrl: '', fetch: hang, getToken: async () => null, timeoutMs: 20 });
    const e = await failure(api('GET', '/api/me'));
    expect(e.reason).toBe('masa_tamat');
  });
});

describe('createGas', () => {
  it('POSTs text/plain JSON {action, ...payload} and unwraps data', async () => {
    const calls: Call[] = [];
    const gas = createGas({
      url: 'https://gas.example/exec',
      fetch: (async (url: string, init: RequestInit) => {
        calls.push({ url, init });
        return res(200, { ok: true, data: { n: 2 } });
      }) as unknown as typeof fetch,
    });
    await expect(gas('ebook', { ticket: 't' })).resolves.toEqual({ n: 2 });
    expect(calls[0].url).toBe('https://gas.example/exec');
    expect((calls[0].init.headers as Record<string, string>)['Content-Type']).toBe('text/plain;charset=utf-8');
    expect(JSON.parse(String(calls[0].init.body))).toEqual({ action: 'ebook', ticket: 't' });
  });

  it('throws ApiError on {ok:false}', async () => {
    const gas = createGas({
      url: 'u',
      fetch: (async () => res(200, { ok: false, reason: 'tiket_tamat' })) as unknown as typeof fetch,
    });
    const e = await failure(gas('ebook', {}));
    expect(e).toBeInstanceOf(ApiError);
    expect(e.reason).toBe('tiket_tamat');
  });
});
