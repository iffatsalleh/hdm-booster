import { describe, it, expect } from 'vitest';
import { toCsv } from '../../src/lib/csv';

describe('toCsv', () => {
  it('escapes per RFC 4180 with BOM', () => {
    expect(toCsv([{ a: 'x,y', b: '"q"' }])).toBe('\uFEFFa,b\r\n"x,y","""q"""\r\n');
  });
  it('null/undefined become empty', () => {
    expect(toCsv([{ a: null, b: undefined, c: 1 }])).toBe('\uFEFFa,b,c\r\n,,1\r\n');
  });
  it('quotes newlines', () => {
    expect(toCsv([{ a: 'l1\nl2' }])).toBe('\uFEFFa\r\n"l1\nl2"\r\n');
  });
});
