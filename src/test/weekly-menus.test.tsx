import { setupIonicReact } from '@ionic/react';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../app/App';
import {
  createLanguageService,
  createRecipeService,
  createShoppingListService,
  createWeeklyMenuService,
} from '../app/create-services';
import type { WeeklyMenuService } from '../features/weekly-menus/application/weekly-menu-service';
import { localCalendarDate } from '../features/weekly-menus/domain/weekly-menu';
import { PersistenceError } from '../shared/errors/persistence-error';
import { AppDatabase } from '../infrastructure/persistence/app-database';
import type { WeeklyMenu } from '../features/weekly-menus/domain/weekly-menu';

setupIonicReact();

let counter = 0;
const uniqueDatabase = () => `weekly-ui-${String(++counter)}`;
type User = ReturnType<typeof userEvent.setup>;

function renderApp(database: string, menus: WeeklyMenuService = createWeeklyMenuService(database)) {
  render(
    <App
      shoppingListService={createShoppingListService(database)}
      languageService={createLanguageService()}
      recipeService={createRecipeService(database)}
      weeklyMenuService={menus}
    />,
  );
  return menus;
}

async function openWeeklyMenus(user: User) {
  await screen.findByText(/shopping list is empty/i, undefined, { timeout: 5000 });
  const trigger = document.querySelector<HTMLElement>(
    '.ion-page:not(.ion-page-hidden) ion-menu-button',
  );
  if (!trigger) throw new Error('Menu button not found');
  await user.click(trigger);
  const menu = screen.getByRole('navigation', { name: 'Menu' });
  await waitFor(() => expect(menu).toHaveClass('show-menu'));
  await user.click(within(menu).getByText('Weekly menus', { selector: 'ion-item' }));
}

async function navigate(user: User, destination: 'Recipes' | 'Weekly menus') {
  const trigger = document.querySelector<HTMLElement>(
    '.ion-page:not(.ion-page-hidden) ion-menu-button',
  );
  if (!trigger) throw new Error('Menu button not found');
  await user.click(trigger);
  const navigation = screen.getByRole('navigation', { name: 'Menu' });
  await waitFor(() => expect(navigation).toHaveClass('show-menu'));
  await user.click(within(navigation).getByText(destination, { selector: 'ion-item' }));
}

function first<T>(values: T[]): T {
  const value = values[0];
  if (!value) throw new Error('Expected an item');
  return value;
}

async function seedMenus(database: string, menus: WeeklyMenu[]) {
  const db = new AppDatabase(database);
  await db.weeklyMenus.bulkAdd(menus);
  await db.recipes.add({
    id: 'recipe',
    title: 'Soup',
    sourceUrl: 'https://www.directoalpaladar.com/example',
    yield: 4,
    ingredients: [{ name: 'lentils', amount: 200, unit: 'gram' }],
    instructions: 'Cook.',
    imageUrl: 'https://example.com/image.jpg',
  });
  for (const menu of menus) {
    await db.menuAssignments.add({
      menuId: menu.id,
      recipeId: 'recipe',
      dayOffset: 0,
      meal: 'lunch',
    });
  }
  return db;
}

afterEach(() => {
  cleanup();
  localStorage.clear();
  window.history.replaceState({}, '', '/');
  vi.restoreAllMocks();
});

