import { fail, ok, type Result } from '../../../shared/types/result';

export const MAX_ITEM_NAME_LENGTH = 100;

export type ItemNameError = 'empty' | 'too-long';

export interface ShoppingItem {
  readonly id: string;
  readonly name: string;
  readonly completed: boolean;
  readonly createdAt: Date;
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

export function createShoppingItem(
  rawName: string,
  id: string,
  createdAt: Date,
): Result<ShoppingItem, ItemNameError> {
  const name = parseItemName(rawName);
  if (!name.ok) {
    return name;
  }
  return ok({ id, name: name.value, completed: false, createdAt });
}

/** Replaces the name after validating it; every other field is kept. */
export function withName(item: ShoppingItem, rawName: string): Result<ShoppingItem, ItemNameError> {
  const name = parseItemName(rawName);
  if (!name.ok) {
    return name;
  }
  return ok({ ...item, name: name.value });
}

export function withCompleted(item: ShoppingItem, completed: boolean): ShoppingItem {
  return { ...item, completed };
}

export function completedItems(items: readonly ShoppingItem[]): ShoppingItem[] {
  return items.filter((item) => item.completed);
}

export function sortByCreation(items: readonly ShoppingItem[]): ShoppingItem[] {
  return [...items].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}
