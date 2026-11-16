import { describe, it, expect } from 'vitest';
import {
  adminError, appUrl, buildQuery, canMutate, canView, codeWaText, codesCsvRows, codesExportRows, codesFilename,
  CONFIRM_ACTIONS, dateMYT, fetchAllPages, listTotal, dateTimeMYT, dmyMYT, exportFilename, needsConfirm, parseAdminPath, participantsCsvRows,
  purchaseWaText, purchasesCsvRows, SECTIONS, slugLabel, toLocalInput, fromLocalInput, visibleSections,
} from '../../src/lib/admin';
import { ApiError } from '../../src/lib/errors';

const SA = ['superadmin'];
const COACH = ['coach'];

describe('admin permission matrix', () => {
  it('coach sees only Ringkasan and Peserta', () => {
    expect(visibleSections(COACH).map((s) => s.key)).toEqual(['ringkasan', 'peserta']);
    for (const s of SECTIONS) expect(canView(s.key, COACH)).toBe(s.key === 'ringkasan' || s.key === 'peserta');
  });
  it('superadmin sees every section', () => {
    expect(visibleSections(SA).map((s) => s.key)).toEqual(
      ['ringkasan', 'pembelian', 'kod', 'peserta', 'bcl', 'kandungan', 'export', 'audit']);
    expect(SECTIONS.every((s) => canView(s.key, SA))).toBe(true);
  });
  it('a superadmin who is also coach is still superadmin', () => {
    expect(canView('kod', ['coach', 'superadmin'])).toBe(true);
    expect(canMutate(['coach', 'superadmin'])).toBe(true);
  });
  it('only superadmin may mutate; participants none', () => {
    expect(canMutate(SA)).toBe(true);
    expect(canMutate(COACH)).toBe(false);
    expect(canMutate([])).toBe(false);
    expect(canView('ringkasan', [])).toBe(false);
  });
});

describe('parseAdminPath', () => {
  it('maps #/admin/* rest to a section', () => {
    expect(parseAdminPath(undefined)).toEqual({ section: 'ringkasan' });
    expect(parseAdminPath('')).toEqual({ section: 'ringkasan' });
    expect(parseAdminPath('pembelian')).toEqual({ section: 'pembelian' });
    expect(parseAdminPath('kod')).toEqual({ section: 'kod' });
    expect(parseAdminPath('peserta')).toEqual({ section: 'peserta' });
    expect(parseAdminPath('peserta/abc-123')).toEqual({ section: 'peserta', uid: 'abc-123' });
    expect(parseAdminPath('bcl')).toEqual({ section: 'bcl' });
    expect(parseAdminPath('kandungan')).toEqual({ section: 'kandungan' });
    expect(parseAdminPath('export')).toEqual({ section: 'export' });
    expect(parseAdminPath('audit')).toEqual({ section: 'audit' });
    expect(parseAdminPath('entah')).toEqual({ section: null });
    expect(parseAdminPath('kod/x')).toEqual({ section: null });
  });
});

describe('confirm-required actions', () => {
  it('every destructive action asks first', () => {
    for (const a of ['purchase.cancel', 'code.cancel', 'code.release', 'grant.revoke', 'participant.reset_password',
      'bcl_map.delete', 'content.delete']) {
      expect(needsConfirm(a)).toBe(true);
    }
    expect(CONFIRM_ACTIONS.size).toBe(7);
  });
  it('non-destructive actions do not', () => {
    for (const a of ['purchase.restore', 'purchase.reprocess', 'code.reactivate', 'grant.create', 'content.update']) {
      expect(needsConfirm(a)).toBe(false);
    }
  });
});

describe('buildQuery', () => {
  it('drops empty values, trims, encodes, keeps key order', () => {
    expect(buildQuery({})).toBe('');
    expect(buildQuery({ status: '', q: '  ' })).toBe('');
    expect(buildQuery({ status: 'perlu_semakan', batch_id: null, q: ' ali abu ' })).toBe('?status=perlu_semakan&q=ali%20abu');
    expect(buildQuery({ q: 'a&b=c' })).toBe('?q=a%26b%3Dc');
    expect(buildQuery({ limit: 200 })).toBe('?limit=200');
  });
});