it('creates default and custom menus, allows duplicate dates, and reloads them', async () => {
  const user = userEvent.setup();
  const database = uniqueDatabase();
  const menus = renderApp(database);
  await openWeeklyMenus(user);
  const date = await screen.findByLabelText('Start date');
  const name = screen.getByLabelText('Menu name');
  const today = localCalendarDate(new Date());
  expect(date).toHaveValue(today);
  expect(name).toHaveValue(`Weekly menu (${today})`);
  fireEvent.change(date, { target: { value: '2026-11-16' } });
  expect(name).toHaveValue('Weekly menu (2026-11-16)');
  await user.clear(name);
  await user.type(name, 'My custom name');
  fireEvent.change(date, { target: { value: '2026-11-17' } });
  expect(name).toHaveValue('Weekly menu (2026-11-17)');
  await user.click(screen.getByRole('button', { name: 'Create weekly menu' }));
  expect(await screen.findByText('Weekly menu created.')).toHaveAttribute('role', 'status');
  expect(
    screen.getByRole('button', { name: 'Delete menu Weekly menu (2026-11-17)' }),
  ).toBeInTheDocument();

  await user.clear(name);
  await user.type(name, 'Second menu');
  await user.click(screen.getByRole('button', { name: 'Create weekly menu' }));
  await waitFor(async () => {
    expect(await menus.list()).toHaveLength(2);
  });
  expect(
    (await menus.list()).map(({ name: savedName, startDate }) => ({ name: savedName, startDate })),
  ).toEqual(
    expect.arrayContaining([
      { name: 'Weekly menu (2026-11-17)', startDate: '2026-11-17' },
      { name: 'Second menu', startDate: '2026-11-17' },
    ]),
  );

  cleanup();
  window.history.replaceState({}, '', '/');
  renderApp(database);
  await openWeeklyMenus(user);
  const list = await screen.findByRole('list', { name: 'Saved weekly menus' });
  expect(
    within(list).getByRole('button', { name: 'Delete menu Weekly menu (2026-11-17)' }),
  ).toBeInTheDocument();
  expect(within(list).getByRole('button', { name: 'Delete menu Second menu' })).toBeInTheDocument();
});

it('validates fields and keeps draft values when the language changes', async () => {
  const user = userEvent.setup();
  const menus = renderApp(uniqueDatabase());
  await openWeeklyMenus(user);
  const date = await screen.findByLabelText('Start date');
  const name = screen.getByLabelText('Menu name');
  fireEvent.change(date, { target: { value: '' } });
  await user.clear(name);
  await user.click(screen.getByRole('button', { name: 'Create weekly menu' }));
  expect(screen.getByText('Choose a valid start date.')).toHaveAttribute('role', 'alert');
  expect(screen.getByText('Enter a menu name.')).toHaveAttribute('role', 'alert');
  expect(await menus.list()).toEqual([]);
  fireEvent.change(date, { target: { value: '2026-11-16' } });
  fireEvent.change(name, { target: { value: 'x'.repeat(101) } });
  await user.click(screen.getByRole('button', { name: 'Create weekly menu' }));
  expect(screen.getByText('Menu names can have at most 100 characters.')).toHaveAttribute(
    'role',
    'alert',
  );
  expect(await menus.list()).toEqual([]);
  await user.clear(name);
  await user.type(name, 'My plan');
  await user.selectOptions(screen.getByRole('combobox', { name: 'Language' }), 'es');
  expect(screen.getByLabelText('Fecha de inicio')).toHaveValue('2026-11-16');
  expect(screen.getByLabelText('Nombre del menú')).toHaveValue('My plan');
  await user.clear(screen.getByLabelText('Nombre del menú'));
  await user.click(screen.getByRole('button', { name: 'Crear menú semanal' }));
  expect(screen.getByText('Introduce un nombre para el menú.')).toHaveAttribute('role', 'alert');
  fireEvent.change(screen.getByLabelText('Fecha de inicio'), { target: { value: '2026-11-18' } });
  expect(screen.getByLabelText('Nombre del menú')).toHaveValue('Menú semanal (2026-11-18)');
  await user.selectOptions(screen.getByRole('combobox', { name: 'Idioma' }), 'ca');
  expect(screen.getByLabelText('Nom del menú')).toHaveValue('Menú semanal (2026-11-18)');
  expect(screen.getByText('Crea un menú setmanal')).toBeInTheDocument();
  await user.clear(screen.getByLabelText('Nom del menú'));
  await user.click(screen.getByRole('button', { name: 'Crea un menú setmanal' }));
  expect(screen.getByText('Introdueix un nom per al menú.')).toHaveAttribute('role', 'alert');
});

it('reports load failures and retries', async () => {
  const user = userEvent.setup();
  const database = uniqueDatabase();
  const menus = createWeeklyMenuService(database);
  const list = vi.spyOn(menus, 'list').mockRejectedValueOnce(new PersistenceError('failed'));
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  renderApp(database, menus);
  await openWeeklyMenus(user);
  expect(
    await screen.findByText('Could not load weekly menus because local storage failed.'),
  ).toHaveAttribute('role', 'alert');
  await user.click(screen.getByRole('button', { name: 'Try again' }));
  expect(await screen.findByLabelText('Start date')).toBeInTheDocument();
  expect(list).toHaveBeenCalledTimes(2);
});

