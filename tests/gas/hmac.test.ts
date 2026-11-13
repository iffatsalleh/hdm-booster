import { describe, it, expect } from 'vitest';
import { loadGas } from './load';
import { signHmac, signTicket, verifyTicket, verifySigHeader } from '../../worker/src/hmac';

const g = loadGas();
const t = 1_800_000_000;

describe('gasSign', () => {
  it('byte-identical to worker signHmac', async () => {
    for (const body of ['{"a":1}', '', 'Ünïcode ✓ {"x":"ß"}', 'x'.repeat(5000)]) {
      expect(g.gasSign('s', t, body)).toBe(await signHmac('s', t, body));
    }
  });
  it('gasSigHeader verifies in the worker', async () => {
    const h = g.gasSigHeader('s', t, '{"a":1}');
    expect(h).toMatch(/^t=\d+,v1=[0-9a-f]{64}$/);
    expect(await verifySigHeader('s', h, '{"a":1}', t)).toBe(true);
  });
});

describe('tickets', () => {
  it('worker ticket verifies in GAS', async () => {
    const ticket = await signTicket('tk', { ebookId: 'e1', fileId: 'f', uid: 'u' }, t);
    const p = g.gasVerifyTicket('tk', ticket, t + 10);
    expect(p).toMatchObject({ ebookId: 'e1', uid: 'u', exp: t + 300 });
    expect(g.gasVerifyTicket('wrong', ticket, t)).toBeNull();
    expect(g.gasVerifyTicket('tk', ticket, t + 301)).toBeNull();
  });
  it('GAS ticket verifies in worker, and matches worker output', async () => {
    const ticket = g.gasSignTicket('tk', { ebookId: 'e1', fileId: 'f', uid: 'u' }, t);
    expect(ticket).toBe(await signTicket('tk', { ebookId: 'e1', fileId: 'f', uid: 'u' }, t));
    expect(await verifyTicket('tk', ticket, t + 5)).toMatchObject({ uid: 'u', exp: t + 300 });
  });
  it('rejects tampered, malformed, far-future exp', async () => {
    const ticket = await signTicket('tk', { uid: 'u' }, t);
    const [p, m] = ticket.split('.');
    expect(g.gasVerifyTicket('tk', `${p}x.${m}`, t)).toBeNull();
    expect(g.gasVerifyTicket('tk', 'abc', t)).toBeNull();
    expect(g.gasVerifyTicket('tk', ticket, t - 1000)).toBeNull(); // exp > now+300
  });
  it('unicode payload round-trips', async () => {
    const ticket = await signTicket('tk', { uid: 'Ünï✓' }, t);
    expect(g.gasVerifyTicket('tk', ticket, t)).toMatchObject({ uid: 'Ünï✓' });
  });
});
