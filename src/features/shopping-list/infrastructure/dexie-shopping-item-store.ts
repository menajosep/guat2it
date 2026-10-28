import { PersistenceError } from '../../../shared/errors/persistence-error';
import type { AppDatabase } from '../../../infrastructure/persistence/app-database';
import type { ShoppingItemStore } from '../application/shopping-item-store';
import type { ShoppingItem } from '../domain/shopping-item';

async function guard<T>(action: string, operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    throw new PersistenceError(`Could not ${action} because local storage failed.`, {
      cause: error,
    });
  }
}

export class DexieShoppingItemStore implements ShoppingItemStore {
  constructor(private readonly db: AppDatabase) {}

  getAll(): Promise<ShoppingItem[]> {
    return guard('load the shopping list', () => this.db.shoppingItems.toArray());
  }

  get(id: string): Promise<ShoppingItem | undefined> {
    return guard('read the item', () => this.db.shoppingItems.get(id));
  }

  save(item: ShoppingItem): Promise<void> {
    return guard('save the item', async () => {
      await this.db.shoppingItems.put(item);
    });
  }

  remove(id: string): Promise<void> {
    return guard('remove the item', () => this.db.shoppingItems.delete(id));
  }

  removeMany(ids: readonly string[]): Promise<void> {
    return guard('remove the items', () =>
      this.db.transaction('rw', this.db.shoppingItems, () =>
        this.db.shoppingItems.bulkDelete([...ids]),
      ),
    );
  }
}