describe('MYT dates and filenames', () => {
  // 2026-11-14T17:30Z is 15/11/2026 01:30 in Malaysia
  const late = new Date('2026-11-14T17:30:00Z');
  it('dmyMYT uses Malaysia time', () => {
    expect(dmyMYT(late)).toBe('15112026');
    expect(dmyMYT(new Date('2026-11-14T15:59:00Z'))).toBe('14112026');
  });
  it('dateMYT / dateTimeMYT', () => {
    expect(dateMYT('2026-11-14T17:30:00Z')).toBe('15/11/2026');
    expect(dateTimeMYT('2026-11-14T17:30:00Z')).toBe('15/11/2026 01:30');
    expect(dateMYT(null)).toBe('—');
    expect(dateMYT('2026-12-10')).toBe('10/12/2026');
    expect(dateTimeMYT('bukan tarikh')).toBe('—');
  });
  it('slugLabel', () => {
    expect(slugLabel('Giveaway Instagram Nov')).toBe('giveaway-instagram-nov');
    expect(slugLabel('  A/B  test!! ')).toBe('a-b-test');
    expect(slugLabel('')).toBe('kod');
    expect(slugLabel(null)).toBe('kod');
  });
  it('codesFilename: kod-<label>-<DDMMYYYY>.csv', () => {
    expect(codesFilename('Giveaway IG', late)).toBe('kod-giveaway-ig-15112026.csv');
    expect(codesFilename('', late)).toBe('kod-kod-15112026.csv');
  });
  it('exportFilename', () => {
    expect(exportFilename('peserta', late)).toBe('peserta-15112026.csv');
    expect(exportFilename('pembelian', late)).toBe('pembelian-15112026.csv');
    expect(exportFilename('kod', late)).toBe('kod-semua-15112026.csv');
  });
  it('datetime-local round trip in MYT', () => {
    expect(toLocalInput('2026-11-30T16:00:00+00:00')).toBe('2026-12-01T00:00');
    expect(toLocalInput(null)).toBe('');
    expect(fromLocalInput('2026-12-01T00:00')).toBe('2026-12-01T00:00:00+08:00');
    expect(fromLocalInput('')).toBeNull();
  });
});

describe('CSV builders', () => {
  const codes = [
    { code: 'HDMB-AAAA-BBBB', package_id: 'basic', package_name: 'Pakej Basic', batch_label: 'IG Nov', status: 'belum_guna',
      redeemed_by: null, redeemed_at: null, access_ends_at: null, buyer_name: null, created_at: '2026-11-14T02:00:00Z' },
    { code: 'HDMB-CCCC-DDDD', package_id: 'complete', package_name: null, batch_label: null, status: 'aktif',
      redeemed_by: 'u1', redeemed_at: '2026-11-14T17:30:00Z', access_ends_at: '2027-03-10T15:59:00Z', buyer_name: 'Siti',
      created_at: '2026-11-14T02:00:00Z' },
  ];
  it('generated codes: exactly kod, pakej, batch', () => {
    const rows = codesCsvRows(codes);
    expect(rows).toEqual([
      { kod: 'HDMB-AAAA-BBBB', pakej: 'Pakej Basic', batch: 'IG Nov' },
      { kod: 'HDMB-CCCC-DDDD', pakej: 'complete', batch: '' },
    ]);
    expect(Object.keys(rows[0])).toEqual(['kod', 'pakej', 'batch']);
  });
  it('codes export rows use MYT dates', () => {
    expect(codesExportRows(codes)[1]).toEqual({
      kod: 'HDMB-CCCC-DDDD', pakej: 'complete', batch: '', status: 'aktif', ditebus_oleh: 'u1',
      tarikh_tebus: '15/11/2026 01:30', tamat: '10/03/2027', pembeli: 'Siti', dijana: '14/11/2026 10:00',
    });
  });
  it('participants rows', () => {
    const rows = participantsCsvRows([{ id: 'u1', full_name: 'Ali', email: 'a@x.my', phone: '60123', onboarded_at: null,
      created_at: '2026-11-14T17:30:00Z', entitlements: ['tdee', 'sistem'] }]);
    expect(rows).toEqual([{ nama: 'Ali', emel: 'a@x.my', telefon: '60123', onboarding: 'belum',
      daftar: '15/11/2026 01:30', hak_akses: 'tdee sistem', uid: 'u1' }]);
  });
  it('purchases rows', () => {
    const rows = purchasesCsvRows([{ id: 'p1', order_ref: 'BCL-1', buyer_name: 'Ali', email: 'a@x.my', phone: '60123',
      package_id: 'basic', package_name: 'Pakej Basic', amount_rm: 100, paid_at: '2026-11-14T17:30:00Z',
      status: 'dituntut', review_reason: null, source: 'bcl', created_at: '2026-11-14T17:30:00Z' }]);
    expect(rows).toEqual([{ order_ref: 'BCL-1', nama: 'Ali', emel: 'a@x.my', telefon: '60123', pakej: 'Pakej Basic',
      jumlah_rm: 100, tarikh_bayar: '15/11/2026 01:30', status: 'dituntut', sebab_semakan: '', sumber: 'bcl' }]);
  });
});

