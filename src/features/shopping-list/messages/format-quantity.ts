import type { Quantity } from '../domain/quantity';
import type { ShoppingListMessages } from './types';

/** Text such as "500 grams" or "to taste", or `undefined` when there is no quantity. */
export function formatQuantity(
  quantity: Quantity,
  units: ShoppingListMessages['units'],
): string | undefined {
  const { amount, unit } = quantity;
  if (unit === undefined) {
    return undefined;
  }
  const label = units[unit];
  if (amount === undefined) {
    return label.singular;
  }
  return `${String(amount)} ${amount === 1 ? label.singular : label.plural}`;
}
