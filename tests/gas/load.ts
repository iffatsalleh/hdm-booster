import { readFileSync } from 'node:fs';
import { createHmac } from 'node:crypto';
import vm from 'node:vm';
import { resolve } from 'node:path';

const GAS_DIR = resolve(__dirname, '../../apps-script');

/** Mimics Utilities.computeHmacSha256Signature: returns SIGNED bytes (-128..127), like Apps Script. */
function makeUtilities() {
  return {
    computeHmacSha256Signature(message: string, key: string): number[] {
      return Array.from(createHmac('sha256', key).update(message, 'utf8').digest(), (b) => (b > 127 ? b - 256 : b));
    },
    /** Apps Script keeps '=' padding in web-safe base64. Accepts string (UTF-8) or byte array (signed). */
    base64EncodeWebSafe(data: string | number[]): string {
      const buf = typeof data === 'string' ? Buffer.from(data, 'utf8') : Buffer.from(data.map((b) => b & 255));
      return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
    },
    base64DecodeWebSafe(s: string): number[] {
      return Array.from(Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64'), (b) => (b > 127 ? b - 256 : b));
    },
    newBlob(bytes: number[]) {
      return { getDataAsString: () => Buffer.from(bytes.map((b) => b & 255)).toString('utf8') };
    },
  };
}

/** Load pure GAS files (Hmac, BclLogic) into one vm context and return its globals. */
export function loadGas(files: string[] = ['Hmac.gs.js', 'BclLogic.gs.js']): Record<string, any> {
  const ctx = vm.createContext({ Utilities: makeUtilities(), JSON, Math, Number, String, Object, Array, RegExp, parseFloat, isNaN });
  for (const f of files) vm.runInContext(readFileSync(resolve(GAS_DIR, f), 'utf8').replace(/^\uFEFF/, ''), ctx, { filename: f });
  return ctx as Record<string, any>;
}

export function fixture<T = any>(name: string): T {
  return JSON.parse(readFileSync(resolve(__dirname, 'fixtures', name), 'utf8').replace(/^\uFEFF/, ''));
}

