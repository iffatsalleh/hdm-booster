// Apps Script web app: gas<T>(action, payload) — POST text/plain, 30 s timeout, ApiError on failure.
// Mock mode (VITE_MOCK=1) answers from src/mock/gas.ts.
import { config } from './config';
import { createGas } from './http';

const real = createGas({ url: config.gasUrl, fetch: (...a) => fetch(...a) });

export async function gas<T>(action: string, payload: Record<string, unknown>): Promise<T> {
  if (import.meta.env.VITE_MOCK === '1') {
    const m = await import('../mock/gas');
    return m.mockGas<T>(action, payload);
  }
  return real<T>(action, payload);
}
