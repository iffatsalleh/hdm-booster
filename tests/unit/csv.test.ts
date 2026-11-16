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

describe('toCsv formula injection', () => {
  it('prefixes a quote on formula-leading cells', () => {
    expect(toCsv([{ a: '=HYPERLINK("http://x","y")' }])).toBe('\uFEFFa\r\n"\'=HYPERLINK(""http://x"",""y"")"\r\n');
    expect(toCsv([{ a: '@SUM(A1)', b: '-2+3', c: '\tx', d: '\rx' }])).toBe('\uFEFFa,b,c,d\r\n\'@SUM(A1),\'-2+3,\'\tx,"\'\rx"\r\n');
  });
  it('plus-leading phone is escaped too', () => {
    expect(toCsv([{ telefon: '+60123456789' }])).toBe("\uFEFFtelefon\r\n'+60123456789\r\n");
  });
  it('normal text and empty cells unchanged', () => {
    expect(toCsv([{ a: 'Ali Bin Abu', b: '60123456789', c: '', d: null }])).toBe('\uFEFFa,b,c,d\r\nAli Bin Abu,60123456789,,\r\n');
  });
});

describe('BOM is written as an escape in source', () => {
  it('src/lib/csv.ts and this test contain no literal U+FEFF', async () => {
    const { readFileSync } = await import('node:fs');
    for (const f of ['src/lib/csv.ts', 'tests/unit/csv.test.ts']) {
      expect(readFileSync(f, 'utf8').includes(String.fromCharCode(0xfeff)), f).toBe(false);
    }
  });
});
