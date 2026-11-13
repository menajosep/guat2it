import { setupIonicReact } from '@ionic/react';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../app/App';
import {
  createLanguageService,
  createRecipeService,
  createShoppingListService,
  createWeeklyMenuService,
} from '../app/create-services';
import type { WeeklyMenuService } from '../features/weekly-menus/application/weekly-menu-service';
import { AppDatabase } from '../infrastructure/persistence/app-database';
import { PersistenceError } from '../shared/errors/persistence-error';

setupIonicReact();
let counter = 0;
const uniqueDatabase = () => `transfer-ui-${String(++counter)}`;
type User = ReturnType<typeof userEvent.setup>;
const date = new Date('2026-01-01T00:00:00Z');

async function seed(name: string) {
  const db = new AppDatabase(name);
  await db.weeklyMenus.bulkAdd([
    { id: 'm', name: 'Family', startDate: '2026-11-18' },
    { id: 'empty', name: 'Empty', startDate: '2026-11-18' },
  ]);
  await db.recipes.add({
    id: 'r',
    title: 'Soup',
    sourceUrl: 'https://example.com/recipe',
    yield: 2,
    ingredients: [{ name: 'Flour', amount: 500, unit: 'gram' }],
    instructions: 'Cook.',
    imageUrl: 'https://example.com/image.jpg',
  });
  await db.menuAssignments.bulkAdd([
    { menuId: 'm', recipeId: 'r', dayOffset: 0, meal: 'lunch' },
    { menuId: 'm', recipeId: 'r', dayOffset: 1, meal: 'dinner' },
  ]);
  await db.shoppingItems.bulkAdd([
    { id: 'a', name: 'flour', amount: 1, unit: 'kilogram', completed: false, createdAt: date },
    { id: 'b', name: 'Flour', amount: 7, unit: 'kilogram', completed: true, createdAt: date },
  ]);
  return db;
}

function renderApp(name: string, menus: WeeklyMenuService = createWeeklyMenuService(name)) {
  render(
    <App
      shoppingListService={createShoppingListService(name)}
      languageService={createLanguageService()}
      recipeService={createRecipeService(name)}
      weeklyMenuService={menus}
    />,
  );
  return menus;
}

async function navigate(user: User, destination: 'Weekly menus' | 'Shopping list' | 'Recipes') {
  const trigger = document.querySelector<HTMLElement>(
    '.ion-page:not(.ion-page-hidden) ion-menu-button',
  );
  if (!trigger) throw new Error('Menu button not found');
  await user.click(trigger);
  const navigation = screen.getByRole('navigation', { name: 'Menu' });
  await waitFor(() => {
    expect(navigation).toHaveClass('show-menu');
  });
  await user.click(within(navigation).getByText(destination, { selector: 'ion-item' }));
}

async function openSelectedMenu(user: User) {
  await screen.findByRole('main');
  await navigate(user, 'Weekly menus');
  const list = await screen.findByRole('list', { name: 'Saved weekly menus' });
  const row = within(list).getByRole('button', { name: 'Delete menu Family' }).closest('li');
  if (!row) throw new Error('Family menu not found');
  await user.click(within(row).getByRole('button', { name: 'Select menu' }));
}

afterEach(() => {
  cleanup();
  localStorage.clear();
  window.history.replaceState({}, '', '/');
  vi.restoreAllMocks();
});

