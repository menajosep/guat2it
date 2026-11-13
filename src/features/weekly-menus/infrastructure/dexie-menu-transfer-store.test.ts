import { AppDatabase } from '../../../infrastructure/persistence/app-database';
import { PersistenceError } from '../../../shared/errors/persistence-error';
import { ShoppingListService } from '../../shopping-list/application/shopping-list-service';
import { DexieShoppingItemStore } from '../../shopping-list/infrastructure/dexie-shopping-item-store';
import { DexieRecipeStore } from '../../recipes/infrastructure/dexie-recipe-store';
import { MenuTransferService } from '../application/menu-transfer-service';
import { DexieMenuAssignmentStore } from './dexie-menu-assignment-store';
import { DexieMenuTransferStore } from './dexie-menu-transfer-store';
import { DexieWeeklyMenuStore } from './dexie-weekly-menu-store';

let counter = 0;
const date = new Date('2026-01-01T00:00:00Z');

async function setup() {
  const name = `menu-transfer-${String(++counter)}`;
  const db = new AppDatabase(name);
  const other = new AppDatabase(name);
  await db.weeklyMenus.add({ id: 'm', name: 'Family', startDate: '2026-11-18', servings: 2 });
  await db.recipes.add({
    id: 'r',
    title: 'Soup',
    sourceUrl: 'https://example.com/recipe',
    yield: 2,
    ingredients: [{ name: 'Tomato', amount: 2, unit: 'unit' }],
    instructions: 'Cook.',
    imageUrl: 'https://example.com/image.jpg',
  });
  await db.menuAssignments.bulkAdd([
    { menuId: 'm', recipeId: 'r', dayOffset: 0, meal: 'lunch' },
    { menuId: 'm', recipeId: 'r', dayOffset: 1, meal: 'dinner' },
  ]);
  await db.categories.bulkAdd([
    { id: 'a', name: 'A' },
    { id: 'b', name: 'B' },
  ]);
  await db.shoppingItems.bulkAdd([
    {
      id: 'a',
      name: 'tomato',
      amount: 1,
      unit: 'unit',
      completed: false,
      createdAt: date,
      categoryIds: ['a'],
    },
    {
      id: 'b',
      name: 'Tomato',
      amount: 3,
      unit: 'unit',
      completed: false,
      createdAt: date,
      categoryIds: ['b'],
    },
    { id: 'c', name: 'tomato', amount: 9, unit: 'unit', completed: true, createdAt: date },
  ]);
  const store = new DexieMenuTransferStore(db);
  const service = new MenuTransferService(
    store,
    () => 'new',
    () => date,
  );
  return { db, other, store, service };
}

async function review(service: MenuTransferService) {
  const result = await service.review('m');
  if (!result.ok) throw new Error(result.error);
  return result.value;
}

it('atomically consolidates active items and preserves recipes, completed items and categories', async () => {
  const { db, other, service } = await setup();
  const before = await review(service);
  expect(await service.commit(before, new Map())).toEqual({ ok: true, value: 1 });
  const items = await other.shoppingItems.toArray();
  expect(items).toEqual([
    {
      id: 'a',
      name: 'tomato',
      amount: 8,
      unit: 'unit',
      completed: false,
      createdAt: date,
      categoryIds: ['a', 'b'],
    },
    { id: 'c', name: 'tomato', amount: 9, unit: 'unit', completed: true, createdAt: date },
  ]);
  expect(await other.recipes.count()).toBe(1);
  expect(await other.menuAssignments.count()).toBe(2);
  db.close();
  other.close();
});

