import { describe, it, expect } from 'vitest';
import { todayMYT, programWeek, currentPhase, daysUntil, formatDMY, type BatchDates } from '../../src/lib/dates';

const b: BatchDates = { programStart: '2026-12-10', programEnd: '2027-03-10', phases: [
  { key: 'rejab', start: '2026-12-10', end: '2027-01-08' },
  { key: 'syaaban', start: '2027-01-09', end: '2027-02-07' },
  { key: 'ramadan', start: '2027-02-08', end: '2027-03-09' }] };

describe('dates', () => {
  it('todayMYT', () => {
    expect(todayMYT(new Date('2026-12-09T16:30:00Z'))).toBe('2026-12-10');
    expect(todayMYT(new Date('2026-12-09T15:30:00Z'))).toBe('2026-12-09');
  });
  it('programWeek', () => {
    expect(programWeek(b, '2026-12-09')).toBeNull();
    expect(programWeek(b, '2026-12-10')).toEqual({ week: 1, total: 13 });
    expect(programWeek(b, '2026-12-16')).toEqual({ week: 1, total: 13 });
    expect(programWeek(b, '2026-12-17')).toEqual({ week: 2, total: 13 });
  });
  it('programWeek clamps after end', () => {
    expect(programWeek(b, '2027-06-01')).toEqual({ week: 13, total: 13 });
  });
  it('currentPhase', () => {
    expect(currentPhase(b, '2027-02-08')?.key).toBe('ramadan');
    expect(currentPhase(b, '2026-12-10')?.key).toBe('rejab');
    expect(currentPhase(b, '2027-03-10')).toBeNull();
    expect(currentPhase(b, '2026-12-09')).toBeNull();
  });
  it('daysUntil', () => {
    expect(daysUntil('2026-12-10', '2026-12-09')).toBe(1);
    expect(daysUntil('2026-12-10', '2026-12-10')).toBe(0);
    expect(daysUntil('2026-12-01', '2026-12-10')).toBe(-9);
  });
  it('formatDMY', () => {
    expect(formatDMY('2026-12-10')).toBe('10/12/2026');
  });
});