it('retains the draft and reports a failed save without claiming success', async () => {
  const user = userEvent.setup();
  const database = uniqueDatabase();
  const menus = createWeeklyMenuService(database);
  vi.spyOn(menus, 'create').mockRejectedValueOnce(new PersistenceError('failed'));
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  renderApp(database, menus);
  await openWeeklyMenus(user);
  const date = await screen.findByLabelText('Start date');
  fireEvent.change(date, { target: { value: '2026-11-16' } });
  await user.click(screen.getByRole('button', { name: 'Create weekly menu' }));
  expect(
    await screen.findByText('Could not save the weekly menu because local storage failed.'),
  ).toHaveAttribute('role', 'alert');
  expect(screen.getByLabelText('Menu name')).toHaveValue('Weekly menu (2026-11-16)');
  expect(screen.getByLabelText('Start date')).toHaveValue('2026-11-16');
  expect(screen.queryByText('Weekly menu created.')).not.toBeInTheDocument();
  expect(await menus.list()).toEqual([]);
});

it('confirms one identical menu by identity and preserves the other menu and recipe', async () => {
  const user = userEvent.setup();
  const database = uniqueDatabase();
  const firstMenu = { id: 'a', name: 'Family', startDate: '2026-11-18' };
  const secondMenu = { ...firstMenu, id: 'b' };
  const db = await seedMenus(database, [firstMenu, secondMenu]);
  const menus = renderApp(database);
  const remove = vi.spyOn(menus, 'remove');
  await openWeeklyMenus(user);
  const list = await screen.findByRole('list', { name: 'Saved weekly menus' });
  let rows = within(list).getAllByRole('listitem');
  await user.click(within(first(rows)).getByRole('button', { name: 'Select menu' }));
  await user.click(within(first(rows)).getByRole('button', { name: 'Delete menu Family' }));
  let dialog = await screen.findByRole('alertdialog');
  await waitFor(() => expect(dialog).toHaveTextContent('Family'));
  expect(dialog).toHaveTextContent('2026-11-18');
  expect(dialog).toHaveTextContent('assignments will be removed');
  expect(remove).not.toHaveBeenCalled();
  await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
  await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  expect(await db.menuAssignments.count()).toBe(2);
  await user.click(within(first(rows)).getByRole('button', { name: 'Delete menu Family' }));
  await screen.findByRole('alertdialog');
  await user.keyboard('{Escape}');
  await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  expect(remove).not.toHaveBeenCalled();
  rows = within(list).getAllByRole('listitem');
  await user.click(within(first(rows)).getByRole('button', { name: 'Delete menu Family' }));
  dialog = await screen.findByRole('alertdialog');
  await user.click(within(dialog).getByRole('button', { name: 'Delete' }));
  expect(await screen.findByText('Weekly menu deleted.')).toHaveAttribute('role', 'status');
  expect(await menus.list()).toEqual([secondMenu]);
  expect(await db.menuAssignments.toArray()).toMatchObject([{ menuId: 'b' }]);
  expect(await db.recipes.get('recipe')).toBeDefined();
  expect(screen.queryByText(/Selected menu:/)).not.toBeInTheDocument();
  db.close();
});

it.each(['storage', 'not-found'])(
  'reports %s deletion failure and preserves selection',
  async (kind) => {
    const user = userEvent.setup();
    const database = uniqueDatabase();
    const menu = { id: 'a', name: 'Family', startDate: '2026-11-18' };
    const db = await seedMenus(database, [menu]);
    const menus = createWeeklyMenuService(database);
    const remove = vi.spyOn(menus, 'remove');
    if (kind === 'storage') remove.mockRejectedValueOnce(new PersistenceError('failed'));
    else remove.mockResolvedValueOnce({ ok: false, error: 'not-found' });
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    renderApp(database, menus);
    await openWeeklyMenus(user);
    await user.click(await screen.findByRole('button', { name: 'Select menu' }));
    await user.click(screen.getByRole('button', { name: 'Delete menu Family' }));
    const dialog = await screen.findByRole('alertdialog');
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }));
    const expected =
      kind === 'storage'
        ? 'Could not delete the weekly menu because local storage failed.'
        : 'This weekly menu is no longer available.';
    expect(await screen.findByText(expected)).toHaveAttribute('role', 'alert');
    expect(screen.queryByText('Weekly menu deleted.')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Select menu' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(await db.menuAssignments.count()).toBe(1);
    expect(await db.weeklyMenus.get(menu.id)).toEqual(menu);
    db.close();
  },
);