it.each(['item', 'assignment', 'recipe', 'yield', 'servings', 'category', 'menu'] as const)(
  'rejects a stale review after a concurrent %s change',
  async (change) => {
    const { db, other, service } = await setup();
    const before = await review(service);
    if (change === 'item') await other.shoppingItems.update('a', { amount: 2 });
    if (change === 'assignment') await other.menuAssignments.delete(['m', 1, 'dinner', 'r']);
    if (change === 'recipe')
      await other.recipes.update('r', {
        ingredients: [{ name: 'Tomato', amount: 3, unit: 'unit' }],
      });
    if (change === 'yield') await other.recipes.update('r', { yield: 3 });
    if (change === 'servings') await other.weeklyMenus.update('m', { servings: 3 });
    if (change === 'category') await other.categories.update('a', { name: 'Changed' });
    if (change === 'menu') await other.weeklyMenus.update('m', { name: 'Changed' });
    const items = await other.shoppingItems.toArray();
    expect(await service.commit(before, new Map())).toEqual({ ok: false, error: 'stale' });
    expect(await other.shoppingItems.toArray()).toEqual(items);
    db.close();
    other.close();
  },
);

it('rolls back earlier writes if deleting duplicates fails', async () => {
  const { db, other, service } = await setup();
  const before = await review(service);
  const items = await other.shoppingItems.toArray();
  vi.spyOn(db.shoppingItems, 'bulkDelete').mockRejectedValueOnce(new Error('disk'));
  await expect(service.commit(before, new Map())).rejects.toBeInstanceOf(PersistenceError);
  expect(await other.shoppingItems.toArray()).toEqual(items);
  db.close();
  other.close();
});

it('reports a bulk write failure without persisting any transfer changes', async () => {
  const { db, other, service } = await setup();
  const before = await review(service);
  const items = await other.shoppingItems.toArray();
  vi.spyOn(db.shoppingItems, 'bulkPut').mockRejectedValueOnce(new Error('disk'));
  await expect(service.commit(before, new Map())).rejects.toBeInstanceOf(PersistenceError);
  expect(await other.shoppingItems.toArray()).toEqual(items);
  db.close();
  other.close();
});

it('allows only one of two concurrent commits of the same review', async () => {
  const { db, other, service } = await setup();
  const before = await review(service);
  const competing = new MenuTransferService(
    new DexieMenuTransferStore(other),
    () => 'other',
    () => date,
  );
  const outcomes = await Promise.all([
    service.commit(before, new Map()),
    competing.commit(before, new Map()),
  ]);
  expect(outcomes).toContainEqual({ ok: true, value: 1 });
  expect(outcomes).toContainEqual({ ok: false, error: 'stale' });
  expect((await db.shoppingItems.get('a'))?.amount).toBe(8);
  db.close();
  other.close();
});

it.each(
  (['assignment', 'recipe', 'yield', 'servings', 'menu', 'item', 'category'] as const).flatMap(
    (kind) => (['write-first', 'transfer-first'] as const).map((order) => [kind, order] as const),
  ),
)('serializes a concurrent %s write against transfer (%s)', async (kind, order) => {
  const { db, other, service } = await setup();
  const before = await review(service);
  const previous = await other.shoppingItems.get('a');
  const recipe = await other.recipes.get('r');
  if (!previous || !recipe) throw new Error('Expected fixture records');
  const shopping = new DexieShoppingItemStore(other);
  const write = () => {
    switch (kind) {
      case 'assignment':
        return new DexieMenuAssignmentStore(other).add({
          menuId: 'm',
          recipeId: 'r',
          dayOffset: 3,
          meal: 'lunch',
        });
      case 'recipe':
        return new DexieRecipeStore(other).update({
          ...recipe,
          ingredients: [{ name: 'Tomato', amount: 3, unit: 'unit' }],
        });
      case 'yield':
        return other.recipes.update('r', { yield: 3 });
      case 'servings':
        return new DexieWeeklyMenuStore(other).updateServings('m', 3);
      case 'menu':
        return new DexieWeeklyMenuStore(other).remove('m');
      case 'item':
        return shopping.saveIfUnchanged({ ...previous, amount: 5 }, previous);
      case 'category':
        return shopping.saveCategory({ id: 'a', name: 'Changed' }, false);
    }
  };
  const firstWrite = order === 'write-first' ? write() : undefined;
  const transferring = service.commit(before, new Map());
  const [transfer] = await Promise.all([transferring, firstWrite ?? write()]);
  if (transfer.ok) {
    expect((await other.shoppingItems.get('a'))?.amount).toBe(8);
    expect(await other.shoppingItems.get('b')).toBeUndefined();
  } else {
    expect(['stale', 'menu-not-found']).toContain(transfer.error);
    expect(await other.shoppingItems.get('b')).toBeDefined();
  }
  expect((await other.shoppingItems.get('c'))?.amount).toBe(9);
  db.close();
  other.close();
});

