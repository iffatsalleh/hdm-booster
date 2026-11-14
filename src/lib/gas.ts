// Apps Script web app: gas<T>(action, payload) — POST text/plain, 30 s timeout, ApiError on failure.
import { config } from './config';
import { createGas } from './http';

export const gas = createGas({ url: config.gasUrl, fetch: (...a) => fetch(...a) });
