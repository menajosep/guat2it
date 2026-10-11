import { PersistenceError } from '../../../shared/errors/persistence-error';
import type { ShoppingItem } from '../domain/shopping-item';
import type { ShoppingItemStore } from './shopping-item-store';
import { ShoppingListService } from './shopping-list-service';

class InMemoryStore implements ShoppingItemStore {
  readonly items = new Map<string, ShoppingItem>();
  failWith: Error | null = null;

  private check(): void {
    if (this.failWith) {
      throw this.failWith;
    }
  }

  getAll(): Promise<ShoppingItem[]> {
    this.check();
    return Promise.resolve([...this.items.values()]);
  }
  get(id: string): Promise<ShoppingItem | undefined> {
    this.check();
    return Promise.resolve(this.items.get(id));
  }
  save(item: ShoppingItem): Promise<void> {
    this.check();
    this.items.set(item.id, item);
    return Promise.resolve();
  }
  remove(id: string): Promise<void> {
    this.check();
    this.items.delete(id);
    return Promise.resolve();
  }
}

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
    expect(await service.addItem('   ')).toEqual({ ok: false, error: 'empty' });
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
    await service.setCompleted('missing', true);
    expect(store.items.size).toBe(0);
  });

  it('removes items', async () => {
    const { service } = setup();
    const added = await service.addItem('Milk');
    if (!added.ok) throw new Error('expected item to be added');

    await service.removeItem(added.value.id);
    expect(await service.list()).toEqual([]);
  });

  it('propagates persistence failures to the caller', async () => {
    const { service, store } = setup();
    store.failWith = new PersistenceError('storage down');

    await expect(service.list()).rejects.toThrow('storage down');
    await expect(service.addItem('Milk')).rejects.toBeInstanceOf(PersistenceError);
  });
});
