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
  it('missing formable_id -> unmapped (no amount-only guess)', () => {
    expect(g.matchPackage({ amount: '100.00' }, rows)).toEqual({ packageId: null, mapped: false });
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

  describe('one form, package by product name (discounts change the price)', () => {
    const one = [
      { package_id: 'basic', formable_id: '21460', amount: null, field_value: 'Pakej A - Basic' },
      { package_id: 'complete', formable_id: '21460', amount: null, field_value: 'Pakej B - Complete' },
    ];
    it('finds the product name inside order lines with no field map, at any price', () => {
      const txn = { formable_id: '21460', amount: '79.00', products: [{ name: 'pakej b -  complete', quantity: 1, price: '79.00' }] };
      expect(g.matchPackage(txn, one)).toEqual({ packageId: 'complete', mapped: true });
    });
    it('ignores order lines with quantity 0', () => {
      const txn = { formable_id: '21460', amount: '100', items: [
        { title: 'Pakej A - Basic', qty: 1 }, { title: 'Pakej B - Complete', qty: 0 }] };
      expect(g.matchPackage(txn, one)).toEqual({ packageId: 'basic', mapped: true });
    });
    it('two packages in one order -> no package (admin resolves)', () => {
      const txn = { formable_id: '21460', items: [{ name: 'Pakej A - Basic', qty: 1 }, { name: 'Pakej B - Complete', qty: 1 }] };
      expect(g.matchPackage(txn, one)).toEqual({ packageId: null, mapped: true });
    });
    it('partial text does not match (exact whole value only)', () => {
      const txn = { formable_id: '21460', items: [{ name: 'Pakej A - Basic Plus', qty: 1 }] };
      expect(g.matchPackage(txn, one)).toEqual({ packageId: null, mapped: true });
    });
    it('product name wins over a price that equals another package', () => {
      const mixed = [...one, { package_id: 'basic', formable_id: '21460', amount: 150, field_value: null }];
      const txn = { formable_id: '21460', amount: '100', items: [{ name: 'Pakej B - Complete', qty: 1 }] };
      expect(g.matchPackage(txn, mixed)).toEqual({ packageId: 'complete', mapped: true });
    });
    it('falls back to amount rows when no product name is found', () => {
      const mixed = [...one, { package_id: 'basic', formable_id: '21460', amount: 100, field_value: null }];
      expect(g.matchPackage({ formable_id: '21460', amount: '101.20' }, mixed)).toEqual({ packageId: 'basic', mapped: true });
    });
  });
});

describe('real BCL payment_form webhook shape', () => {
  const body = fixture('webhook-bcl-payment-form.json');
  const txn = body.data; // what unwrapTxn yields for a {data:{...}} envelope
  const one = [
    { package_id: 'basic', formable_id: '21460', amount: null, field_value: 'Pakej Basic' },
    { package_id: 'complete', formable_id: '21460', amount: null, field_value: 'Pakej Lengkap' },
  ];
  it('finds the order ref in the webhook body', () => {
    expect(g.extractOrderRef(body, fieldMap())).toBe('LINK-100001');
    expect(g.extractOrderRef(JSON.stringify(body), fieldMap())).toBe('LINK-100001');
    expect(g.extractOrderRef(txn, fieldMap())).toBe('LINK-100001');
  });
  it('paid live is read from main_data (transaction_type)', () => {
    expect(g.isPaidLive(txn)).toBe(true);
    expect(g.isPaidLive({ ...txn, main_data: { ...txn.main_data, is_paid: 0, status: 1 } })).toBe(false);
    expect(g.isPaidLive({ ...txn, main_data: { ...txn.main_data, transaction_type: 'test' } })).toBe(false);
  });
  it('buyer, amount and paid time come from main_data', () => {
    expect(g.buyerFromTxn(txn, fieldMap())).toEqual({ name: 'Ali Bin Abu', email: 'ali@gmail.com', phone: '60123456789' });
    expect(g.paidAtFromTxn(txn, fieldMap())).toBe('2026-11-17T03:40:00.000Z');
  });
  it('package by product name even with a coupon price', () => {
    expect(g.matchPackage(txn, one)).toEqual({ packageId: 'basic', mapped: true });
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

describe('paidAtFromTxn', () => {
  it('ISO with offset -> ISO UTC', () => {
    expect(g.paidAtFromTxn({ paid_at: '2026-11-14T10:00:00+08:00' }, fieldMap())).toBe('2026-11-14T02:00:00.000Z');
  });
  it('naive BCL datetime is Malaysia time (+08:00)', () => {
    expect(g.paidAtFromTxn({ paid_at: '2026-11-14 10:30:00' }, fieldMap())).toBe('2026-11-14T02:30:00.000Z');
  });
  it('falls back through payment_date then updated_at', () => {
    expect(g.paidAtFromTxn({ payment_date: '2026-11-14 08:00:00', updated_at: '2026-11-15 08:00:00' }, fieldMap()))
      .toBe('2026-11-14T00:00:00.000Z');
    expect(g.paidAtFromTxn({ updated_at: '2026-11-15T00:00:00Z' }, fieldMap())).toBe('2026-11-15T00:00:00.000Z');
  });
  it('epoch seconds and milliseconds', () => {
    expect(g.paidAtFromTxn({ paid_at: 1800000000 }, fieldMap())).toBe(new Date(1800000000 * 1000).toISOString());
    expect(g.paidAtFromTxn({ paid_at: '1800000000000' }, fieldMap())).toBe(new Date(1800000000000).toISOString());
  });
  it('missing / unparseable -> null', () => {
    expect(g.paidAtFromTxn({}, fieldMap())).toBeNull();
    expect(g.paidAtFromTxn({ paid_at: 'semalam' }, fieldMap())).toBeNull();
    expect(g.paidAtFromTxn(null, fieldMap())).toBeNull();
  });
  it('BCL_FIELD_MAP paid_at overrides the candidate paths', () => {
    const fm = g.resolveFieldMap(JSON.stringify({ paid_at: ['data.paid_on'] }));
    expect(g.paidAtFromTxn({ paid_at: '2020-01-01T00:00:00Z', data: { paid_on: '2026-11-14T00:00:00Z' } }, fm))
      .toBe('2026-11-14T00:00:00.000Z');
    expect(g.defaultFieldMap().paid_at.slice(0, 3)).toEqual(['paid_at', 'payment_date', 'updated_at']);
  });
});
