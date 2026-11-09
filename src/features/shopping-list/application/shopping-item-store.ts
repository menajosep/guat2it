import type { ShoppingItem } from '../domain/shopping-item';
import type { Category } from '../domain/category';
import type { Result } from '../../../shared/types/result';

/** Storage port for shopping items. Implementations throw `PersistenceError` on failure. */
export interface ShoppingItemStore {
  getSnapshot(): Promise<{ items: ShoppingItem[]; categories: Category[] }>;
  getAll(): Promise<ShoppingItem[]>;
  get(id: string): Promise<ShoppingItem | undefined>;
  save(item: ShoppingItem): Promise<Result<void, 'missing-category'>>;
  remove(id: string): Promise<void>;
  /** Removes all the given items or none of them. */
  removeMany(ids: readonly string[]): Promise<void>;
  getCategories(): Promise<Category[]>;
  saveCategory(
    category: Category,
    create: boolean,
  ): Promise<Result<Category | undefined, 'duplicate'>>;
  deleteCategory(id: string): Promise<Result<Category | undefined, 'in-use'>>;
}
