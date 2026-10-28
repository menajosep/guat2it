import { PersistenceError, type PersistenceAction } from '../../../shared/errors/persistence-error';
import type { AppDatabase } from '../../../infrastructure/persistence/app-database';
import type { ShoppingItemStore } from '../application/shopping-item-store';
import type { ShoppingItem } from '../domain/shopping-item';

const ACTION_DESCRIPTIONS: Record<PersistenceAction, string> = {
  'load-list': 'load the shopping list',
  'read-item': 'read the item',
  'save-item': 'save the item',
  'remove-item': 'remove the item',
  'remove-items': 'remove the items',
};

async function guard<T>(action: PersistenceAction, operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    throw new PersistenceError(
      `Could not ${ACTION_DESCRIPTIONS[action]} because local storage failed.`,
      { cause: error, action },
    );
  }
}

export class DexieShoppingItemStore implements ShoppingItemStore {
  constructor(private readonly db: AppDatabase) {}

  getAll(): Promise<ShoppingItem[]> {
    return guard('load-list', () => this.db.shoppingItems.toArray());
  }

  get(id: string): Promise<ShoppingItem | undefined> {
    return guard('read-item', () => this.db.shoppingItems.get(id));
  }

  save(item: ShoppingItem): Promise<void> {
    return guard('save-item', async () => {
      await this.db.shoppingItems.put(item);
    });
  }

  remove(id: string): Promise<void> {
    return guard('remove-item', () => this.db.shoppingItems.delete(id));
  }

  removeMany(ids: readonly string[]): Promise<void> {
    return guard('remove-items', () =>
      this.db.transaction('rw', this.db.shoppingItems, () =>
        this.db.shoppingItems.bulkDelete([...ids]),
      ),
    );
  }
}
