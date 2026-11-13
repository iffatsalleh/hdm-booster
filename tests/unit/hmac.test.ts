import { describe, test, expect } from 'vitest';
import { signHmac, verifySigHeader, signTicket, verifyTicket } from '../../worker/src/hmac';

describe('hmac', () => {
  const t = 1_800_000_000;

  test('signature header verifies within 300s window only', async () => {
    const h = `t=${t},v1=${await signHmac('s', t, '{"a":1}')}`;
    expect(await verifySigHeader('s', h, '{"a":1}', t + 299)).toBe(true);
    expect(await verifySigHeader('s', h, '{"a":1}', t + 301)).toBe(false);
    expect(await verifySigHeader('s', h, '{"a":2}', t)).toBe(false);
    expect(await verifySigHeader('other', h, '{"a":1}', t)).toBe(false);
  });

  test('malformed headers are rejected', async () => {
    expect(await verifySigHeader('s', '', '{}', t)).toBe(false);
    expect(await verifySigHeader('s', 'garbage', '{}', t)).toBe(false);
    expect(await verifySigHeader('s', `t=abc,v1=00`, '{}', t)).toBe(false);
  });

  test('tickets verify, expire and resist tampering', async () => {
    const tk = await signTicket('k', { ebookId: 'e', fileId: 'f', uid: 'u' }, t);
    expect(await verifyTicket('k', tk, t + 10)).toMatchObject({ ebookId: 'e', uid: 'u' });
    expect(await verifyTicket('k', tk, t + 301)).toBeNull();
    expect(await verifyTicket('k', tk.slice(0, -2) + 'xx', t)).toBeNull();
    expect(await verifyTicket('wrong', tk, t)).toBeNull();
    expect(await verifyTicket('k', 'nonsense', t)).toBeNull();
  });

  test('ticket format: base64url payload with exp = now+300 and base64url MAC', async () => {
    const tk = await signTicket('k', { ebookId: 'e', fileId: 'f', uid: 'u' }, t);
    const [p, mac] = tk.split('.');
    expect(tk).toMatch(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
    expect(JSON.parse(atob(p.replace(/-/g, '+').replace(/_/g, '/')))).toEqual({ ebookId: 'e', fileId: 'f', uid: 'u', exp: t + 300 });
    expect(mac.length).toBe(43);
    expect(await verifyTicket('k', tk, t + 300)).not.toBeNull();
  });

  test('ticket with exp too far in the future is rejected', async () => {
    const tk = await signTicket('k', { uid: 'u' }, t + 1000);
    expect(await verifyTicket('k', tk, t)).toBeNull();
    expect(await verifyTicket('k', tk, t + 1000)).not.toBeNull();
  });
});
