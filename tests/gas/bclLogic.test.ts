import { describe, it, expect } from 'vitest';
import { loadGas, fixture } from './load';
import { normalizePhone as srcPhone } from '../../src/lib/phone';

const g = loadGas();
const rows = [
  { package_id: 'basic', formable_id: '77', amount: 100, field_value: null },
  { package_id: 'pro', formable_id: '78', amount: 250, field_value: null },
  { package_id: 'bundleA', formable_id: '80', amount: null, field_value: 'Pakej A' },
  { package_id: 'bundleB', formable_id: '80', amount: null, field_value: 'Pakej B' },
];
const fieldMap = () => g.defaultFieldMap();

describe('isPaidLive', () => {
  it('accepts status 3 + paid + live', () => {
    expect(g.isPaidLive({ status: 3, is_paid: true, type: 'Live' })).toBe(true);
    expect(g.isPaidLive({ status: '3', is_paid: 1, type: 'live' })).toBe(true);
  });
  it('rejects test / unpaid / wrong status', () => {
    expect(g.isPaidLive({ status: 3, is_paid: true, type: 'test' })).toBe(false);
    expect(g.isPaidLive({ status: 3, is_paid: false, type: 'Live' })).toBe(false);
    expect(g.isPaidLive({ status: 2, is_paid: true, type: 'Live' })).toBe(false);
    expect(g.isPaidLive(null)).toBe(false);
  });
});

describe('matchPackage', () => {
  it('formable_id + exact amount', () => {
    expect(g.matchPackage({ formable_id: '77', amount: '100.00' }, rows)).toEqual({ packageId: 'basic', mapped: true });
  });
  it('fee within RM3 tolerance', () => {
    expect(g.matchPackage({ formable_id: '77', amount: '102.50' }, rows)).toEqual({ packageId: 'basic', mapped: true });
  });
  it('numeric formable_id matches string row', () => {
    expect(g.matchPackage({ formable_id: 77, amount: 100 }, rows)).toEqual({ packageId: 'basic', mapped: true });
  });
  it('unknown formable_id -> unmapped', () => {
    expect(g.matchPackage({ formable_id: '99', amount: '50.00' }, rows)).toEqual({ packageId: null, mapped: false });
  });
  it('known form, amount mismatch -> mapped but no package', () => {
    expect(g.matchPackage({ formable_id: '77', amount: '80.00' }, rows)).toEqual({ packageId: null, mapped: true });
  });
  it('tolerance is configurable', () => {
    expect(g.matchPackage({ formable_id: '77', amount: '102.50' }, rows, { tolerance: 1 })).toEqual({ packageId: null, mapped: true });
  });
  it('field value disambiguates rows of one form', () => {
    const txn = { formable_id: '80', amount: '10', custom_fields_data: { package: 'pakej b' } };
    const fm = { ...fieldMap(), field_value: ['custom_fields_data.package'] };
    expect(g.matchPackage(txn, rows, { fieldMap: fm })).toEqual({ packageId: 'bundleB', mapped: true });
    expect(g.matchPackage({ formable_id: '80', amount: '10' }, rows, { fieldMap: fm })).toEqual({ packageId: null, mapped: true });
  });
});

describe('buyerFromTxn', () => {
  it('reads custom_fields_data first and normalises', () => {
    expect(g.buyerFromTxn(fixture('txn-paid-live.json'), fieldMap())).toEqual({ name: 'Ali Bin Abu', email: 'ali@gmail.com', phone: '60123456789' });
  });
  it('falls back to main_data when custom fields empty', () => {
    expect(g.buyerFromTxn(fixture('txn-main-data.json'), fieldMap())).toEqual({ name: 'Siti Aminah', email: 'siti@gmail.com', phone: '601123456789' });
  });
  it('invalid phone -> null', () => {
    expect(g.buyerFromTxn({ main_data: { name: 'A', email: 'a@b.c', phone: '123' } }, fieldMap()).phone).toBeNull();
  });
});

describe('extractOrderRef', () => {
  it('finds ref in object, string body, nested', () => {
    const body = fixture('webhook-body.json');
    expect(g.extractOrderRef(body)).toBe('BCL-240001');
    expect(g.extractOrderRef(JSON.stringify(body))).toBe('BCL-240001');
    expect(g.extractOrderRef({ order_no: 'X1' })).toBe('X1');
  });
  it('null when absent / garbage', () => {
    expect(g.extractOrderRef({})).toBeNull();
    expect(g.extractOrderRef('not json')).toBeNull();
    expect(g.extractOrderRef(null)).toBeNull();
  });
});

describe('normalisers mirror src/lib/phone.ts', () => {
  const cases = ['012-345 6789', '+60123456789', '0123456789', '60 11-2345 6789', '123456789', '12345', '0312345678', '', null, undefined];
  it.each(cases)('phone %s', (c) => {
    expect(g.normalizePhone(c)).toBe(srcPhone(c as any));
  });
  it('email', () => expect(g.normalizeEmail('  Ali@Gmail.COM ')).toBe('ali@gmail.com'));
});
