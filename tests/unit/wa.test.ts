import { describe, it, expect } from 'vitest';
import { waLink, fillTemplate } from '../../src/lib/wa';

describe('wa', () => {
  it('waLink', () => {
    expect(waLink('012-3456789', 'Hai Ali')).toBe('https://wa.me/60123456789?text=Hai%20Ali');
  });
  it('fillTemplate', () => {
    expect(fillTemplate('Hai {nama}, kod {kod}', { nama: 'Ali', kod: 'X' })).toBe('Hai Ali, kod X');
    expect(fillTemplate('Hai {nama} {pautan}', { nama: 'Ali' })).toBe('Hai Ali {pautan}');
  });
});
