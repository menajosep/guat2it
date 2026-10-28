import { AppDatabase } from '../../../infrastructure/persistence/app-database';
import { PersistenceError } from '../../../shared/errors/persistence-error';
import type { ShoppingItem } from '../domain/shopping-item';
import { DexieShoppingItemStore } from './dexie-shopping-item-store';

let counter = 0;
const uniqueName = () => `test-db-${String(++counter)}`;

const milk: ShoppingItem = {
  id: 'milk',
  name: 'Milk',
  completed: false,
  createdAt: new Date('2026-01-01T10:00:00Z'),
};

describe('DexieShoppingItemStore', () => {
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

  it('reports storage failures as PersistenceError', async () => {
    const db = new AppDatabase(uniqueName());
    const store = new DexieShoppingItemStore(db);
    await db.open();
    db.close();

    await expect(store.getAll()).rejects.toBeInstanceOf(PersistenceError);
    await expect(store.save(milk)).rejects.toBeInstanceOf(PersistenceError);
  });
});
