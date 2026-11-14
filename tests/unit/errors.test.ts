import { describe, it, expect } from 'vitest';
import { ApiError, bm } from '../../src/lib/errors';

const NET = 'Tiada sambungan internet. Cuba lagi sebentar.';

describe('errors.bm', () => {
  it('uses the Worker BM message when present', () => {
    expect(bm(new ApiError('data_tidak_sah', 'Emel tidak sah.'))).toBe('Emel tidak sah.');
  });

  it('maps known reasons when there is no message', () => {
    expect(bm(new ApiError('tiada_pembelian'))).toBe(
      'Emel/telefon ini tiada rekod pembelian. Pastikan sama seperti semasa beli di BCL, atau WhatsApp 60134417042.',
    );
    expect(bm(new ApiError('sudah_didaftar'))).toBe('Emel ini sudah ada akaun. Sila log masuk atau tekan Lupa Kata Laluan.');
    expect(bm(new ApiError('terlalu_banyak_cubaan'))).toBe('Terlalu banyak cubaan. Cuba lagi selepas 15 minit.');
    expect(bm({ reason: 'tiada_profil' })).toBe('Akaun ini belum didaftarkan. Sila daftar di halaman Daftar.');
  });

  it('maps Firebase auth codes', () => {
    expect(bm({ code: 'auth/invalid-credential' })).toBe('Emel atau kata laluan salah.');
    expect(bm({ code: 'auth/wrong-password' })).toBe('Emel atau kata laluan salah.');
    expect(bm({ code: 'auth/user-not-found' })).toBe('Emel atau kata laluan salah.');
    expect(bm({ code: 'auth/invalid-email' })).toBe('Emel tidak sah.');
    expect(bm({ code: 'auth/too-many-requests' })).toMatch(/^Terlalu banyak cubaan/);
    expect(bm({ code: 'auth/network-request-failed' })).toBe(NET);
  });

  it('maps network failures', () => {
    expect(bm(new ApiError('rangkaian'))).toBe(NET);
    expect(bm(new TypeError('Failed to fetch'))).toBe(NET);
    expect(bm(new ApiError('masa_tamat'))).toMatch(/perlahan/);
  });

  it('falls back to a generic BM message', () => {
    expect(bm(new Error('boom'))).toBe('Ralat tidak dijangka. Sila cuba lagi sebentar.');
    expect(bm(undefined)).toBe('Ralat tidak dijangka. Sila cuba lagi sebentar.');
    expect(bm(new ApiError('alasan_baru'))).toBe('Ralat tidak dijangka. Sila cuba lagi sebentar.');
  });

  it('ApiError carries reason, message and status', () => {
    const e = new ApiError('tiada', 'x', 404);
    expect(e).toBeInstanceOf(Error);
    expect([e.reason, e.message, e.status]).toEqual(['tiada', 'x', 404]);
  });
});
