import { PersistenceError } from '../../../shared/errors/persistence-error';
import type { QuantityDraft } from '../domain/quantity';
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
    expect(await service.setCompleted('missing', true)).toBeUndefined();
    expect(store.items.size).toBe(0);
  });

  it('reports the updated item only when completion actually changes', async () => {
    const { service } = setup();
    const added = await service.addItem('Milk');
    if (!added.ok) throw new Error('expected item to be added');

    expect(await service.setCompleted(added.value.id, false)).toBeUndefined();
    expect(await service.setCompleted(added.value.id, true)).toMatchObject({
      name: 'Milk',
      completed: true,
    });
    expect(await service.setCompleted(added.value.id, true)).toBeUndefined();
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
