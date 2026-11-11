import Dexie from 'dexie';
import { AppDatabase } from '../../../infrastructure/persistence/app-database';
import { PersistenceError } from '../../../shared/errors/persistence-error';
import type { Recipe } from '../domain/recipe';
import { DexieRecipeStore } from './dexie-recipe-store';

let counter = 0;
const uniqueName = () => `recipe-store-test-${String(++counter)}`;
const recipe: Recipe = {
  id: 'recipe-1',
  sourceUrl: 'https://www.directoalpaladar.com/example',
  title: 'Soup',
  yield: 4,
  ingredients: [{ name: 'lentils', amount: 200, unit: 'gram' }],
  instructions: 'Cook.',
  imageUrl: 'https://example.com/image.jpg',
};

describe('DexieRecipeStore', () => {
  it('upgrades a populated database and persists a complete recipe across reopening', async () => {
    const name = uniqueName();
    const old = new Dexie(name);
    old.version(2).stores({ shoppingItems: 'id, createdAt', categories: 'id' });
    const category = { id: 'c', name: 'Pantry' };
    const item = {
      id: 'i',
      name: 'Milk',
      completed: false,
      createdAt: new Date('2026-01-01T10:00:00Z'),
      categoryIds: ['c'],
    };
    await old.table('categories').add(category);
    await old.table('shoppingItems').add(item);
    old.close();

    const db = new AppDatabase(name);
    const store = new DexieRecipeStore(db);
    await store.save(recipe);
    expect(await db.categories.toArray()).toEqual([category]);
    expect(await db.shoppingItems.toArray()).toEqual([item]);
    db.close();

    const reopened = new AppDatabase(name);
    expect(await new DexieRecipeStore(reopened).get(recipe.id)).toEqual(recipe);
    expect(await new DexieRecipeStore(reopened).list()).toEqual([recipe]);
    reopened.close();
  });

  it('rejects duplicate ids without changing the saved recipe', async () => {
    const db = new AppDatabase(uniqueName());
    const store = new DexieRecipeStore(db);
    await store.save(recipe);
    await expect(store.save({ ...recipe, title: 'Different' })).rejects.toBeInstanceOf(
      PersistenceError,
    );
    expect(await store.get(recipe.id)).toEqual(recipe);
    db.close();
  });

  it('removes an existing recipe and reports when it is already missing', async () => {
    const db = new AppDatabase(uniqueName());
    const store = new DexieRecipeStore(db);
    await store.save(recipe);

    await expect(store.remove(recipe.id)).resolves.toBe(true);
    await expect(store.get(recipe.id)).resolves.toBeUndefined();
    await expect(store.remove(recipe.id)).resolves.toBe(false);
    db.close();
  });

  it('updates an existing recipe but does not recreate a missing one', async () => {
    const db = new AppDatabase(uniqueName());
    const store = new DexieRecipeStore(db);
    await expect(store.update(recipe)).resolves.toBe(false);
    await expect(store.get(recipe.id)).resolves.toBeUndefined();

    await store.save(recipe);
    const updated = { ...recipe, title: 'Updated soup' };
    await expect(store.update(updated)).resolves.toBe(true);
    await expect(store.get(recipe.id)).resolves.toEqual(updated);
    db.close();
  });

  it('wraps load, save, and update failures with their original cause', async () => {
    const db = new AppDatabase(uniqueName());
    const store = new DexieRecipeStore(db);
    const error = new Error('Storage unavailable');
    await store.save(recipe);
    vi.spyOn(db.recipes, 'toArray').mockRejectedValue(error);
    vi.spyOn(db.recipes, 'add').mockRejectedValue(error);
    vi.spyOn(db.recipes, 'put').mockRejectedValue(error);
    vi.spyOn(db.recipes, 'delete').mockRejectedValue(error);
    await expect(store.list()).rejects.toMatchObject({ action: 'load-recipes', cause: error });
    await expect(store.save(recipe)).rejects.toMatchObject({ action: 'save-recipe', cause: error });
    await expect(store.update(recipe)).rejects.toMatchObject({
      action: 'update-recipe',
      cause: error,
    });
    await expect(store.remove(recipe.id)).rejects.toMatchObject({
      action: 'remove-recipe',
      cause: error,
    });
    db.close();
  });
});
