import { setupIonicReact } from '@ionic/react';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../app/App';
import {
  createLanguageService,
  createRecipeService,
  createShoppingListService,
} from '../app/create-services';
import { PersistenceError } from '../shared/errors/persistence-error';

setupIonicReact();

let counter = 0;
const recipeSource = `<script type="application/ld+json">${JSON.stringify({
  '@graph': [
    { '@type': 'Article' },
    {
      '@type': 'Recipe',
      name: 'Lentil soup',
      recipeYield: 4,
      recipeIngredient: ['200 g lentils', 'salt to taste'],
      recipeInstructions: 'Cook gently.',
      image: 'https://images.example.com/soup.jpg',
    },
  ],
})}</script>`;

function renderApp() {
  const database = `recipe-ui-${String(++counter)}`;
  const recipes = createRecipeService(database);
  const view = render(
    <App
      shoppingListService={createShoppingListService(database)}
      languageService={createLanguageService()}
      recipeService={recipes}
    />,
  );
  return { recipes, ...view };
}

async function openRecipes(user: ReturnType<typeof userEvent.setup>) {
  await screen.findByText(/shopping list is empty/i, undefined, { timeout: 5000 });
  const trigger = document.querySelector<HTMLElement>(
    '.ion-page:not(.ion-page-hidden) ion-menu-button',
  );
  if (!trigger) throw new Error('Menu button not found');
  await user.click(trigger);
  const menu = screen.getByRole('navigation', { name: 'Menu' });
  await waitFor(() => expect(menu).toHaveClass('show-menu'));
  await user.click(within(menu).getByText('Recipes', { selector: 'ion-item' }));
}

async function startReview(user: ReturnType<typeof userEvent.setup>) {
  await screen.findByText('No recipes yet.');
  await user.click(screen.getByRole('button', { name: 'Import recipe' }));
  await user.type(screen.getByLabelText('Recipe URL'), 'https://www.directoalpaladar.com/example');
  fireEvent.change(screen.getByLabelText('Page source'), { target: { value: recipeSource } });
  await user.click(screen.getByRole('button', { name: 'Review recipe' }));
  await screen.findByLabelText('Title');
}

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
  window.history.replaceState({}, '', '/');
});

it('retains unresolved ingredients, requires confirmation, and saves the corrected recipe', async () => {
  const user = userEvent.setup();
  const { recipes } = renderApp();
  await openRecipes(user);
  await startReview(user);
  await user.click(screen.getByRole('button', { name: 'Save recipe' }));
  expect(screen.getByText('Review and confirm this ingredient.')).toHaveAttribute('role', 'alert');
  const ingredient = screen.getByRole('group', { name: 'Ingredients 2' });
  expect(within(ingredient).getByText(/salt to taste/)).toBeInTheDocument();
  await user.clear(within(ingredient).getByLabelText('Ingredient name'));
  await user.type(within(ingredient).getByLabelText('Ingredient name'), 'salt');
  await user.click(
    within(ingredient).getByRole('checkbox', { name: 'I have reviewed this ingredient' }),
  );
  await user.click(screen.getByRole('button', { name: 'Save recipe' }));
  expect(await screen.findByRole('button', { name: 'Lentil soup' })).toBeInTheDocument();
  expect(await recipes.list()).toMatchObject([
    { title: 'Lentil soup', ingredients: [{ name: 'lentils', amount: 200 }, { name: 'salt' }] },
  ]);
});

it('keeps the review draft on storage failure and translates it when language changes', async () => {
  const user = userEvent.setup();
  const { recipes } = renderApp();
  await openRecipes(user);
  await startReview(user);
  const ingredient = screen.getByRole('group', { name: 'Ingredients 2' });
  await user.click(
    within(ingredient).getByRole('checkbox', { name: 'I have reviewed this ingredient' }),
  );
  vi.spyOn(recipes, 'save').mockRejectedValueOnce(new PersistenceError('Storage failed'));
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  await user.click(screen.getByRole('button', { name: 'Save recipe' }));
  expect(
    await screen.findByText('Could not save the recipe because local storage failed.'),
  ).toHaveAttribute('role', 'alert');
  await user.selectOptions(screen.getByRole('combobox', { name: 'Language' }), 'es');
  expect(screen.getByLabelText('Título')).toHaveValue('Lentil soup');
  expect(
    screen.getByText('No se pudo guardar la receta porque falló el almacenamiento local.'),
  ).toBeInTheDocument();
  expect(await recipes.list()).toEqual([]);
  consoleError.mockRestore();
});

it('announces an invalid source URL without creating a recipe', async () => {
  const user = userEvent.setup();
  const { recipes } = renderApp();
  await openRecipes(user);
  await screen.findByText('No recipes yet.');
  await user.click(screen.getByRole('button', { name: 'Import recipe' }));
  await user.type(screen.getByLabelText('Recipe URL'), 'https://example.com');
  await user.click(screen.getByRole('button', { name: 'Review recipe' }));
  expect(screen.getByText('Enter a valid HTTPS Directo al Paladar recipe URL.')).toHaveAttribute(
    'role',
    'alert',
  );
  expect(await recipes.list()).toEqual([]);
});

it('offers a retry when loading recipes fails', async () => {
  const user = userEvent.setup();
  const { recipes } = renderApp();
  vi.spyOn(recipes, 'list').mockRejectedValueOnce(new PersistenceError('Storage failed'));
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  await openRecipes(user);
  expect(
    await screen.findByText('Could not load recipes because local storage failed.'),
  ).toHaveAttribute('role', 'alert');
  await user.click(screen.getByRole('button', { name: 'Try again' }));
  expect(await screen.findByText('No recipes yet.')).toBeInTheDocument();
});

it('reports unexpected import errors without claiming a storage failure', async () => {
  const user = userEvent.setup();
  const { recipes } = renderApp();
  vi.spyOn(recipes, 'import').mockImplementation(() => {
    throw new Error('Unexpected parser error');
  });
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  await openRecipes(user);
  await screen.findByText('No recipes yet.');
  await user.click(screen.getByRole('button', { name: 'Import recipe' }));
  await user.click(screen.getByRole('button', { name: 'Review recipe' }));
  expect(screen.getByText('Could not read the page source. Please try again.')).toHaveAttribute(
    'role',
    'alert',
  );
});