describe('WhatsApp text builders', () => {
  it('appUrl strips hash and query', () => {
    expect(appUrl({ origin: 'https://hdm.blogspot.com', pathname: '/p/app.html' })).toBe('https://hdm.blogspot.com/p/app.html');
    expect(appUrl({ origin: 'http://localhost:5173', pathname: '/app.html' }, 'https://x.my/app/')).toBe('https://x.my/app/');
  });
  const base = 'https://hdm.blogspot.com/p/app.html';
  it('code template', () => {
    const tpl = 'Salam {nama}, ini kod akses HDM BOOSTER anda: {kod}. Aktifkan di {pautan}.';
    expect(codeWaText(tpl, { nama: 'Siti', kod: 'HDMB-A7K3-Q9XP' }, base)).toBe(
      'Salam Siti, ini kod akses HDM BOOSTER anda: HDMB-A7K3-Q9XP. Aktifkan di https://hdm.blogspot.com/p/app.html#/aktif.');
  });
  it('code template falls back when the setting is missing', () => {
    expect(codeWaText('', { nama: '', kod: 'K' }, base)).toContain('K');
    expect(codeWaText(null, { nama: 'A', kod: 'K' }, base)).toContain(`${base}#/aktif`);
  });
  it('purchase template links to #/daftar', () => {
    const tpl = 'Salam {nama}, daftar di {pautan}';
    expect(purchaseWaText(tpl, 'Ali', base)).toBe(`Salam Ali, daftar di ${base}#/daftar`);
    expect(purchaseWaText(undefined, null, base)).toContain(`${base}#/daftar`);
  });
});

describe('adminError', () => {
  it('403 always reads Tiada kebenaran', () => {
    expect(adminError(new ApiError('tiada_kebenaran', 'Anda tidak mempunyai kebenaran untuk tindakan ini.', 403)))
      .toBe('Tiada kebenaran untuk tindakan ini.');
  });
  it('other errors keep the Worker BM message', () => {
    expect(adminError(new ApiError('kod_tidak_wujud', 'Kod tidak dijumpai.', 404))).toBe('Kod tidak dijumpai.');
  });
});

describe('fetchAllPages (offset paging until total)', () => {
  const rows = (n: number, total: number, from = 0) => Array.from({ length: n }, (_, i) => ({ id: from + i, total }));
  it('pages through 450 rows in 200-row pages', async () => {
    const calls: number[] = [];
    const all = await fetchAllPages(async (offset) => {
      calls.push(offset);
      return rows(Math.min(200, 450 - offset), 450, offset);
    });
    expect(calls).toEqual([0, 200, 400]);
    expect(all).toHaveLength(450);
    expect(all[449].id).toBe(449);
  });
  it('one call when everything fits; stops on an empty page', async () => {
    const calls: number[] = [];
    expect(await fetchAllPages(async (o) => { calls.push(o); return rows(3, 3); })).toHaveLength(3);
    expect(calls).toEqual([0]);
    expect(await fetchAllPages(async () => [])).toEqual([]);
    // total says more but the server returns nothing: stop instead of looping
    let n = 0;
    const r = await fetchAllPages(async (o) => { n++; return o === 0 ? rows(200, 999) : []; });
    expect(r).toHaveLength(200);
    expect(n).toBe(2);
  });
  it('rows without total (older server) stop on a short page', async () => {
    const calls: number[] = [];
    const r = await fetchAllPages(async (o) => { calls.push(o); return o === 0 ? Array.from({ length: 200 }, (_, i) => ({ id: i })) : [{ id: 200 }]; });
    expect(r).toHaveLength(201);
    expect(calls).toEqual([0, 200]);
  });
  it('listTotal reads the total column, else the row count', () => {
    expect(listTotal([{ total: '450' }])).toBe(450);
    expect(listTotal([{ id: 1 }, { id: 2 }])).toBe(2);
    expect(listTotal([])).toBe(0);
  });
});

