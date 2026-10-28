import { fail, ok, type Result } from '../../../shared/types/result';
import { UNITS, type UnitId } from './units';

export const MAX_AMOUNT = 9999.99;

export type QuantityError =
  | 'invalid-amount'
  | 'amount-too-large'
  | 'unit-required'
  | 'amount-required'
  | 'amount-not-allowed';

/** What the user typed: the amount as text and the chosen unit, if any. */
export interface QuantityDraft {
  readonly amount: string;
  readonly unit: UnitId | undefined;
}

/** The validated quantity as stored on an item; both fields are absent when none was given. */
export interface Quantity {
  readonly amount?: number;
  readonly unit?: UnitId;
}

export const EMPTY_QUANTITY_DRAFT: QuantityDraft = { amount: '', unit: undefined };

const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/;

function parseAmount(raw: string): Result<number, 'invalid-amount' | 'amount-too-large'> {
  const text = raw.trim().replace(',', '.');
  if (!AMOUNT_PATTERN.test(text)) {
    return fail('invalid-amount');
  }
  const amount = Number(text);
  if (amount <= 0) {
    return fail('invalid-amount');
  }
  if (amount > MAX_AMOUNT) {
    return fail('amount-too-large');
  }
  return ok(amount);
}

/** Checks the amount and unit together: an amount needs a unit and most units need an amount. */
export function parseQuantity(draft: QuantityDraft): Result<Quantity, QuantityError> {
  const hasAmount = draft.amount.trim().length > 0;
  const { unit } = draft;

  if (unit === undefined) {
    return hasAmount ? fail('unit-required') : ok({});
  }
  if (!UNITS[unit].takesAmount) {
    return hasAmount ? fail('amount-not-allowed') : ok({ unit });
  }
  if (!hasAmount) {
    return fail('amount-required');
  }
  const amount = parseAmount(draft.amount);
  return amount.ok ? ok({ amount: amount.value, unit }) : amount;
}

/** Text such as "500 grams" or "to taste", or `undefined` when there is no quantity. */
export function formatQuantity(quantity: Quantity): string | undefined {
  const { amount, unit } = quantity;
  if (unit === undefined) {
    return undefined;
  }
  const definition = UNITS[unit];
  if (amount === undefined) {
    return definition.singular;
  }
  return `${String(amount)} ${amount === 1 ? definition.singular : definition.plural}`;
}

/** Text to prefill the amount field with. */
export function amountToText(quantity: Quantity): string {
  return quantity.amount === undefined ? '' : String(quantity.amount);
}
