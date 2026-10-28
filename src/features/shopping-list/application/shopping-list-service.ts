import { ok, type Result } from '../../../shared/types/result';
import {
  createShoppingItem,
  sortByCreation,
  withCompleted,
  withDetails,
  type ItemErrors,
  type ShoppingItem,
} from '../domain/shopping-item';
import { EMPTY_QUANTITY_DRAFT, type QuantityDraft } from '../domain/quantity';
import type { ShoppingItemStore } from './shopping-item-store';

export interface ShoppingListDependencies {
  store: ShoppingItemStore;
  generateId: () => string;
  now: () => Date;
}

export interface UpdateChange {
  previous: ShoppingItem;
  item: ShoppingItem;
}

export class ShoppingListService {
  constructor(private readonly deps: ShoppingListDependencies) {}

  async list(): Promise<ShoppingItem[]> {
    return sortByCreation(await this.deps.store.getAll());
  }

  async addItem(
    rawName: string,
    quantity: QuantityDraft = EMPTY_QUANTITY_DRAFT,
  ): Promise<Result<ShoppingItem, ItemErrors>> {
    const created = createShoppingItem(rawName, this.deps.generateId(), this.deps.now(), quantity);
    if (created.ok) {
      await this.deps.store.save(created.value);
    }
    return created;
  }

  /**
   * Returns the updated item, or `undefined` when nothing changed: setting the state an item
   * already has is a no-op and an unknown id is ignored.
   */
  async setCompleted(id: string, completed: boolean): Promise<ShoppingItem | undefined> {
    const item = await this.deps.store.get(id);
    if (!item || item.completed === completed) {
      return undefined;
    }
    const updated = withCompleted(item, completed);
    await this.deps.store.save(updated);
    return updated;
  }

  /** Returns the removed item, or `undefined` when the id is unknown. */
  async removeItem(id: string): Promise<ShoppingItem | undefined> {
    const item = await this.deps.store.get(id);
    if (!item) {
      return undefined;
    }
    await this.deps.store.remove(id);
    return item;
  }

  /**
   * Changes the name, amount and unit of an item. The value is `undefined` when nothing changed:
   * unknown id, or the validated details equal the stored ones.
   */
  async updateItem(
    id: string,
    rawName: string,
    quantity: QuantityDraft,
  ): Promise<Result<UpdateChange | undefined, ItemErrors>> {
    const item = await this.deps.store.get(id);
    if (!item) {
      return ok(undefined);
    }
    const updated = withDetails(item, rawName, quantity);
    if (!updated.ok) {
      return updated;
    }
    const next = updated.value;
    if (next.name === item.name && next.amount === item.amount && next.unit === item.unit) {
      return ok(undefined);
    }
    await this.deps.store.save(next);
    return ok({ previous: item, item: next });
  }
}
