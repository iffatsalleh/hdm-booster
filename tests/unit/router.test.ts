import { describe, it, expect } from 'vitest';
import { parseHash, guard, type GuardState } from '../../src/router';

describe('parseHash', () => {
  it('home for empty / bare hashes', () => {
    for (const h of ['', '#', '#/']) expect(parseHash(h).name).toBe('home');
  });

  it('static routes', () => {
    const cases: [string, string][] = [
      ['#/masuk', 'masuk'], ['#/daftar', 'daftar'], ['#/lupa', 'lupa'], ['#/onboarding', 'onboarding'],
      ['#/ebook', 'ebook'], ['#/tdee', 'tdee'], ['#/group', 'group'], ['#/akaun', 'akaun'],
      ['#/akaun/kod', 'akaun_kod'], ['#/aktif', 'aktif'], ['#/bantuan', 'bantuan'],
      ['#/rekod', 'rekod'], ['#/cabaran', 'cabaran'],
    ];
    for (const [h, n] of cases) expect(parseHash(h).name, h).toBe(n);
  });

  it('ignores trailing slash and query string', () => {
    expect(parseHash('#/bantuan/').name).toBe('bantuan');
    expect(parseHash('#/masuk?x=1').name).toBe('masuk');
  });

  it('ebook/:id param (decoded)', () => {
    const r = parseHash('#/ebook/3f1c%2Dab');
    expect(r.name).toBe('ebook_read');
    expect(r.params).toEqual({ id: '3f1c-ab' });
  });

  it('admin wildcard', () => {
    expect(parseHash('#/admin').name).toBe('admin');
    const r = parseHash('#/admin/peserta/abc');
    expect(r.name).toBe('admin');
    expect(r.params).toEqual({ rest: 'peserta/abc' });
  });

  it('unknown paths', () => {
    expect(parseHash('#/tak-wujud').name).toBe('tiada');
    expect(parseHash('#/ebook/a/b').name).toBe('tiada');
  });
});

const anon: GuardState = { status: 'anon', onboarded: false, roles: [] };
const fresh: GuardState = { status: 'ready', onboarded: false, roles: [] };
const member: GuardState = { status: 'ready', onboarded: true, roles: [] };
const admin: GuardState = { status: 'ready', onboarded: true, roles: ['superadmin'] };
const coach: GuardState = { status: 'ready', onboarded: true, roles: ['coach'] };
const g = (h: string, s: GuardState) => guard(parseHash(h), s);

describe('guard', () => {
  it('waits while the session is loading', () => {
    expect(g('#/', { status: 'loading', onboarded: false, roles: [] })).toBeNull();
    expect(g('#/admin', { status: 'loading', onboarded: false, roles: [] })).toBeNull();
  });

  it('no user -> #/masuk, except public auth pages', () => {
    for (const h of ['#/', '#/ebook', '#/rekod', '#/admin/x', '#/onboarding', '#/zzz']) {
      expect(g(h, anon), h).toBe('#/masuk');
    }
    for (const h of ['#/masuk', '#/daftar', '#/lupa', '#/bantuan']) expect(g(h, anon), h).toBeNull();
  });

  it('not onboarded -> #/onboarding for participant feature routes only', () => {
    for (const h of ['#/', '#/ebook', '#/ebook/1', '#/tdee', '#/rekod', '#/cabaran', '#/akaun', '#/admin', '#/zzz']) {
      expect(g(h, fresh), h).toBe('#/onboarding');
    }
    for (const h of ['#/onboarding', '#/bantuan', '#/masuk', '#/daftar', '#/lupa']) expect(g(h, fresh), h).toBeNull();
  });

  it('signed-in member leaves auth pages for home', () => {
    for (const h of ['#/masuk', '#/daftar', '#/lupa']) expect(g(h, member), h).toBe('#/');
    for (const h of ['#/', '#/ebook/1', '#/rekod', '#/cabaran', '#/akaun/kod', '#/onboarding', '#/bantuan']) {
      expect(g(h, member), h).toBeNull();
    }
  });

  it('admin routes need a staff role', () => {
    expect(g('#/admin', member)).toBe('#/');
    expect(g('#/admin/kod', member)).toBe('#/');
    expect(g('#/admin/kod', admin)).toBeNull();
    expect(g('#/admin', coach)).toBeNull();
    expect(g('#/bantuan', admin)).toBeNull();
  });

  it('staff are exempt from the onboarding redirect on #/admin/* only', () => {
    const freshAdmin: GuardState = { status: 'ready', onboarded: false, roles: ['superadmin'] };
    const freshCoach: GuardState = { status: 'ready', onboarded: false, roles: ['coach'] };
    expect(g('#/admin', freshAdmin)).toBeNull();
    expect(g('#/admin/peserta/abc', freshAdmin)).toBeNull();
    expect(g('#/admin/kod', freshCoach)).toBeNull();
    for (const h of ['#/', '#/ebook', '#/rekod', '#/akaun']) {
      expect(g(h, freshAdmin), h).toBe('#/onboarding');
      expect(g(h, freshCoach), h).toBe('#/onboarding');
    }
    // non-staff, not onboarded: admin still goes to onboarding first
    expect(g('#/admin', fresh)).toBe('#/onboarding');
  });

  it('session error: stays put (the app shows the error screen)', () => {
    expect(g('#/', { status: 'error', onboarded: false, roles: [] })).toBeNull();
  });
});

describe('#/aktif (code activation link)', () => {
  it('query string is parsed separately from params', () => {
    const r = parseHash('#/masuk?next=aktif');
    expect(r.name).toBe('masuk');
    expect(r.params).toEqual({});
    expect(r.query).toEqual({ next: 'aktif' });
  });
  it('anon -> #/masuk?next=aktif', () => {
    expect(g('#/aktif', anon)).toBe('#/masuk?next=aktif');
    expect(g('#/masuk?next=aktif', anon)).toBeNull();
  });
  it('signed-in member on #/masuk?next=aktif -> #/aktif', () => {
    expect(g('#/masuk?next=aktif', member)).toBe('#/aktif');
    expect(g('#/masuk?next=zzz', member)).toBe('#/');
    expect(g('#/aktif', member)).toBeNull();
  });
  it('not onboarded -> onboarding first', () => {
    expect(g('#/aktif', fresh)).toBe('#/onboarding');
  });
});