describe('recovery helpers (final fix wave)', () => {
  it('reprocessMessage reflects the real outcome', async () => {
    const { reprocessMessage } = await import('../../src/lib/admin');
    const data = (d: Record<string, unknown>) => ({ ok: true, result: { ok: true, data: d } });
    expect(reprocessMessage(data({ inserted: true, status: 'belum_dituntut' }))).toEqual({
      tone: 'green', text: 'Pembelian baharu direkodkan (status: belum_dituntut).' });
    expect(reprocessMessage(data({ inserted: false, reevaluated: true, changed: true, status: 'belum_dituntut' }))).toEqual({
      tone: 'green', text: 'Order dinilai semula: status sekarang belum_dituntut.' });
    expect(reprocessMessage(data({ inserted: false, reevaluated: true, changed: false, status: 'perlu_semakan', review_reason: 'Telefon tidak sah' }))).toEqual({
      tone: 'yellow', text: 'Order dinilai semula: tiada perubahan (masih perlu semakan: Telefon tidak sah).' });
    expect(reprocessMessage(data({ inserted: false, reevaluated: false, changed: false, status: 'dituntut' }))).toEqual({
      tone: 'yellow', text: 'Tiada perubahan: pembelian ini sudah berstatus dituntut.' });
    expect(reprocessMessage({ ok: false, result: { ok: false, reason: 'unmapped' } }).text).toContain('Pemetaan BCL');
    expect(reprocessMessage({ ok: false, result: { ok: false, reason: 'not_paid_live' } }).text).toContain('belum disahkan');
    expect(reprocessMessage({ ok: false, reason: 'error', result: null })).toEqual({ tone: 'red', text: 'Apps Script: error' });
    expect(reprocessMessage({ ok: false, result: null })).toEqual({ tone: 'red', text: 'Apps Script: tidak berjaya' });
  });

  it('defaultBatchId: batch open now, else the latest by sales_open_at, else ""', async () => {
    const { defaultBatchId } = await import('../../src/lib/admin');
    const b = [
      { id: 'old', sales_open_at: '2025-12-01T00:00:00+08:00', sales_close_at: '2026-01-31T23:59:00+08:00' },
      { id: 'next', sales_open_at: '2026-12-01T00:00:00+08:00', sales_close_at: '2027-01-31T23:59:00+08:00' },
    ];
    expect(defaultBatchId(b, Date.parse('2026-01-10T00:00:00Z'))).toBe('old');
    expect(defaultBatchId(b, Date.parse('2026-11-16T00:00:00Z'))).toBe('next');
    expect(defaultBatchId([], Date.now())).toBe('');
  });

  it('buyerProblem: BM message for a missing name, bad email or phone', async () => {
    const { buyerProblem } = await import('../../src/lib/admin');
    expect(buyerProblem({ name: 'Ali', email: 'ali@gmail.com', phone: '012-345 6789' })).toBeNull();
    expect(buyerProblem({ name: ' ', email: 'ali@gmail.com', phone: '0123456789' })).toBe('Sila isi nama pembeli.');
    expect(buyerProblem({ name: 'Ali', email: 'ali@', phone: '0123456789' })).toBe('Emel tidak sah. Semak semula emel pembeli.');
    expect(buyerProblem({ name: 'Ali', email: 'ali@gmail.com', phone: '0312345678' })).toMatch(/^Nombor telefon tidak sah/);
  });

  it('isWebhookError: error/ralat and unknown failures only', async () => {
    const { isWebhookError } = await import('../../src/lib/admin');
    expect(isWebhookError({ kind: 'error' })).toBe(true);
    expect(isWebhookError({ kind: 'ralat' })).toBe(true);
    expect(isWebhookError({ kind: 'pelik', ok: false })).toBe(true);
    for (const kind of ['ignored', 'skipped', 'processed', 'ok']) expect(isWebhookError({ kind, ok: false })).toBe(false);
  });
});