it('reviews repeated assignments, converts units, and persists the resulting active item', async () => {
  const user = userEvent.setup();
  const name = uniqueDatabase();
  const db = await seed(name);
  renderApp(name);
  await openSelectedMenu(user);
  await user.click(screen.getByRole('button', { name: 'Add menu ingredients to shopping list' }));
  const group = await screen.findByRole('group', { name: 'flour' });
  expect(within(group).getAllByText(/Soup — day/)).toHaveLength(2);
  expect(within(group).getByText(/Shopping list: 1 kilogram/)).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Add ingredients' }));
  expect(within(group).getByRole('alert')).toHaveTextContent('Review the quantities');
  await user.selectOptions(
    within(group).getByRole('combobox', { name: 'Final unit for flour' }),
    'kilogram',
  );
  expect(within(group).getByText('Proposed total: 2 kilograms')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Add ingredients' }));
  expect(await screen.findByText('Menu ingredients added to the shopping list.')).toHaveAttribute(
    'role',
    'status',
  );
  expect((await db.shoppingItems.get('a'))?.amount).toBe(2);
  expect((await db.shoppingItems.get('b'))?.amount).toBe(7);
  await user.click(screen.getByRole('button', { name: 'Add menu ingredients to shopping list' }));
  await user.selectOptions(await screen.findByLabelText('Final unit for flour'), 'kilogram');
  expect(screen.getByText('Proposed total: 3 kilograms')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Add ingredients' }));
  await waitFor(async () => {
    expect((await db.shoppingItems.get('a'))?.amount).toBe(3);
  });
  await navigate(user, 'Shopping list');
  expect(await screen.findByText(/3 kilograms/)).toBeInTheDocument();
  db.close();
});

it('requires explicit manual quantities and retains the draft across language changes', async () => {
  const user = userEvent.setup();
  const name = uniqueDatabase();
  const db = await seed(name);
  await db.recipes.update('r', { ingredients: [{ name: 'Flour' }] });
  renderApp(name);
  await openSelectedMenu(user);
  await user.click(screen.getByRole('button', { name: 'Add menu ingredients to shopping list' }));
  await user.type(await screen.findByLabelText('Final amount for flour'), '3.5');
  await user.selectOptions(screen.getByRole('combobox', { name: 'Language' }), 'es');
  expect(screen.getByLabelText('Cantidad final para flour')).toHaveValue('3.5');
  await user.selectOptions(screen.getByRole('combobox', { name: 'Idioma' }), 'ca');
  expect(screen.getByLabelText('Quantitat final per a flour')).toHaveValue('3.5');
  await user.click(screen.getByRole('button', { name: 'Afegeix els ingredients' }));
  expect(
    await screen.findByText('Ingredients del menú afegits a la llista de la compra.'),
  ).toBeInTheDocument();
  expect((await db.shoppingItems.get('a'))?.amount).toBe(3.5);
  db.close();
});

it('does not write when canceled, dismissed, or navigating away', async () => {
  const user = userEvent.setup();
  const name = uniqueDatabase();
  const db = await seed(name);
  const menus = renderApp(name);
  const commit = vi.spyOn(menus.transfer, 'commit');
  await openSelectedMenu(user);
  const start = () => screen.getByRole('button', { name: 'Add menu ingredients to shopping list' });
  await user.click(start());
  await screen.findByRole('button', { name: 'Add ingredients' });
  await user.click(screen.getByRole('button', { name: 'Cancel' }));
  await user.click(start());
  await screen.findByRole('button', { name: 'Add ingredients' });
  await user.keyboard('{Escape}');
  expect(screen.queryByRole('button', { name: 'Add ingredients' })).not.toBeInTheDocument();
  await user.click(start());
  await screen.findByRole('button', { name: 'Add ingredients' });
  await navigate(user, 'Recipes');
  await screen.findByRole('button', { name: 'Soup' });
  await navigate(user, 'Weekly menus');
  await screen.findByRole('button', { name: 'Add menu ingredients to shopping list' });
  expect(screen.queryByRole('button', { name: 'Add ingredients' })).not.toBeInTheDocument();
  expect(commit).not.toHaveBeenCalled();
  expect((await db.shoppingItems.get('a'))?.amount).toBe(1);
  db.close();
});

it('reports stale reviews and storage failures without claiming success', async () => {
  const user = userEvent.setup();
  const name = uniqueDatabase();
  const db = await seed(name);
  const menus = renderApp(name);
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  await openSelectedMenu(user);
  const start = screen.getByRole('button', { name: 'Add menu ingredients to shopping list' });
  await user.click(start);
  await user.selectOptions(await screen.findByLabelText('Final unit for flour'), 'kilogram');
  await db.shoppingItems.update('a', { amount: 2 });
  await user.click(screen.getByRole('button', { name: 'Add ingredients' }));
  expect(
    await screen.findByText(
      'The menu or shopping list changed. Review the current ingredients again.',
    ),
  ).toHaveAttribute('role', 'alert');
  expect(screen.queryByRole('button', { name: 'Add ingredients' })).not.toBeInTheDocument();
  await user.click(start);
  await user.selectOptions(await screen.findByLabelText('Final unit for flour'), 'kilogram');
  vi.spyOn(menus.transfer, 'commit').mockRejectedValueOnce(new PersistenceError('failed'));
  await user.click(screen.getByRole('button', { name: 'Add ingredients' }));
  expect(
    await screen.findByText(
      'Could not add ingredients because local storage failed. Please try again.',
    ),
  ).toHaveAttribute('role', 'alert');
  expect(screen.getByRole('button', { name: 'Add ingredients' })).toBeInTheDocument();
  expect(
    screen.queryByText('Menu ingredients added to the shopping list.'),
  ).not.toBeInTheDocument();
  expect((await db.shoppingItems.get('a'))?.amount).toBe(2);
  await user.click(screen.getByRole('button', { name: 'Add ingredients' }));
  expect(
    await screen.findByText('Menu ingredients added to the shopping list.'),
  ).toBeInTheDocument();
  expect((await db.shoppingItems.get('a'))?.amount).toBe(3);
  db.close();
});

it('reports an empty menu without initiating a transfer', async () => {
  const user = userEvent.setup();
  const name = uniqueDatabase();
  const db = await seed(name);
  const menus = renderApp(name);
  const commit = vi.spyOn(menus.transfer, 'commit');
  await openSelectedMenu(user);
  const list = screen.getByRole('list', { name: 'Saved weekly menus' });
  const row = within(list).getByRole('button', { name: 'Delete menu Empty' }).closest('li');
  if (!row) throw new Error('Empty menu not found');
  await user.click(within(row).getByRole('button', { name: 'Select menu' }));
  await user.click(screen.getByRole('button', { name: 'Add menu ingredients to shopping list' }));
  expect(await screen.findByText('This menu has no ingredients to transfer.')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Add ingredients' })).not.toBeInTheDocument();
  expect(commit).not.toHaveBeenCalled();
  db.close();
});

it('discards an unconfirmed review when selecting another menu', async () => {
  const user = userEvent.setup();
  const name = uniqueDatabase();
  const db = await seed(name);
  const menus = renderApp(name);
  const commit = vi.spyOn(menus.transfer, 'commit');
  await openSelectedMenu(user);
  await user.click(screen.getByRole('button', { name: 'Add menu ingredients to shopping list' }));
  await screen.findByRole('button', { name: 'Add ingredients' });
  const list = screen.getByRole('list', { name: 'Saved weekly menus' });
  const row = within(list).getByRole('button', { name: 'Delete menu Empty' }).closest('li');
  if (!row) throw new Error('Empty menu not found');
  await user.click(within(row).getByRole('button', { name: 'Select menu' }));
  expect(screen.queryByRole('button', { name: 'Add ingredients' })).not.toBeInTheDocument();
  expect(commit).not.toHaveBeenCalled();
  expect((await db.shoppingItems.get('a'))?.amount).toBe(1);
  db.close();
});

it('reports missing menu recipes when opening the review', async () => {
  const user = userEvent.setup();
  const name = uniqueDatabase();
  const db = await seed(name);
  renderApp(name);
  await openSelectedMenu(user);
  await db.recipes.delete('r');
  await user.click(screen.getByRole('button', { name: 'Add menu ingredients to shopping list' }));
  expect(await screen.findByText('A recipe in this menu is no longer available.')).toHaveAttribute(
    'role',
    'alert',
  );
  expect((await db.shoppingItems.get('a'))?.amount).toBe(1);
  db.close();
});

it('prevents duplicate submissions while a transfer is in progress', async () => {
  const user = userEvent.setup();
  const name = uniqueDatabase();
  const db = await seed(name);
  const menus = createWeeklyMenuService(name);
  const original = menus.transfer.commit.bind(menus.transfer);
  let release = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const commit = vi
    .spyOn(menus.transfer, 'commit')
    .mockImplementation(async (snapshot, choices) => {
      await gate;
      return original(snapshot, choices);
    });
  renderApp(name, menus);
  await openSelectedMenu(user);
  await user.click(screen.getByRole('button', { name: 'Add menu ingredients to shopping list' }));
  await user.selectOptions(await screen.findByLabelText('Final unit for flour'), 'kilogram');
  await user.dblClick(screen.getByRole('button', { name: 'Add ingredients' }));
  expect(commit).toHaveBeenCalledOnce();
  release();
  expect(
    await screen.findByText('Menu ingredients added to the shopping list.'),
  ).toBeInTheDocument();
  expect((await db.shoppingItems.get('a'))?.amount).toBe(2);
  db.close();
});

it('reports a conflict when an open shopping edit is overtaken by a transfer', async () => {
  const user = userEvent.setup();
  const name = uniqueDatabase();
  const db = await seed(name);
  const menus = createWeeklyMenuService(name);
  renderApp(name, menus);
  const edit = await waitFor(() => {
    const button = document.querySelector<HTMLElement>('ion-button[data-edit-id="a"]');
    if (!button) throw new Error('Edit button not found');
    return button;
  });
  await user.click(edit);
  const input = await waitFor(() => {
    const field = document.querySelector<HTMLInputElement>('.edit-item-form ion-input input');
    if (!field) throw new Error('Edit input not found');
    return field;
  });
  await user.clear(input);
  await user.type(input, 'New flour name');
  const snapshot = await menus.transfer.review('m');
  if (!snapshot.ok) throw new Error(snapshot.error);
  expect(
    await menus.transfer.commit(snapshot.value, new Map([['flour', { target: 'kilogram' }]])),
  ).toEqual({ ok: true, value: 1 });
  await user.click(screen.getByText('Save'));
  expect(
    await screen.findByText(
      'This item changed or was removed. Review the current list and try again.',
    ),
  ).toBeInTheDocument();
  expect((await db.shoppingItems.get('a'))?.amount).toBe(2);
  expect((await db.shoppingItems.get('a'))?.name).toBe('flour');
  db.close();
});
