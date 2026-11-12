import { setupIonicReact } from '@ionic/react';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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
  expect(screen.getByText('Weekly menu (2026-11-17)', { exact: false })).toBeInTheDocument();

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
  expect(within(list).getByText(/Weekly menu \(2026-11-17\)/)).toBeInTheDocument();
  expect(within(list).getByText(/Second menu/)).toBeInTheDocument();
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
