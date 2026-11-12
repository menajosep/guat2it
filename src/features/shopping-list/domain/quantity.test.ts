import { parseQuantity, type QuantityDraft } from './quantity';

const draft = (amount: string, unit: QuantityDraft['unit']): QuantityDraft => ({ amount, unit });

describe('parseQuantity', () => {
  it('accepts no amount and no unit', () => {
    expect(parseQuantity(draft('', undefined))).toEqual({ ok: true, value: {} });
    expect(parseQuantity(draft('  ', undefined))).toEqual({ ok: true, value: {} });
  });

  it.each([
    ['500', 500],
    [' 2 ', 2],
    ['0.5', 0.5],
    ['0,5', 0.5],
    ['1.25', 1.25],
    ['9999.99', 9999.99],
  ])('accepts the amount %j', (raw, amount) => {
    expect(parseQuantity(draft(raw, 'cup'))).toEqual({ ok: true, value: { amount, unit: 'cup' } });
  });

  it.each(['abc', '0', '0.00', '-1', '1.234', '1..2', '1e3', '.5', '1,2,3'])(
    'rejects the invalid amount %j',
    (raw) => {
      expect(parseQuantity(draft(raw, 'cup'))).toEqual({ ok: false, error: 'invalid-amount' });
    },
  );

  it('rejects an amount above the maximum', () => {
    expect(parseQuantity(draft('10000', 'cup'))).toEqual({ ok: false, error: 'amount-too-large' });
  });

  it('requires a unit when there is an amount', () => {
    expect(parseQuantity(draft('2', undefined))).toEqual({ ok: false, error: 'unit-required' });
  });

  it('requires an amount for units that take one', () => {
    expect(parseQuantity(draft('', 'cup'))).toEqual({ ok: false, error: 'amount-required' });
  });

  it('validates the new countable unit like other amount-bearing units', () => {
    expect(parseQuantity(draft('2', 'unit'))).toEqual({
      ok: true,
      value: { amount: 2, unit: 'unit' },
    });
    expect(parseQuantity(draft('0.5', 'unit'))).toEqual({
      ok: true,
      value: { amount: 0.5, unit: 'unit' },
    });
    expect(parseQuantity(draft('', 'unit'))).toEqual({ ok: false, error: 'amount-required' });
    expect(parseQuantity(draft('0', 'unit'))).toEqual({ ok: false, error: 'invalid-amount' });
    expect(parseQuantity(draft('10000', 'unit'))).toEqual({
      ok: false,
      error: 'amount-too-large',
    });
    expect(parseQuantity(draft('2', 'whole'))).toEqual({
      ok: true,
      value: { amount: 2, unit: 'whole' },
    });
  });

  it('accepts units without an amount and rejects an amount for them', () => {
    expect(parseQuantity(draft('', 'to-taste'))).toEqual({ ok: true, value: { unit: 'to-taste' } });
    expect(parseQuantity(draft('', 'a-bit'))).toEqual({ ok: true, value: { unit: 'a-bit' } });
    expect(parseQuantity(draft('2', 'to-taste'))).toEqual({
      ok: false,
      error: 'amount-not-allowed',
    });
  });
});
