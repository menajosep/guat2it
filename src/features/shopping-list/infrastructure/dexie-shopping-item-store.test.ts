import { AppDatabase } from '../../../infrastructure/persistence/app-database';
import { PersistenceError } from '../../../shared/errors/persistence-error';
import type { ShoppingItem } from '../domain/shopping-item';
import { DexieShoppingItemStore } from './dexie-shopping-item-store';
import Dexie from 'dexie';

let counter = 0;
const uniqueName = () => `test-db-${String(++counter)}`;

const milk: ShoppingItem = {
  id: 'milk',
  name: 'Milk',
  completed: false,
  createdAt: new Date('2026-01-01T10:00:00Z'),
};

describe('DexieShoppingItemStore', () => {
  it('upgrades a version 1 database without changing existing items', async () => {
    const name = uniqueName();
    const old = new Dexie(name);
    old.version(1).stores({ shoppingItems: 'id, createdAt' });
    await old.table('shoppingItems').add({ ...milk, amount: 2, unit: 'liter', completed: true });
    old.close();
    const db = new AppDatabase(name);
    const store = new DexieShoppingItemStore(db);
    expect(await store.getAll()).toEqual([{ ...milk, amount: 2, unit: 'liter', completed: true }]);
    expect(await store.getCategories()).toEqual([]);
    db.close();
  });

  it('persists categories, enforces unique names and rejects deletion while assigned', async () => {
    const name = uniqueName();
    const db = new AppDatabase(name);
    const store = new DexieShoppingItemStore(db);
    const category = { id: 'shop', name: 'Shop' };
    expect(await store.saveCategory(category, true)).toEqual({ ok: true, value: category });
    expect(await store.saveCategory({ id: 'other', name: 'SHOP' }, true)).toEqual({
      ok: false,
      error: 'duplicate',
    });
    expect(await store.save({ ...milk, categoryIds: ['shop'] })).toEqual({
      ok: true,
      value: undefined,
    });
    expect(await store.deleteCategory('shop')).toEqual({ ok: false, error: 'in-use' });
    db.close();
    const reopened = new DexieShoppingItemStore(new AppDatabase(name));
    expect(await reopened.getCategories()).toEqual([category]);
    expect((await reopened.get('milk'))?.categoryIds).toEqual(['shop']);
    await reopened.remove('milk');
    expect(await reopened.deleteCategory('shop')).toEqual({ ok: true, value: category });
    expect(await reopened.save({ ...milk, categoryIds: ['shop'] })).toEqual({
      ok: false,
      error: 'missing-category',
    });
  });

  it('keeps references valid when category deletion races assignment', async () => {
    const name = uniqueName();
    const first = new DexieShoppingItemStore(new AppDatabase(name));
    const second = new DexieShoppingItemStore(new AppDatabase(name));
    await first.saveCategory({ id: 'shop', name: 'Shop' }, true);
    const [saved, deleted] = await Promise.all([
      first.save({ ...milk, categoryIds: ['shop'] }),
      second.deleteCategory('shop'),
    ]);
    expect(saved.ok && deleted.ok).toBe(false);
    const categories = await first.getCategories();
    const items = await first.getAll();
    expect(
      items.every((item) =>
        (item.categoryIds ?? []).every((id) => categories.some((category) => category.id === id)),
      ),
    ).toBe(true);
  });

  it('saves, reads, updates and removes items', async () => {
    const store = new DexieShoppingItemStore(new AppDatabase(uniqueName()));

    await store.save(milk);
    expect(await store.get('milk')).toEqual(milk);

    await store.save({ ...milk, completed: true });
    expect(await store.getAll()).toEqual([{ ...milk, completed: true }]);

    await store.remove('milk');
    expect(await store.getAll()).toEqual([]);
    expect(await store.get('milk')).toBeUndefined();
  });

  it('keeps data across database connections with the same name', async () => {
    const name = uniqueName();
    const first = new AppDatabase(name);
    await new DexieShoppingItemStore(first).save(milk);
    first.close();

    const reopened = new DexieShoppingItemStore(new AppDatabase(name));
    expect(await reopened.getAll()).toEqual([milk]);
  });

  it('keeps a renamed item under the same id and persists the new name', async () => {
    const name = uniqueName();
    const first = new AppDatabase(name);
    const store = new DexieShoppingItemStore(first);
    await store.save(milk);
    await store.save({ ...milk, name: 'Oat milk' });
    first.close();

    const reopened = new DexieShoppingItemStore(new AppDatabase(name));
    expect(await reopened.getAll()).toEqual([{ ...milk, name: 'Oat milk' }]);
  });

  it('removes only the given items in one operation', async () => {
    const store = new DexieShoppingItemStore(new AppDatabase(uniqueName()));
    const bread: ShoppingItem = { ...milk, id: 'bread', name: 'Bread' };
    const eggs: ShoppingItem = { ...milk, id: 'eggs', name: 'Eggs' };
    await store.save(milk);
    await store.save(bread);
    await store.save(eggs);

    await store.removeMany(['milk', 'eggs', 'unknown']);
    expect(await store.getAll()).toEqual([bread]);

    await store.removeMany([]);
    expect(await store.getAll()).toEqual([bread]);
  });

  it('persists amount and unit, and drops them when cleared', async () => {
    const name = uniqueName();
    const first = new AppDatabase(name);
    const store = new DexieShoppingItemStore(first);
    const flour: ShoppingItem = { ...milk, id: 'flour', name: 'Flour', amount: 500, unit: 'gram' };
    await store.save(flour);
    first.close();

    const reopenedDb = new AppDatabase(name);
    const reopened = new DexieShoppingItemStore(reopenedDb);
    expect(await reopened.get('flour')).toEqual(flour);

    await reopened.save(milk);
    await reopened.save({ ...milk, id: 'flour', name: 'Flour' });
    const cleared = await reopened.get('flour');
    expect(cleared).toBeDefined();
    expect(cleared && 'amount' in cleared).toBe(false);
    expect(cleared && 'unit' in cleared).toBe(false);
  });

  it('loads items stored without amount and unit unchanged', async () => {
    const db = new AppDatabase(uniqueName());
    await db.shoppingItems.add(milk);
    expect(await new DexieShoppingItemStore(db).get('milk')).toEqual(milk);
  });

  it('reports storage failures as PersistenceError', async () => {
    const db = new AppDatabase(uniqueName());
    const store = new DexieShoppingItemStore(db);
    await db.open();
    db.close();

    await expect(store.getAll()).rejects.toBeInstanceOf(PersistenceError);
    await expect(store.save(milk)).rejects.toBeInstanceOf(PersistenceError);
    await expect(store.removeMany(['milk'])).rejects.toBeInstanceOf(PersistenceError);
    await expect(store.getCategories()).rejects.toBeInstanceOf(PersistenceError);
    await expect(store.saveCategory({ id: 'a', name: 'Shop' }, true)).rejects.toBeInstanceOf(
      PersistenceError,
    );
    await expect(store.deleteCategory('a')).rejects.toBeInstanceOf(PersistenceError);
  });
});
