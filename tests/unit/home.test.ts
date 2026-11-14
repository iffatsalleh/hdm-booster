import { describe, it, expect } from 'vitest';
import { countdownParts, startInstant, packageLabel, ebookStats, firstName, initials, phaseIndex } from '../../src/lib/home';

const packages = [
  { id: 'basic', name: 'Pakej Basic', items: ['ebook_strategi', 'graduation', 'group_hdm', 'sistem', 'tdee'] },
  {
    id: 'complete', name: 'Pakej Complete',
    items: ['ebook_emergency', 'ebook_food_swap', 'ebook_muscle_mania', 'ebook_strategi', 'ebook_supplement', 'ebook_tas',
      'ebook_traditional_remedy', 'graduation', 'group_hdm', 'group_muscle_mania', 'sistem', 'tdee'],
  },
  { id: 'upgrade_a_b', name: 'Naik Taraf A ke B', items: ['ebook_muscle_mania'] },
];

describe('countdown', () => {
  it('program start is 00:00 MYT', () => {
    expect(new Date(startInstant('2026-12-10')).toISOString()).toBe('2026-12-09T16:00:00.000Z');
  });

  it('splits the remaining time', () => {
    const start = startInstant('2026-12-10');
    const now = start - (25 * 86400 + 8 * 3600 + 14 * 60 + 52) * 1000;
    expect(countdownParts(start, now)).toEqual({ days: 25, hours: 8, minutes: 14, seconds: 52, done: false });
  });

  it('clamps at zero once started', () => {
    expect(countdownParts(1000, 5000)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0, done: true });
  });
});

describe('packageLabel', () => {
  it('complete when every complete item is held', () => {
    const all = new Set(packages[1].items);
    expect(packageLabel(all, packages)).toEqual({ id: 'complete', label: 'HDM BOOSTER COMPLETE' });
  });
  it('basic when basic items are held', () => {
    expect(packageLabel(new Set(packages[0].items), packages)).toEqual({ id: 'basic', label: 'HDM BOOSTER BASIC' });
  });
  it('partial / none', () => {
    expect(packageLabel(new Set(['tdee']), packages)).toEqual({ id: 'separa', label: 'Akses separa' });
    expect(packageLabel(new Set(), packages)).toEqual({ id: 'tiada', label: 'Tiada pakej aktif' });
  });
});

describe('ebookStats', () => {
  const ebooks = ['ebook_strategi', 'ebook_muscle_mania', 'ebook_tas'].map((k) => ({ item_key: k }));
  it('counts unlocked and locked ebooks', () => {
    expect(ebookStats(ebooks, new Set(['ebook_strategi', 'tdee']))).toEqual({ open: 1, total: 3, locked: 2 });
  });
});

describe('names', () => {
  it('firstName / initials', () => {
    expect(firstName('  Ali Bin Abu ')).toBe('Ali');
    expect(initials('Ali Bin Abu')).toBe('AL');
    expect(initials('')).toBe('?');
    expect(firstName(null)).toBe('');
  });
});

describe('phaseIndex', () => {
  const phases = [
    { key: 'rejab' as const, start: '2026-12-10', end: '2027-01-08' },
    { key: 'syaaban' as const, start: '2027-01-09', end: '2027-02-07' },
    { key: 'ramadan' as const, start: '2027-02-08', end: '2027-03-09' },
  ];
  it('before start highlights the first phase', () => {
    expect(phaseIndex(phases, '2026-11-14')).toBe(0);
  });
  it('current phase', () => {
    expect(phaseIndex(phases, '2027-01-20')).toBe(1);
    expect(phaseIndex(phases, '2027-03-01')).toBe(2);
  });
  it('after the end highlights all', () => {
    expect(phaseIndex(phases, '2027-04-01')).toBe(2);
  });
});
