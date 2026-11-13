import { fail, ok, type Result } from '../../../shared/types/result';
import { parseCategoryName, type Category, type CategoryNameError } from '../domain/category';
import {
  completedItems,
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

  async snapshot(): Promise<{ items: ShoppingItem[]; categories: Category[] }> {
    const snapshot = await this.deps.store.getSnapshot();
    return {
      items: sortByCreation(snapshot.items),
      categories: snapshot.categories.sort((a, b) => a.name.localeCompare(b.name)),
    };
  }

  async listCategories(): Promise<Category[]> {
    return (await this.deps.store.getCategories()).sort((a, b) => a.name.localeCompare(b.name));
  }

  async createCategory(rawName: string): Promise<Result<Category, CategoryNameError>> {
    const name = parseCategoryName(rawName);
    if (!name.ok) return name;
    const category = { id: this.deps.generateId(), name: name.value };
    const saved = await this.deps.store.saveCategory(category, true);
    if (!saved.ok) return saved;
    if (!saved.value) throw new Error('New category was not saved');
    return ok(saved.value);
  }

  async renameCategory(
    id: string,
    rawName: string,
  ): Promise<Result<Category | undefined, CategoryNameError>> {
    const name = parseCategoryName(rawName);
    if (!name.ok) return name;
    return this.deps.store.saveCategory({ id, name: name.value }, false);
  }

  async deleteCategory(id: string): Promise<Result<Category | undefined, 'in-use'>> {
    return this.deps.store.deleteCategory(id);
  }

  async addItem(
    rawName: string,
    quantity: QuantityDraft = EMPTY_QUANTITY_DRAFT,
    categoryIds: readonly string[] = [],
  ): Promise<Result<ShoppingItem, ItemErrors>> {
    const created = createShoppingItem(
      rawName,
      this.deps.generateId(),
      this.deps.now(),
      quantity,
      categoryIds,
    );
    if (created.ok) {
      const saved = await this.deps.store.save(created.value);
      if (!saved.ok) return fail({ categories: saved.error });
    }
    return created;
  }

  /**
   * Returns the updated item, or `undefined` when nothing changed: setting the state an item
   * already has is a no-op and an unknown id is ignored.
   */
  async setCompleted(
    id: string,
    completed: boolean,
    expected?: ShoppingItem,
  ): Promise<Result<ShoppingItem | undefined, 'missing-category' | 'conflict'>> {
    if (expected && expected.id !== id) return fail('conflict');
    const item = expected ?? (await this.deps.store.get(id));
    if (!item || item.completed === completed) {
      return ok(undefined);
    }
    const updated = withCompleted(item, completed);
    const saved = await this.deps.store.saveIfUnchanged(updated, item);
    if (!saved.ok) return saved;
    return ok(updated);
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

  /** Removes every stored completed item at once and returns them (empty when there were none). */
  async clearCompleted(): Promise<ShoppingItem[]> {
    const completed = completedItems(sortByCreation(await this.deps.store.getAll()));
    if (completed.length > 0) {
      await this.deps.store.removeMany(completed.map((item) => item.id));
    }
    return completed;
  }

  /**
   * Changes the name, amount and unit of an item. The value is `undefined` when nothing changed:
   * unknown id, or the validated details equal the stored ones.
   */
  async updateItem(
    id: string,
    rawName: string,
    quantity: QuantityDraft,
    categoryIds?: readonly string[],
    expected?: ShoppingItem,
  ): Promise<Result<UpdateChange | undefined, ItemErrors>> {
    if (expected && expected.id !== id) return fail({ conflict: true });
    const item = expected ?? (await this.deps.store.get(id));
    if (!item) {
      return ok(undefined);
    }
    const updated = withDetails(item, rawName, quantity, categoryIds);
    if (!updated.ok) {
      return updated;
    }
    const next = updated.value;
    const oldIds = item.categoryIds ?? [];
    const newIds = next.categoryIds ?? [];
    if (
      next.name === item.name &&
      next.amount === item.amount &&
      next.unit === item.unit &&
      oldIds.length === newIds.length &&
      oldIds.every((id) => newIds.includes(id))
    ) {
      return ok(undefined);
    }
    const saved = await this.deps.store.saveIfUnchanged(next, item);
    if (!saved.ok) {
      return saved.error === 'conflict'
        ? fail({ conflict: true })
        : fail({ categories: saved.error });
    }
    return ok({ previous: item, item: next });
  }
}
