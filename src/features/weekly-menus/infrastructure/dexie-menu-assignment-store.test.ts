import Dexie from 'dexie';
import { AppDatabase } from '../../../infrastructure/persistence/app-database';
import { PersistenceError } from '../../../shared/errors/persistence-error';
import { DexieRecipeStore } from '../../recipes/infrastructure/dexie-recipe-store';
import type { Recipe } from '../../recipes/domain/recipe';
import { MenuAssignmentService } from '../application/menu-assignment-service';
import { DexieMenuAssignmentStore } from './dexie-menu-assignment-store';

let counter = 0;
const uniqueName = () => `assignments-${String(++counter)}`;
const menu = { id: 'menu', name: 'Week', startDate: '2026-11-18' };
const recipe: Recipe = {
  id: 'recipe',
  title: 'Soup',
  sourceUrl: 'https://www.directoalpaladar.com/example',
  yield: 4,
  ingredients: [{ name: 'lentils', amount: 200, unit: 'gram' }],
  instructions: 'Cook.',
  imageUrl: 'https://example.com/image.jpg',
};

async function setup() {
  const db = new AppDatabase(uniqueName());
  await db.weeklyMenus.add(menu);
  await db.recipes.add(recipe);
  const service = new MenuAssignmentService(new DexieMenuAssignmentStore(db));
  return { db, service };
}

it('preserves version-4 data on upgrade and persists assignments across reopening', async () => {
  const name = uniqueName();
  const old = new Dexie(name);
  old.version(4).stores({
    shoppingItems: 'id, createdAt',
    categories: 'id',
    recipes: 'id',
    weeklyMenus: 'id, startDate',
  });
  const item = {
    id: 'item',
    name: 'Milk',
    completed: false,
    createdAt: new Date('2026-01-01'),
    categoryIds: ['category'],
  };
  const category = { id: 'category', name: 'Pantry' };
  await old.table('shoppingItems').add(item);
  await old.table('categories').add(category);
  await old.table('recipes').add(recipe);
  await old.table('weeklyMenus').add(menu);
  old.close();

  const db = new AppDatabase(name);
  const service = new MenuAssignmentService(new DexieMenuAssignmentStore(db));
  expect(await service.list(menu.id)).toEqual({ ok: true, value: [] });
  expect((await service.add(menu.id, recipe.id, 0, 'lunch')).ok).toBe(true);
  expect(await db.shoppingItems.toArray()).toEqual([item]);
  expect(await db.categories.toArray()).toEqual([category]);
  expect(await db.recipes.toArray()).toEqual([recipe]);
  expect(await db.weeklyMenus.toArray()).toEqual([menu]);
  db.close();
  const reopened = new AppDatabase(name);
  expect(await new DexieMenuAssignmentStore(reopened).list(menu.id)).toMatchObject({
    ok: true,
    value: [{ recipeId: recipe.id, title: 'Soup' }],
  });
  reopened.close();
});

it('validates, prevents duplicates, resolves titles and removes only one slot', async () => {
  const { db, service } = await setup();
  expect(await service.add(menu.id, recipe.id, 7, 'lunch')).toEqual({
    ok: false,
    error: 'invalid-slot',
  });
  expect(await service.add(menu.id, recipe.id, 0, 'breakfast')).toEqual({
    ok: false,
    error: 'invalid-slot',
  });
  expect(await service.add('missing', recipe.id, 0, 'lunch')).toEqual({
    ok: false,
    error: 'menu-not-found',
  });
  expect(await service.add(menu.id, 'missing', 0, 'lunch')).toEqual({
    ok: false,
    error: 'recipe-not-found',
  });
  expect((await service.add(menu.id, recipe.id, 0, 'lunch')).ok).toBe(true);
  expect(await service.add(menu.id, recipe.id, 0, 'lunch')).toEqual({
    ok: false,
    error: 'duplicate',
  });
  expect((await service.add(menu.id, recipe.id, 1, 'dinner')).ok).toBe(true);
  await db.recipes.put({ ...recipe, title: 'Updated soup' });
  expect(await service.list(menu.id)).toMatchObject({
    ok: true,
    value: [{ title: 'Updated soup' }, { title: 'Updated soup' }],
  });
  expect(
    (await service.remove({ menuId: menu.id, recipeId: recipe.id, dayOffset: 0, meal: 'lunch' }))
      .ok,
  ).toBe(true);
  expect(await service.list(menu.id)).toMatchObject({ ok: true, value: [{ dayOffset: 1 }] });
  expect(await db.recipes.get(recipe.id)).toMatchObject({ title: 'Updated soup' });
  db.close();
});

