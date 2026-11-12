import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { createWeeklyMenuService } from '../app/create-services';
import type { Language } from '../features/language/domain/language';
import { LanguageContextProvider } from '../features/language/hooks/language-context';
import { AssignRecipe } from '../features/weekly-menus/components/AssignRecipe';
import { MenuSlots } from '../features/weekly-menus/components/MenuSlots';
import {
  ActiveMenuProvider,
  useActiveMenu,
} from '../features/weekly-menus/hooks/active-menu-context';
import { WeeklyMenuServiceProvider } from '../features/weekly-menus/hooks/weekly-menu-service-context';
import { AppDatabase } from '../infrastructure/persistence/app-database';

let counter = 0;
const menu = { id: 'menu', name: 'Family meals', startDate: '2026-11-18' };

function Controls() {
  const [language, setLanguage] = useState<Language>('en');
  const { selectMenu } = useActiveMenu();
  return (
    <LanguageContextProvider value={{ language, setLanguage, notRemembered: false }}>
      <button
        type="button"
        onClick={() => {
          selectMenu(menu);
        }}
      >
        Select fixture menu
      </button>
      <button
        type="button"
        onClick={() => {
          setLanguage('es');
        }}
      >
        Spanish
      </button>
      <AssignRecipe recipeId="recipe" />
    </LanguageContextProvider>
  );
}

it('preserves the chosen day and meal across languages and reports the saved slot', async () => {
  const name = `planning-component-${String(++counter)}`;
  const db = new AppDatabase(name);
  await db.weeklyMenus.add(menu);
  await db.recipes.add({
    id: 'recipe',
    title: 'Soup',
    sourceUrl: 'https://www.directoalpaladar.com/example',
    yield: 4,
    ingredients: [{ name: 'lentils', amount: 200, unit: 'gram' }],
    instructions: 'Cook.',
    imageUrl: 'https://example.com/image.jpg',
  });
  const service = createWeeklyMenuService(name);
  const user = userEvent.setup();
  render(
    <BrowserRouter>
      <WeeklyMenuServiceProvider value={service}>
        <ActiveMenuProvider>
          <Controls />
        </ActiveMenuProvider>
      </WeeklyMenuServiceProvider>
    </BrowserRouter>,
  );
  expect(screen.getByText('Select a weekly menu before adding a recipe.')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Select fixture menu' }));
  await user.click(screen.getByRole('button', { name: 'Add to weekly menu' }));
  await user.selectOptions(screen.getByLabelText('Day'), '2');
  await user.selectOptions(screen.getByLabelText('Meal'), 'dinner');
  await user.click(screen.getByRole('button', { name: 'Spanish' }));
  expect(screen.getByLabelText('Día')).toHaveValue('2');
  expect(screen.getByLabelText('Comida')).toHaveValue('dinner');
  await user.click(screen.getByRole('button', { name: 'Añadir receta' }));
  expect(await screen.findByRole('status')).toHaveTextContent('Cena');
  expect(within(screen.getByRole('status')).getByText('Soup')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Añadir receta' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('ya está en esta comida');
  db.close();
});

it('shows save failures and retains selections for retry', async () => {
  const name = `planning-component-${String(++counter)}`;
  const service = createWeeklyMenuService(name);
  vi.spyOn(service.assignments, 'add').mockRejectedValueOnce(new Error('Storage unavailable'));
  const user = userEvent.setup();
  render(
    <BrowserRouter>
      <WeeklyMenuServiceProvider value={service}>
        <ActiveMenuProvider>
          <Controls />
        </ActiveMenuProvider>
      </WeeklyMenuServiceProvider>
    </BrowserRouter>,
  );
  await user.click(screen.getByRole('button', { name: 'Select fixture menu' }));
  await user.click(screen.getByRole('button', { name: 'Add to weekly menu' }));
  await user.selectOptions(screen.getByLabelText('Day'), '3');
  await user.selectOptions(screen.getByLabelText('Meal'), 'dinner');
  await user.click(screen.getByRole('button', { name: 'Add recipe' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Could not add the recipe');
  expect(screen.getByLabelText('Day')).toHaveValue('3');
  expect(screen.getByLabelText('Meal')).toHaveValue('dinner');
});

it('offers a retry instead of displaying empty slots when loading fails', async () => {
  const name = `planning-component-${String(++counter)}`;
  const service = createWeeklyMenuService(name);
  vi.spyOn(service.assignments, 'list')
    .mockRejectedValueOnce(new Error('Storage unavailable'))
    .mockResolvedValueOnce({ ok: true, value: [] });
  const user = userEvent.setup();
  render(
    <WeeklyMenuServiceProvider value={service}>
      <MenuSlots menu={menu} />
    </WeeklyMenuServiceProvider>,
  );
  expect(await screen.findByRole('alert')).toHaveTextContent('Could not load menu recipes');
  expect(screen.queryByText('No recipes in this meal.')).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Try again' }));
  expect(await screen.findAllByText('No recipes in this meal.')).toHaveLength(14);
});
