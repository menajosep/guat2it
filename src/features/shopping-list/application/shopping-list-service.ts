import { ok, type Result } from '../../../shared/types/result';
import {
  createShoppingItem,
  sortByCreation,
  withCompleted,
  withName,
  type ItemNameError,
  type ShoppingItem,
} from '../domain/shopping-item';
import type { ShoppingItemStore } from './shopping-item-store';

export interface ShoppingListDependencies {
  store: ShoppingItemStore;
  generateId: () => string;
  now: () => Date;
}

export interface RenameChange {
  previous: ShoppingItem;
  item: ShoppingItem;
}

export class ShoppingListService {
  constructor(private readonly deps: ShoppingListDependencies) {}

  async list(): Promise<ShoppingItem[]> {
    return sortByCreation(await this.deps.store.getAll());
  }

  async addItem(rawName: string): Promise<Result<ShoppingItem, ItemNameError>> {
    const created = createShoppingItem(rawName, this.deps.generateId(), this.deps.now());
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

  /** The value is `undefined` when nothing changed: unknown id or the name is already the same. */
  async renameItem(
    id: string,
    rawName: string,
  ): Promise<Result<RenameChange | undefined, ItemNameError>> {
    const item = await this.deps.store.get(id);
    if (!item) {
      return ok(undefined);
    }
    const renamed = withName(item, rawName);
    if (!renamed.ok) {
      return renamed;
    }
    if (renamed.value.name === item.name) {
      return ok(undefined);
    }
    await this.deps.store.save(renamed.value);
    return ok({ previous: item, item: renamed.value });
  }
}
