import { PersistenceError } from '../../../shared/errors/persistence-error';
import type { QuantityDraft } from '../domain/quantity';
import { sameShoppingItem, type ShoppingItem } from '../domain/shopping-item';
import type { ShoppingItemStore } from './shopping-item-store';
import { ShoppingListService } from './shopping-list-service';
import { categoryNameKey, type Category } from '../domain/category';
import { fail, ok, type Result } from '../../../shared/types/result';

class InMemoryStore implements ShoppingItemStore {
  readonly items = new Map<string, ShoppingItem>();
  readonly categories = new Map<string, Category>();
  failWith: Error | null = null;

  private check(): void {
    if (this.failWith) {
      throw this.failWith;
    }
  }

  getSnapshot(): Promise<{ items: ShoppingItem[]; categories: Category[] }> {
    this.check();
    return Promise.resolve({
      items: [...this.items.values()],
      categories: [...this.categories.values()],
    });
  }

  getAll(): Promise<ShoppingItem[]> {
    this.check();
    return Promise.resolve([...this.items.values()]);
  }
  get(id: string): Promise<ShoppingItem | undefined> {
    this.check();
    return Promise.resolve(this.items.get(id));
  }
  save(item: ShoppingItem): Promise<Result<void, 'missing-category'>> {
    this.check();
    if (item.categoryIds?.some((id) => !this.categories.has(id))) {
      return Promise.resolve(fail('missing-category'));
    }
    this.items.set(item.id, item);
    return Promise.resolve(ok(undefined));
  }
  saveIfUnchanged(
    item: ShoppingItem,
    previous: ShoppingItem,
  ): Promise<Result<void, 'missing-category' | 'conflict'>> {
    this.check();
    const current = this.items.get(item.id);
    if (!current || !sameShoppingItem(current, previous)) return Promise.resolve(fail('conflict'));
    return this.save(item);
  }
  remove(id: string): Promise<void> {
    this.check();
    this.items.delete(id);
    return Promise.resolve();
  }
  removeMany(ids: readonly string[]): Promise<void> {
    this.check();
    ids.forEach((id) => this.items.delete(id));
    return Promise.resolve();
  }
  getCategories(): Promise<Category[]> {
    this.check();
    return Promise.resolve([...this.categories.values()]);
  }
  saveCategory(
    category: Category,
    create: boolean,
  ): Promise<Result<Category | undefined, 'duplicate'>> {
    this.check();
    const previous = this.categories.get(category.id);
    if (!create && !previous) return Promise.resolve(ok(undefined));
    if (
      [...this.categories.values()].some(
        (entry) =>
          entry.id !== category.id &&
          categoryNameKey(entry.name) === categoryNameKey(category.name),
      )
    )
      return Promise.resolve(fail('duplicate'));
    if (previous?.name === category.name) return Promise.resolve(ok(undefined));
    this.categories.set(category.id, category);
    return Promise.resolve(ok(category));
  }
  deleteCategory(id: string): Promise<Result<Category | undefined, 'in-use'>> {
    this.check();
    const category = this.categories.get(id);
    if ([...this.items.values()].some((item) => item.categoryIds?.includes(id)))
      return Promise.resolve(fail('in-use'));
    this.categories.delete(id);
    return Promise.resolve(ok(category));
  }
}

const NO_QUANTITY: QuantityDraft = { amount: '', unit: undefined };

function setup() {
  const store = new InMemoryStore();
  let counter = 0;
  const service = new ShoppingListService({
    store,
    generateId: () => `id-${String(++counter)}`,
    now: () => new Date(Date.UTC(2026, 0, 1, 0, 0, counter)),
  });
  return { store, service };
}

