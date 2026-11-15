import { describe, it, expect } from 'vitest';
import { tabsFor } from '../../src/lib/nav';

describe('tabsFor', () => {
  it('participants get 5 tabs', () => {
    expect(tabsFor([]).map((t) => t.label)).toEqual(['Utama', 'Rekod', 'Ebook', 'Cabaran', 'Akaun']);
  });
  it('staff (superadmin or coach) get an Admin tab appended', () => {
    for (const r of ['superadmin', 'coach']) {
      const t = tabsFor([r]);
      expect(t).toHaveLength(6);
      expect(t[5]).toEqual({ href: '#/admin', label: 'Admin', icon: 'shield-check', match: ['admin'] });
    }
  });
  it('unknown roles do not', () => {
    expect(tabsFor(['peserta'])).toHaveLength(5);
  });
});