it('serializes competing duplicate writes and blocks deletion until every assignment is removed', async () => {
  const { db, service } = await setup();
  const otherDb = new AppDatabase(db.name);
  const other = new MenuAssignmentService(new DexieMenuAssignmentStore(otherDb));
  const results = await Promise.all([
    service.add(menu.id, recipe.id, 0, 'lunch'),
    other.add(menu.id, recipe.id, 0, 'lunch'),
  ]);
  expect(results.filter((result) => result.ok)).toHaveLength(1);
  expect(results.filter((result) => !result.ok)).toEqual([{ ok: false, error: 'duplicate' }]);
  const recipes = new DexieRecipeStore(otherDb);
  expect(await recipes.remove(recipe.id)).toBe('in-use');
  await service.add(menu.id, recipe.id, 1, 'dinner');
  await service.remove({ menuId: menu.id, recipeId: recipe.id, dayOffset: 0, meal: 'lunch' });
  expect(await recipes.remove(recipe.id)).toBe('in-use');
  await service.remove({ menuId: menu.id, recipeId: recipe.id, dayOffset: 1, meal: 'dinner' });
  expect(await recipes.remove(recipe.id)).toBe(true);
  db.close();
  otherDb.close();
});

it.each(['assign-first', 'delete-first'])(
  'prevents dangling references when operations compete: %s',
  async (order) => {
    const { db, service } = await setup();
    const otherDb = new AppDatabase(db.name);
    const recipes = new DexieRecipeStore(otherDb);
    const assign = () => service.add(menu.id, recipe.id, 0, 'lunch');
    const remove = () => recipes.remove(recipe.id);
    const outcomes =
      order === 'assign-first'
        ? await Promise.all([assign(), remove()])
        : await Promise.all([remove(), assign()]);
    const saved = await db.recipes.get(recipe.id);
    const assignments = await db.menuAssignments.toArray();
    expect(saved !== undefined || assignments.length === 0).toBe(true);
    const assignedFirst =
      order === 'assign-first'
        ? [expect.objectContaining({ ok: true }), 'in-use']
        : ['in-use', expect.objectContaining({ ok: true })];
    const deletedFirst =
      order === 'assign-first'
        ? [{ ok: false, error: 'recipe-not-found' }, true]
        : [true, { ok: false, error: 'recipe-not-found' }];
    expect([assignedFirst, deletedFirst]).toContainEqual(outcomes);
    db.close();
    otherDb.close();
  },
);

it('reports storage errors and missing referenced recipes without hiding data', async () => {
  const { db, service } = await setup();
  const failure = new Error('Storage unavailable');
  const add = vi.spyOn(db.menuAssignments, 'add').mockRejectedValueOnce(failure);
  await expect(service.add(menu.id, recipe.id, 0, 'lunch')).rejects.toMatchObject({
    cause: failure,
  });
  expect(await db.menuAssignments.count()).toBe(0);
  add.mockRestore();
  await service.add(menu.id, recipe.id, 0, 'lunch');
  await db.recipes.delete(recipe.id);
  await expect(service.list(menu.id)).rejects.toBeInstanceOf(PersistenceError);
  db.close();
});

it('allows different recipes in a slot and one recipe in different menus', async () => {
  const { db, service } = await setup();
  await db.weeklyMenus.add({ ...menu, id: 'other-menu' });
  await db.recipes.add({ ...recipe, id: 'other-recipe', title: 'Bread' });
  await service.add(menu.id, recipe.id, 0, 'lunch');
  const result = await service.add(menu.id, 'other-recipe', 0, 'lunch');
  expect(result).toMatchObject({
    ok: true,
    value: [{ title: 'Bread' }, { title: 'Soup' }],
  });
  expect((await service.add('other-menu', recipe.id, 0, 'lunch')).ok).toBe(true);
  expect(await service.list('other-menu')).toMatchObject({ ok: true, value: [{ title: 'Soup' }] });
  db.close();
});

it('retains the assignment if removal fails and reports a missing menu', async () => {
  const { db, service } = await setup();
  const assignment = { menuId: menu.id, recipeId: recipe.id, dayOffset: 0, meal: 'lunch' as const };
  await service.add(menu.id, recipe.id, 0, 'lunch');
  const failure = new Error('Storage unavailable');
  vi.spyOn(db.menuAssignments, 'delete').mockRejectedValueOnce(failure);
  await expect(service.remove(assignment)).rejects.toMatchObject({ cause: failure });
  expect(await service.list(menu.id)).toMatchObject({ ok: true, value: [{ title: 'Soup' }] });
  expect(await service.list('missing')).toEqual({ ok: false, error: 'menu-not-found' });
  db.close();
});