describe('ShoppingListService', () => {
  it('manages categories and rejects duplicates and categories in use', async () => {
    const { service } = setup();
    expect(await service.createCategory('  ')).toEqual({ ok: false, error: 'empty' });
    expect(await service.createCategory('x'.repeat(101))).toEqual({ ok: false, error: 'too-long' });
    const category = await service.createCategory(' Butchery ');
    if (!category.ok) throw new Error('expected category');
    expect(category.value.name).toBe('Butchery');
    expect(await service.createCategory('BUTCHERY')).toEqual({ ok: false, error: 'duplicate' });
    expect(await service.renameCategory(category.value.id, 'Butchery')).toEqual({
      ok: true,
      value: undefined,
    });
    const item = await service.addItem('Milk', NO_QUANTITY, [category.value.id, category.value.id]);
    if (!item.ok) throw new Error('expected item');
    expect(item.value.categoryIds).toEqual([category.value.id]);
    expect(await service.deleteCategory(category.value.id)).toEqual({ ok: false, error: 'in-use' });
    expect(await service.renameCategory(category.value.id, 'Shop')).toMatchObject({
      ok: true,
      value: { name: 'Shop' },
    });
    expect((await service.list())[0]?.categoryIds).toEqual([category.value.id]);
    expect(await service.updateItem(item.value.id, 'Milk', NO_QUANTITY, [])).toMatchObject({
      ok: true,
    });
    expect(await service.deleteCategory(category.value.id)).toMatchObject({
      ok: true,
      value: { name: 'Shop' },
    });
    expect(await service.deleteCategory(category.value.id)).toEqual({ ok: true, value: undefined });
    expect(await service.addItem('Bread', NO_QUANTITY, [category.value.id])).toEqual({
      ok: false,
      error: { categories: 'missing-category' },
    });
  });

  it('adds items and lists them in creation order', async () => {
    const { service } = setup();
    await service.addItem('Milk');
    await service.addItem('Bread');

    const items = await service.list();
    expect(items.map((i) => [i.name, i.completed])).toEqual([
      ['Milk', false],
      ['Bread', false],
    ]);
  });

  it('rejects invalid names without storing anything', async () => {
    const { service, store } = setup();
    expect(await service.addItem('   ')).toEqual({ ok: false, error: { name: 'empty' } });
    expect(store.items.size).toBe(0);
  });

  it('marks items completed and active again', async () => {
    const { service } = setup();
    const added = await service.addItem('Milk');
    if (!added.ok) throw new Error('expected item to be added');

    await service.setCompleted(added.value.id, true);
    expect((await service.list())[0]?.completed).toBe(true);

    await service.setCompleted(added.value.id, false);
    expect((await service.list())[0]?.completed).toBe(false);
  });

  it('ignores completion changes for unknown items', async () => {
    const { service, store } = setup();
    expect(await service.setCompleted('missing', true)).toEqual({ ok: true, value: undefined });
    expect(store.items.size).toBe(0);
  });

  it('reports the updated item only when completion actually changes', async () => {
    const { service } = setup();
    const added = await service.addItem('Milk');
    if (!added.ok) throw new Error('expected item to be added');

    expect(await service.setCompleted(added.value.id, false)).toEqual({
      ok: true,
      value: undefined,
    });
    expect(await service.setCompleted(added.value.id, true)).toMatchObject({
      ok: true,
      value: { name: 'Milk', completed: true },
    });
    expect(await service.setCompleted(added.value.id, true)).toEqual({
      ok: true,
      value: undefined,
    });
  });

  it('removes items and reports the removed one', async () => {
    const { service } = setup();
    const added = await service.addItem('Milk');
    if (!added.ok) throw new Error('expected item to be added');

    expect(await service.removeItem(added.value.id)).toMatchObject({ name: 'Milk' });
    expect(await service.list()).toEqual([]);
    expect(await service.removeItem(added.value.id)).toBeUndefined();
  });

  it('renames an item in place, keeping its state and position', async () => {
    const { service } = setup();
    const milk = await service.addItem('Milk');
    await service.addItem('Bread');
    if (!milk.ok) throw new Error('expected item to be added');
    await service.setCompleted(milk.value.id, true);

    const result = await service.updateItem(milk.value.id, ' Oat milk ', NO_QUANTITY);
    expect(result).toMatchObject({
      ok: true,
      value: { previous: { name: 'Milk' }, item: { name: 'Oat milk' } },
    });
    expect((await service.list()).map((i) => [i.name, i.completed])).toEqual([
      ['Oat milk', true],
      ['Bread', false],
    ]);
  });

  it('rejects invalid names when renaming and keeps the stored name', async () => {
    const { service } = setup();
    const milk = await service.addItem('Milk');
    if (!milk.ok) throw new Error('expected item to be added');

    expect(await service.updateItem(milk.value.id, '  ', NO_QUANTITY)).toEqual({
      ok: false,
      error: { name: 'empty' },
    });
    expect(await service.updateItem(milk.value.id, 'a'.repeat(101), NO_QUANTITY)).toEqual({
      ok: false,
      error: { name: 'too-long' },
    });
    expect((await service.list())[0]?.name).toBe('Milk');
  });

  it('treats unchanged details or an unknown id as nothing to update', async () => {
    const { service, store } = setup();
    const milk = await service.addItem('Milk');
    if (!milk.ok) throw new Error('expected item to be added');

    expect(await service.updateItem(milk.value.id, ' Milk ', NO_QUANTITY)).toEqual({
      ok: true,
      value: undefined,
    });
    expect(await service.updateItem('missing', 'Bread', NO_QUANTITY)).toEqual({
      ok: true,
      value: undefined,
    });
    expect(store.items.size).toBe(1);
  });

  it('clears completed items and keeps active ones in order', async () => {
    const { service } = setup();
    const milk = await service.addItem('Milk');
    await service.addItem('Bread');
    const eggs = await service.addItem('Eggs');
    if (!milk.ok || !eggs.ok) throw new Error('expected items to be added');
    await service.setCompleted(milk.value.id, true);
    await service.setCompleted(eggs.value.id, true);

    const cleared = await service.clearCompleted();
    expect(cleared.map((i) => i.name)).toEqual(['Milk', 'Eggs']);
    expect((await service.list()).map((i) => [i.name, i.completed])).toEqual([['Bread', false]]);
  });

  it('reports nothing cleared when no item is completed', async () => {
    const { service, store } = setup();
    expect(await service.clearCompleted()).toEqual([]);
    await service.addItem('Milk');
    expect(await service.clearCompleted()).toEqual([]);
    expect(store.items.size).toBe(1);
  });

  it('keeps every item when clearing completed items fails', async () => {
    const { service, store } = setup();
    const milk = await service.addItem('Milk');
    if (!milk.ok) throw new Error('expected item to be added');
    await service.setCompleted(milk.value.id, true);
    store.failWith = new PersistenceError('storage down');

    await expect(service.clearCompleted()).rejects.toBeInstanceOf(PersistenceError);
    store.failWith = null;
    expect(store.items.size).toBe(1);
  });

  it('adds an item with amount and unit', async () => {
    const { service, store } = setup();
    const added = await service.addItem('Flour', { amount: '500', unit: 'gram' });
    expect(added).toMatchObject({ ok: true, value: { name: 'Flour', amount: 500, unit: 'gram' } });
    expect(store.items.size).toBe(1);
  });

  it('rejects an invalid quantity without storing anything', async () => {
    const { service, store } = setup();
    expect(await service.addItem('Flour', { amount: '500', unit: undefined })).toEqual({
      ok: false,
      error: { quantity: 'unit-required' },
    });
    expect(store.items.size).toBe(0);
  });

  it('updates only the quantity and reports the change', async () => {
    const { service } = setup();
    const flour = await service.addItem('Flour', { amount: '500', unit: 'gram' });
    if (!flour.ok) throw new Error('expected item to be added');

    const result = await service.updateItem(flour.value.id, 'Flour', {
      amount: '2',
      unit: 'kilogram',
    });
    expect(result).toMatchObject({
      ok: true,
      value: {
        previous: { amount: 500, unit: 'gram' },
        item: { name: 'Flour', amount: 2, unit: 'kilogram' },
      },
    });
    expect((await service.list())[0]).toMatchObject({ amount: 2, unit: 'kilogram' });
  });

  it('clears the quantity', async () => {
    const { service, store } = setup();
    const flour = await service.addItem('Flour', { amount: '500', unit: 'gram' });
    if (!flour.ok) throw new Error('expected item to be added');

    await service.updateItem(flour.value.id, 'Flour', NO_QUANTITY);
    const stored = store.items.get(flour.value.id);
    expect(stored).toBeDefined();
    expect(stored && 'amount' in stored).toBe(false);
    expect(stored && 'unit' in stored).toBe(false);
  });

  it('treats an unchanged quantity as nothing to update', async () => {
    const { service } = setup();
    const flour = await service.addItem('Flour', { amount: '500', unit: 'gram' });
    if (!flour.ok) throw new Error('expected item to be added');

    expect(
      await service.updateItem(flour.value.id, 'Flour', { amount: '500,0', unit: 'gram' }),
    ).toEqual({
      ok: true,
      value: undefined,
    });
  });

  it('propagates persistence failures to the caller', async () => {
    const { service, store } = setup();
    const milk = await service.addItem('Milk');
    if (!milk.ok) throw new Error('expected item to be added');
    store.failWith = new PersistenceError('storage down');

    await expect(service.list()).rejects.toThrow('storage down');
    await expect(service.addItem('Bread')).rejects.toBeInstanceOf(PersistenceError);
    await expect(service.setCompleted(milk.value.id, true)).rejects.toBeInstanceOf(
      PersistenceError,
    );
    await expect(service.updateItem(milk.value.id, 'Oat milk', NO_QUANTITY)).rejects.toBeInstanceOf(
      PersistenceError,
    );
    await expect(service.removeItem(milk.value.id)).rejects.toBeInstanceOf(PersistenceError);
  });
});
