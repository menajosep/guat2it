import { formatQuantity, parseQuantity, type QuantityDraft } from './quantity';

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

  it('accepts units without an amount and rejects an amount for them', () => {
    expect(parseQuantity(draft('', 'to-taste'))).toEqual({ ok: true, value: { unit: 'to-taste' } });
    expect(parseQuantity(draft('', 'a-bit'))).toEqual({ ok: true, value: { unit: 'a-bit' } });
    expect(parseQuantity(draft('2', 'to-taste'))).toEqual({
      ok: false,
      error: 'amount-not-allowed',
    });
  });
});

describe('formatQuantity', () => {
  it('uses the singular for 1 and the plural otherwise', () => {
    expect(formatQuantity({ amount: 1, unit: 'cup' })).toBe('1 cup');
    expect(formatQuantity({ amount: 2, unit: 'cup' })).toBe('2 cups');
    expect(formatQuantity({ amount: 0.5, unit: 'teaspoon' })).toBe('0.5 teaspoons');
    expect(formatQuantity({ amount: 500, unit: 'gram' })).toBe('500 grams');
    expect(formatQuantity({ amount: 2, unit: 'leaf' })).toBe('2 leaves');
  });

  it('shows units without an amount as their label', () => {
    expect(formatQuantity({ unit: 'to-taste' })).toBe('to taste');
  });

  it('returns undefined when there is no unit', () => {
    expect(formatQuantity({})).toBeUndefined();
  });
});
