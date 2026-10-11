import type { ShoppingItem } from '../domain/shopping-item';

/** Storage port for shopping items. Implementations throw `PersistenceError` on failure. */
export interface ShoppingItemStore {
  getAll(): Promise<ShoppingItem[]>;
  get(id: string): Promise<ShoppingItem | undefined>;
  save(item: ShoppingItem): Promise<void>;
  remove(id: string): Promise<void>;
}
