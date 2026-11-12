import { PersistenceError, type PersistenceAction } from '../../../shared/errors/persistence-error';
import type { AppDatabase } from '../../../infrastructure/persistence/app-database';
import type { ShoppingItemStore } from '../application/shopping-item-store';
import type { ShoppingItem } from '../domain/shopping-item';
import { categoryNameKey, type Category } from '../domain/category';
import { fail, ok, type Result } from '../../../shared/types/result';

const ACTION_DESCRIPTIONS: Record<PersistenceAction, string> = {
  'load-list': 'load the shopping list',
  'read-item': 'read the item',
  'save-item': 'save the item',
  'remove-item': 'remove the item',
  'remove-items': 'remove the items',
  'load-categories': 'load categories',
  'save-category': 'save the category',
  'remove-category': 'remove the category',
  'load-recipes': 'load recipes',
  'read-recipe': 'read the recipe',
  'save-recipe': 'save the recipe',
  'update-recipe': 'update the recipe',
  'remove-recipe': 'remove the recipe',
  'load-weekly-menus': 'load weekly menus',
  'save-weekly-menu': 'save the weekly menu',
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

  getSnapshot(): Promise<{ items: ShoppingItem[]; categories: Category[] }> {
    return guard('load-list', () =>
      this.db.transaction('r', this.db.shoppingItems, this.db.categories, async () => ({
        items: await this.db.shoppingItems.toArray(),
        categories: await this.db.categories.toArray(),
      })),
    );
  }

  getAll(): Promise<ShoppingItem[]> {
    return guard('load-list', () => this.db.shoppingItems.toArray());
  }

  get(id: string): Promise<ShoppingItem | undefined> {
    return guard('read-item', () => this.db.shoppingItems.get(id));
  }

  save(item: ShoppingItem): Promise<Result<void, 'missing-category'>> {
    return guard('save-item', () =>
      this.db.transaction('rw', this.db.shoppingItems, this.db.categories, async () => {
        const ids = item.categoryIds ?? [];
        const categories = await this.db.categories.bulkGet([...ids]);
        if (categories.some((category) => category === undefined)) return fail('missing-category');
        await this.db.shoppingItems.put(item);
        return ok(undefined);
      }),
    );
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

  getCategories(): Promise<Category[]> {
    return guard('load-categories', () => this.db.categories.toArray());
  }

  saveCategory(
    category: Category,
    create: boolean,
  ): Promise<Result<Category | undefined, 'duplicate'>> {
    return guard('save-category', () =>
      this.db.transaction('rw', this.db.categories, async () => {
        const categories = await this.db.categories.toArray();
        const previous = categories.find((entry) => entry.id === category.id);
        if (!create && !previous) return ok(undefined);
        if (
          categories.some(
            (entry) =>
              entry.id !== category.id &&
              categoryNameKey(entry.name) === categoryNameKey(category.name),
          )
        )
          return fail('duplicate');
        if (previous?.name === category.name) return ok(undefined);
        await this.db.categories.put(category);
        return ok(category);
      }),
    );
  }

  deleteCategory(id: string): Promise<Result<Category | undefined, 'in-use'>> {
    return guard('remove-category', () =>
      this.db.transaction('rw', this.db.categories, this.db.shoppingItems, async () => {
        const category = await this.db.categories.get(id);
        if (!category) return ok(undefined);
        const items = await this.db.shoppingItems.toArray();
        if (items.some((item) => item.categoryIds?.includes(id))) return fail('in-use');
        await this.db.categories.delete(id);
        return ok(category);
      }),
    );
  }
}
