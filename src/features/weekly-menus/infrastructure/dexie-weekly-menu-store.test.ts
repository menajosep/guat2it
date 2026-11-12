import Dexie from 'dexie';
import { AppDatabase } from '../../../infrastructure/persistence/app-database';
import { DexieWeeklyMenuStore } from './dexie-weekly-menu-store';

let counter = 0;
const uniqueName = () => `weekly-menu-store-${String(++counter)}`;

it('upgrades existing data and persists weekly menus across reopening', async () => {
  const name = uniqueName();
  const old = new Dexie(name);
  old.version(3).stores({ shoppingItems: 'id, createdAt', categories: 'id', recipes: 'id' });
  const item = {
    id: 'item',
    name: 'Milk',
    completed: true,
    createdAt: new Date('2026-01-01'),
    amount: 2,
    unit: 'liter',
    categoryIds: ['category'],
  };
  const category = { id: 'category', name: 'Pantry' };
  const recipe = {
    id: 'recipe',
    sourceUrl: 'https://www.directoalpaladar.com/example',
    title: 'Soup',
    yield: 4,
    ingredients: [{ name: 'lentils', amount: 200, unit: 'gram' }],
    instructions: 'Cook.',
    imageUrl: 'https://example.com/image.jpg',
  };
  await old.table('shoppingItems').add(item);
  await old.table('categories').add(category);
  await old.table('recipes').add(recipe);
  old.close();

  const db = new AppDatabase(name);
  const store = new DexieWeeklyMenuStore(db);
  const menu = { id: 'menu', name: 'My week', startDate: '2026-11-16' };
  await store.save(menu);
  expect(await db.shoppingItems.toArray()).toEqual([item]);
  expect(await db.categories.toArray()).toEqual([category]);
  expect(await db.recipes.toArray()).toEqual([recipe]);
  db.close();
  const reopened = new AppDatabase(name);
  expect(await new DexieWeeklyMenuStore(reopened).list()).toEqual([menu]);
  reopened.close();
});

it('wraps storage failures with their action and original cause', async () => {
  const db = new AppDatabase(uniqueName());
  const store = new DexieWeeklyMenuStore(db);
  const error = new Error('Storage unavailable');
  vi.spyOn(db.weeklyMenus, 'toArray').mockRejectedValue(error);
  vi.spyOn(db.weeklyMenus, 'add').mockRejectedValue(error);
  await expect(store.list()).rejects.toMatchObject({ action: 'load-weekly-menus', cause: error });
  await expect(
    store.save({ id: '1', name: 'Week', startDate: '2026-11-16' }),
  ).rejects.toMatchObject({
    action: 'save-weekly-menu',
    cause: error,
  });
  db.close();
});
