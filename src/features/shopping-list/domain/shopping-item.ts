import { fail, ok, type Result } from '../../../shared/types/result';
import {
  EMPTY_QUANTITY_DRAFT,
  parseQuantity,
  type Quantity,
  type QuantityDraft,
  type QuantityError,
} from './quantity';
import type { UnitId } from './units';

export const MAX_ITEM_NAME_LENGTH = 100;

export type ItemNameError = 'empty' | 'too-long';

export interface ShoppingItem {
  readonly id: string;
  readonly name: string;
  readonly completed: boolean;
  readonly createdAt: Date;
  readonly amount?: number;
  readonly unit?: UnitId;
}

/** Validation problems per field; a field is absent when it is valid. */
export interface ItemErrors {
  readonly name?: ItemNameError;
  readonly quantity?: QuantityError;
}

/** Trims the name and checks it is non-empty and within the length limit. */
export function parseItemName(raw: string): Result<string, ItemNameError> {
  const name = raw.trim();
  if (name.length === 0) {
    return fail('empty');
  }
  if (name.length > MAX_ITEM_NAME_LENGTH) {
    return fail('too-long');
  }
  return ok(name);
}

function parseDetails(
  rawName: string,
  quantityDraft: QuantityDraft,
): Result<{ name: string; quantity: Quantity }, ItemErrors> {
  const name = parseItemName(rawName);
  const quantity = parseQuantity(quantityDraft);
  if (name.ok && quantity.ok) {
    return ok({ name: name.value, quantity: quantity.value });
  }
  return fail({
    ...(name.ok ? {} : { name: name.error }),
    ...(quantity.ok ? {} : { quantity: quantity.error }),
  });
}

export function createShoppingItem(
  rawName: string,
  id: string,
  createdAt: Date,
  quantityDraft: QuantityDraft = EMPTY_QUANTITY_DRAFT,
): Result<ShoppingItem, ItemErrors> {
  const details = parseDetails(rawName, quantityDraft);
  if (!details.ok) {
    return details;
  }
  return ok({
    id,
    name: details.value.name,
    completed: false,
    createdAt,
    ...details.value.quantity,
  });
}

/**
 * Replaces the name, amount and unit after validating them; id, completion state and creation
 * time are kept. A cleared amount or unit is removed from the item.
 */
export function withDetails(
  item: ShoppingItem,
  rawName: string,
  quantityDraft: QuantityDraft,
): Result<ShoppingItem, ItemErrors> {
  const details = parseDetails(rawName, quantityDraft);
  if (!details.ok) {
    return details;
  }
  return ok({
    id: item.id,
    name: details.value.name,
    completed: item.completed,
    createdAt: item.createdAt,
    ...details.value.quantity,
  });
}

export function withCompleted(item: ShoppingItem, completed: boolean): ShoppingItem {
  return { ...item, completed };
}

export function sortByCreation(items: readonly ShoppingItem[]): ShoppingItem[] {
  return [...items].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}
