// HMAC-SHA256 helpers (Web Crypto). Reimplemented in apps-script/Hmac.gs.js — keep the algorithm identical.
//   signature = hex(HMAC_SHA256(secret, `${t}.${body}`))     header: `t=<unix>,v1=<hex>`
//   ticket    = base64url(JSON({...payload, iat})) + '.' + hex(HMAC_SHA256(secret, base64url part))
const enc = new TextEncoder();
const WINDOW_SEC = 300;

async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(message)));
  return Array.from(sig, (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Length-leak-only constant-time string comparison. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function b64urlEncode(text: string): string {
  const bytes = enc.encode(text);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(s: string): string {
  const pad = s.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(pad + '='.repeat((4 - (pad.length % 4)) % 4));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

export function signHmac(secret: string, t: number, body: string): Promise<string> {
  return hmacHex(secret, `${t}.${body}`);
}

export async function verifySigHeader(secret: string, header: string, body: string, nowSec: number): Promise<boolean> {
  const m = /^t=(\d{1,12}),v1=([0-9a-f]{64})$/.exec((header ?? '').trim());
  if (!m) return false;
  const t = Number(m[1]);
  if (Math.abs(nowSec - t) > WINDOW_SEC) return false;
  return safeEqual(await signHmac(secret, t, body), m[2]);
}

export async function signTicket(secret: string, payload: Record<string, unknown>, nowSec: number): Promise<string> {
  const part = b64urlEncode(JSON.stringify({ ...payload, iat: nowSec }));
  return `${part}.${await hmacHex(secret, part)}`;
}

export async function verifyTicket(
  secret: string,
  ticket: string,
  nowSec: number,
): Promise<(Record<string, unknown> & { iat: number }) | null> {
  const parts = (ticket ?? '').split('.');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  if (!safeEqual(await hmacHex(secret, parts[0]), parts[1])) return null;
  try {
    const payload = JSON.parse(b64urlDecode(parts[0]));
    if (typeof payload !== 'object' || payload === null || typeof payload.iat !== 'number') return null;
    if (Math.abs(nowSec - payload.iat) > WINDOW_SEC) return null;
    return payload;
  } catch {
    return null;
  }
}
