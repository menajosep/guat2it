import type { Result } from '../../../shared/types/result';
import {
  createShoppingItem,
  sortByCreation,
  withCompleted,
  type ItemNameError,
  type ShoppingItem,
} from '../domain/shopping-item';
import type { ShoppingItemStore } from './shopping-item-store';

export interface ShoppingListDependencies {
  store: ShoppingItemStore;
  generateId: () => string;
  now: () => Date;
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

  /** Setting the state an item already has is a no-op; an unknown id is ignored. */
  async setCompleted(id: string, completed: boolean): Promise<void> {
    const item = await this.deps.store.get(id);
    if (item && item.completed !== completed) {
      await this.deps.store.save(withCompleted(item, completed));
    }
  }

  async removeItem(id: string): Promise<void> {
    await this.deps.store.remove(id);
  }
}