it('localizes a pending confirmation and displays the saved name as text', async () => {
  const user = userEvent.setup();
  const database = uniqueDatabase();
  const name = '<img src=x onerror=alert(1)> & <b>Menu</b>';
  const db = await seedMenus(database, [{ id: 'a', name, startDate: '2026-11-18' }]);
  renderApp(database);
  await openWeeklyMenus(user);
  const language = await screen.findByRole('combobox', { name: 'Language' });
  await user.click(await screen.findByRole('button', { name: `Delete menu ${name}` }));
  const dialog = await screen.findByRole('alertdialog');
  await waitFor(() => expect(dialog).toHaveTextContent(name));
  expect(dialog.querySelector('img, b')).toBeNull();
  fireEvent.change(language, { target: { value: 'es' } });
  await waitFor(() =>
    expect(within(dialog).getByRole('button', { name: 'Eliminar' })).toBeInTheDocument(),
  );
  fireEvent.change(language, { target: { value: 'ca' } });
  await waitFor(() =>
    expect(within(dialog).getByRole('button', { name: 'Cancel·la' })).toBeInTheDocument(),
  );
  await user.click(within(dialog).getByRole('button', { name: 'Suprimeix' }));
  await waitFor(async () => {
    expect(await db.weeklyMenus.count()).toBe(0);
  });
  expect(await db.recipes.get('recipe')).toBeDefined();
  db.close();
});

it('keeps a new selection and ignores a stale list load while deletion finishes', async () => {
  const user = userEvent.setup();
  const database = uniqueDatabase();
  const firstMenu = { id: 'a', name: 'First', startDate: '2026-11-18' };
  const secondMenu = { ...firstMenu, id: 'b', name: 'Second' };
  const db = await seedMenus(database, [firstMenu, secondMenu]);
  const menus = createWeeklyMenuService(database);
  const originalRemove = menus.remove.bind(menus);
  let releaseDelete = () => {};
  const deleteGate = new Promise<void>((resolve) => {
    releaseDelete = resolve;
  });
  const remove = vi.spyOn(menus, 'remove').mockImplementation(async (id) => {
    await deleteGate;
    return originalRemove(id);
  });
  renderApp(database, menus);
  await openWeeklyMenus(user);
  const list = await screen.findByRole('list', { name: 'Saved weekly menus' });
  const rows = within(list).getAllByRole('listitem');
  await user.click(within(first(rows)).getByRole('button', { name: 'Select menu' }));
  await user.click(within(first(rows)).getByRole('button', { name: 'Delete menu First' }));
  const dialog = await screen.findByRole('alertdialog');
  await user.click(within(dialog).getByRole('button', { name: 'Delete' }));
  await waitFor(() => {
    expect(remove).toHaveBeenCalledOnce();
  });
  const secondRow = rows[1];
  if (!secondRow) throw new Error('Expected second menu');
  await user.click(within(secondRow).getByRole('button', { name: 'Select menu' }));

  let releaseLoad: (value: WeeklyMenu[]) => void = () => {};
  const loadGate = new Promise<WeeklyMenu[]>((resolve) => {
    releaseLoad = resolve;
  });
  const listSpy = vi.spyOn(menus, 'list').mockImplementationOnce(() => loadGate);
  await navigate(user, 'Recipes');
  await screen.findByRole('button', { name: 'Soup' });
  await navigate(user, 'Weekly menus');
  await waitFor(() => {
    expect(listSpy).toHaveBeenCalledOnce();
  });
  releaseDelete();
  await waitFor(async () => {
    expect(await db.weeklyMenus.get(firstMenu.id)).toBeUndefined();
  });
  expect(await screen.findByText('Weekly menu deleted.')).toBeInTheDocument();
  await act(async () => {
    releaseLoad([firstMenu, secondMenu]);
    await loadGate;
  });
  const updatedList = screen.getByRole('list', { name: 'Saved weekly menus' });
  expect(
    within(updatedList).queryByRole('button', { name: 'Delete menu First' }),
  ).not.toBeInTheDocument();
  expect(within(updatedList).getByRole('button', { name: 'Select menu' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  expect(screen.getByText('Selected menu: Second')).toBeInTheDocument();
  db.close();
});
