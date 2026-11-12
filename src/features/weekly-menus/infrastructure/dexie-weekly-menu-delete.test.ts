import { AppDatabase } from '../../../infrastructure/persistence/app-database';
import { DexieRecipeStore } from '../../recipes/infrastructure/dexie-recipe-store';
import type { Recipe } from '../../recipes/domain/recipe';
import { MenuAssignmentService } from '../application/menu-assignment-service';
import { DexieMenuAssignmentStore } from './dexie-menu-assignment-store';
import { DexieWeeklyMenuStore } from './dexie-weekly-menu-store';

let counter = 0;
const recipe: Recipe = {
  id: 'recipe',
  title: 'Soup',
  sourceUrl: 'https://www.directoalpaladar.com/example',
  yield: 4,
  ingredients: [{ name: 'lentils', amount: 200, unit: 'gram' }],
  instructions: 'Cook.',
  imageUrl: 'https://example.com/image.jpg',
};
const menu = { id: 'menu', name: 'Week', startDate: '2026-11-18' };
const other = { ...menu, id: 'other' };

async function setup() {
  const db = new AppDatabase(`menu-delete-${String(++counter)}`);
  await db.weeklyMenus.bulkAdd([menu, other, { ...menu, id: 'empty' }]);
  await db.recipes.add(recipe);
  const assignments = new MenuAssignmentService(new DexieMenuAssignmentStore(db));
  await assignments.add(menu.id, recipe.id, 0, 'lunch');
  await assignments.add(menu.id, recipe.id, 1, 'dinner');
  await assignments.add(other.id, recipe.id, 0, 'lunch');
  return { db, assignments, store: new DexieWeeklyMenuStore(db) };
}

it('removes only the selected menu and assignments, persists the result, and preserves recipes', async () => {
  const { db, store } = await setup();
  expect(await store.remove('missing')).toBe(false);
  expect(await store.remove('empty')).toBe(true);
  expect(await store.remove(menu.id)).toBe(true);
  expect(await db.weeklyMenus.toArray()).toEqual([other]);
  expect(await db.menuAssignments.toArray()).toMatchObject([{ menuId: other.id }]);
  expect(await db.recipes.get(recipe.id)).toEqual(recipe);
  const recipeStore = new DexieRecipeStore(db);
  expect(await recipeStore.remove(recipe.id)).toBe('in-use');
  const name = db.name;
  db.close();
  const reopened = new AppDatabase(name);
  expect(await reopened.weeklyMenus.toArray()).toEqual([other]);
  expect(await reopened.menuAssignments.toArray()).toHaveLength(1);
  expect(await new DexieWeeklyMenuStore(reopened).remove(other.id)).toBe(true);
  expect(await new DexieRecipeStore(reopened).remove(recipe.id)).toBe(true);
  reopened.close();
});

it.each(['assignment', 'menu'])('rolls back both tables if %s deletion fails', async (step) => {
  const { db, store } = await setup();
  const error = new Error('Storage unavailable');
  if (step === 'assignment') {
    db.menuAssignments.hook('deleting', () => {
      throw error;
    });
  } else {
    vi.spyOn(db.weeklyMenus, 'delete').mockRejectedValueOnce(error);
  }
  await expect(store.remove(menu.id)).rejects.toMatchObject({
    action: 'remove-weekly-menu',
    cause: error,
  });
  expect(await db.weeklyMenus.get(menu.id)).toEqual(menu);
  expect(await db.menuAssignments.where('menuId').equals(menu.id).count()).toBe(2);
  expect(await db.recipes.get(recipe.id)).toEqual(recipe);
  db.close();
});

it.each(['assign-first', 'delete-first'])(
  'prevents orphan assignments during concurrent writes: %s',
  async (order) => {
    const { db, store } = await setup();
    const otherDb = new AppDatabase(db.name);
    const assignments = new MenuAssignmentService(new DexieMenuAssignmentStore(otherDb));
    const add = () => assignments.add(menu.id, recipe.id, 2, 'dinner');
    const remove = () => store.remove(menu.id);
    const outcomes =
      order === 'assign-first'
        ? await Promise.all([add(), remove()])
        : await Promise.all([remove(), add()]);
    expect(outcomes).toContain(true);
    expect(await db.weeklyMenus.get(menu.id)).toBeUndefined();
    expect(await db.menuAssignments.where('menuId').equals(menu.id).count()).toBe(0);
    expect(await assignments.add(menu.id, recipe.id, 3, 'lunch')).toEqual({
      ok: false,
      error: 'menu-not-found',
    });
    expect(await db.recipes.get(recipe.id)).toEqual(recipe);
    db.close();
    otherDb.close();
  },
);

it.each(['menu-first', 'recipe-first'])(
  'serializes competing menu and recipe deletion: %s',
  async (order) => {
    const { db, store } = await setup();
    await store.remove(other.id);
    const otherDb = new AppDatabase(db.name);
    const removeMenu = () => store.remove(menu.id);
    const removeRecipe = () => new DexieRecipeStore(otherDb).remove(recipe.id);
    const [first, second] =
      order === 'menu-first'
        ? await Promise.all([removeMenu(), removeRecipe()])
        : await Promise.all([removeRecipe(), removeMenu()]);
    const [menuResult, recipeResult] = order === 'menu-first' ? [first, second] : [second, first];
    expect(menuResult).toBe(true);
    expect([true, 'in-use']).toContain(recipeResult);
    expect(await db.weeklyMenus.get(menu.id)).toBeUndefined();
    expect(await db.menuAssignments.where('recipeId').equals(recipe.id).count()).toBe(0);
    if (recipeResult === 'in-use') {
      expect(await new DexieRecipeStore(otherDb).remove(recipe.id)).toBe(true);
    }
    db.close();
    otherDb.close();
  },
);