it('reports missing menus and referenced recipes', async () => {
  const { db, other, service } = await setup();
  const before = await review(service);
  await other.recipes.delete('r');
  expect(await service.commit(before, new Map())).toEqual({ ok: false, error: 'recipe-not-found' });
  expect(await service.review('m')).toEqual({ ok: false, error: 'recipe-not-found' });
  await other.weeklyMenus.delete('m');
  expect(await service.review('m')).toEqual({ ok: false, error: 'menu-not-found' });
  db.close();
  other.close();
});

it('requires servings only for a nonempty menu and rejects invalid recipe yields', async () => {
  const { db, other, service } = await setup();
  await other.weeklyMenus.update('m', { servings: null });
  expect(await service.review('m')).toEqual({ ok: false, error: 'servings-required' });
  await other.menuAssignments.where('menuId').equals('m').delete();
  const emptyReview = await service.review('m');
  expect(emptyReview.ok).toBe(true);
  if (emptyReview.ok)
    expect(await service.commit(emptyReview.value, new Map())).toEqual({
      ok: true,
      value: 0,
    });
  await other.menuAssignments.add({
    menuId: 'm',
    recipeId: 'r',
    dayOffset: 0,
    meal: 'lunch',
  });
  await other.weeklyMenus.update('m', { servings: 2 });
  await other.recipes.update('r', { yield: 0 });
  expect(await service.review('m')).toEqual({ ok: false, error: 'invalid-recipe-yield' });
  db.close();
  other.close();
});

it('rejects an edit based on a record changed or removed by a transfer', async () => {
  const { db, other, service } = await setup();
  const originalA = await other.shoppingItems.get('a');
  const originalB = await other.shoppingItems.get('b');
  if (!originalA || !originalB) throw new Error('Expected items');
  const shopping = new ShoppingListService({
    store: new DexieShoppingItemStore(other),
    generateId: () => 'unused',
    now: () => date,
  });
  expect(await service.commit(await review(service), new Map())).toEqual({ ok: true, value: 1 });
  expect(
    await shopping.updateItem('a', 'Updated', { amount: '1', unit: 'unit' }, ['a'], originalA),
  ).toEqual({ ok: false, error: { conflict: true } });
  expect(
    await shopping.updateItem('b', 'Updated', { amount: '3', unit: 'unit' }, ['b'], originalB),
  ).toEqual({ ok: false, error: { conflict: true } });
  expect(await shopping.setCompleted('a', true, originalA)).toEqual({
    ok: false,
    error: 'conflict',
  });
  expect(await shopping.setCompleted('b', true, originalB)).toEqual({
    ok: false,
    error: 'conflict',
  });
  expect((await other.shoppingItems.get('a'))?.amount).toBe(8);
  expect(await other.shoppingItems.get('b')).toBeUndefined();
  db.close();
  other.close();
});

it('rejects an in-flight completion change after the transfer changes its item', async () => {
  const { db, other, service } = await setup();
  const store = new DexieShoppingItemStore(other);
  const shopping = new ShoppingListService({ store, generateId: () => 'unused', now: () => date });
  const get = store.get.bind(store);
  let release = () => {};
  let didRead = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const read = new Promise<void>((resolve) => {
    didRead = resolve;
  });
  vi.spyOn(store, 'get').mockImplementation(async (id) => {
    const result = await get(id);
    didRead();
    await gate;
    return result;
  });
  const completion = shopping.setCompleted('a', true);
  await read;
  expect(await service.commit(await review(service), new Map())).toEqual({ ok: true, value: 1 });
  release();
  expect(await completion).toEqual({ ok: false, error: 'conflict' });
  expect((await other.shoppingItems.get('a'))?.completed).toBe(false);
  db.close();
  other.close();
});
