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
import type { Recipe } from '../features/recipes/domain/recipe';
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

const savedRecipes: [Recipe, Recipe] = [
  {
    id: 'soup',
    sourceUrl: 'https://www.directoalpaladar.com/soup',
    title: 'Lentil soup',
    yield: 4,
    ingredients: [{ name: 'lentils', amount: 200, unit: 'gram' }],
    instructions: 'Cook gently.',
    imageUrl: 'https://images.example.com/soup.jpg',
  },
  {
    id: 'salad',
    sourceUrl: 'https://www.directoalpaladar.com/salad',
    title: 'Green salad',
    yield: 2,
    ingredients: [{ name: 'lettuce', amount: 1, unit: 'whole' }],
    instructions: 'Mix.',
    imageUrl: 'https://images.example.com/salad.jpg',
  },
];

function renderApp() {
  const database = `recipe-ui-${String(++counter)}`;
  const recipes = createRecipeService(database);
  const view = render(
    <App
      shoppingListService={createShoppingListService(database)}
      languageService={createLanguageService()}
      recipeService={recipes}
      weeklyMenuService={createWeeklyMenuService(database)}
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

async function createSavedRecipe(user: ReturnType<typeof userEvent.setup>) {
  const { recipes } = renderApp();
  await openRecipes(user);
  await startReview(user);
  const ingredient = screen.getByRole('group', { name: 'Ingredients 2' });
  await user.clear(within(ingredient).getByLabelText('Ingredient name'));
  await user.type(within(ingredient).getByLabelText('Ingredient name'), 'salt');
  await user.click(
    within(ingredient).getByRole('checkbox', { name: 'I have reviewed this ingredient' }),
  );
  await user.click(screen.getByRole('button', { name: 'Save recipe' }));
  await screen.findByRole('button', { name: 'Lentil soup' });
  return recipes;
}

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
  window.history.replaceState({}, '', '/');
});

it('shows recipe thumbnails and opens the corresponding details by image or keyboard', async () => {
  const user = userEvent.setup();
  const { recipes } = renderApp();
  vi.spyOn(recipes, 'list').mockResolvedValue(savedRecipes);
  await openRecipes(user);

  const soup = await screen.findByRole('button', { name: 'Lentil soup' });
  const salad = screen.getByRole('button', { name: 'Green salad' });
  const soupImage = soup.querySelector('img');
  const saladImage = salad.querySelector('img');
  expect(soupImage).toHaveAttribute('src', 'https://images.example.com/soup.jpg');
  expect(soupImage).toHaveAttribute('loading', 'lazy');
  expect(saladImage).toHaveAttribute('src', 'https://images.example.com/salad.jpg');
  if (!saladImage) throw new Error('Salad thumbnail not found');
  await user.click(saladImage);
  expect(await screen.findByRole('heading', { name: 'Green salad' })).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Back to recipes' }));
  const soupEntry = screen.getByRole('button', { name: 'Lentil soup' });
  soupEntry.focus();
  await user.keyboard('{Enter}');
  expect(await screen.findByRole('heading', { name: 'Lentil soup' })).toBeInTheDocument();
});

it('filters categorized and legacy recipes, retains the filter, and localizes category edits', async () => {
  const user = userEvent.setup();
  const database = `recipe-categories-${String(++counter)}`;
  const recipes = createRecipeService(database);
  const lentils = {
    source: '',
    name: 'lentils',
    quantity: { amount: '200', unit: 'gram' as const },
    confirmed: true,
  };
  const common = {
    sourceUrl: 'https://www.directoalpaladar.com/example',
    yield: '2',
    ingredients: [lentils],
    instructions: 'Cook gently.',
    imageUrl: 'https://images.example.com/soup.jpg',
  };
  await recipes.save({ ...common, title: 'Lentil soup', category: 'desserts' });
  await recipes.save({
    ...common,
    title: 'Green salad',
    ingredients: [{ ...lentils, name: 'lettuce' }],
  });
  render(
    <App
      shoppingListService={createShoppingListService(database)}
      languageService={createLanguageService()}
      recipeService={recipes}
      weeklyMenuService={createWeeklyMenuService(database)}
    />,
  );
  await openRecipes(user);

  const filter = await screen.findByRole('combobox', { name: 'Filter recipes by category' });
  expect(filter).toHaveValue('all');
  await user.selectOptions(filter, 'desserts');
  expect(await screen.findByRole('button', { name: 'Lentil soup' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Green salad' })).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Lentil soup' }));
  expect(await screen.findByText('Category: Desserts')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Back to recipes' }));
  expect(screen.getByRole('combobox', { name: 'Filter recipes by category' })).toHaveValue(
    'desserts',
  );

  await user.selectOptions(
    screen.getByRole('combobox', { name: 'Filter recipes by category' }),
    'uncategorized',
  );
  await user.click(await screen.findByRole('button', { name: 'Green salad' }));
  await user.click(await screen.findByRole('button', { name: 'Edit recipe' }));
  await user.selectOptions(screen.getByRole('combobox', { name: 'Category' }), 'soups-stews');
  await user.selectOptions(screen.getByRole('combobox', { name: 'Language' }), 'es');
  expect(screen.getByRole('combobox', { name: 'Categoría' })).toHaveValue('soups-stews');
  await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));
  expect(await screen.findByText('Categoría: Sopas y guisos')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Volver a recetas' }));
  const spanishFilter = await screen.findByRole('combobox', {
    name: 'Filtrar recetas por categoría',
  });
  expect(spanishFilter).toHaveValue('uncategorized');
  expect(await screen.findByText('No hay recetas en esta categoría.')).toBeInTheDocument();

  await user.selectOptions(spanishFilter, 'soups-stews');
  expect(await screen.findByRole('button', { name: 'Green salad' })).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Green salad' }));
  await user.click(await screen.findByRole('button', { name: 'Editar receta' }));
  await user.selectOptions(screen.getByRole('combobox', { name: 'Categoría' }), '');
  await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));
  expect(await screen.findByText('Categoría: Sin categoría')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Volver a recetas' }));
  expect(await screen.findByText('No hay recetas en esta categoría.')).toBeInTheDocument();
  const filterAfterClear = screen.getByRole('combobox', {
    name: 'Filtrar recetas por categoría',
  });
  await user.selectOptions(filterAfterClear, 'uncategorized');
  expect(await screen.findByRole('button', { name: 'Green salad' })).toBeInTheDocument();
  await user.selectOptions(filterAfterClear, 'beverages');
  expect(await screen.findByText('No hay recetas en esta categoría.')).toBeInTheDocument();
  await user.selectOptions(filterAfterClear, 'all');
  expect(await screen.findByRole('button', { name: 'Lentil soup' })).toBeInTheDocument();
  const saved = await recipes.list();
  expect(saved.map(({ title, category }) => [title, category])).toEqual(
    expect.arrayContaining([
      ['Lentil soup', 'desserts'],
      ['Green salad', undefined],
    ]),
  );
});

it('keeps failed and invalid thumbnails accessible and independent when language changes', async () => {
  const user = userEvent.setup();
  const { recipes } = renderApp();
  vi.spyOn(recipes, 'list').mockResolvedValue([
    ...savedRecipes,
    { ...savedRecipes[0], id: 'invalid', title: 'Invalid picture', imageUrl: 'http://example.com' },
  ]);
  await openRecipes(user);
  const soup = await screen.findByRole('button', { name: 'Lentil soup' });
  const soupImage = soup.querySelector('img');
  if (!soupImage) throw new Error('Soup thumbnail not found');
  fireEvent.error(soupImage);
  expect(soup).toHaveAccessibleDescription('Picture unavailable');
  expect(screen.getByRole('button', { name: 'Invalid picture' })).toHaveAccessibleDescription(
    'Picture unavailable',
  );
  expect(screen.getByRole('button', { name: 'Green salad' }).querySelector('img')).toHaveAttribute(
    'src',
    'https://images.example.com/salad.jpg',
  );
  await user.selectOptions(screen.getByRole('combobox', { name: 'Language' }), 'es');
  expect(soup).toHaveAccessibleDescription('Imagen no disponible');
  await user.selectOptions(screen.getByRole('combobox', { name: 'Idioma' }), 'ca');
  expect(soup).toHaveAccessibleDescription('Imatge no disponible');
  await user.click(soup);
  expect(await screen.findByRole('heading', { name: 'Lentil soup' })).toBeInTheDocument();
});

it('restores a thumbnail after editing its failed picture and preserves detail fallbacks', async () => {
  const user = userEvent.setup();
  await createSavedRecipe(user);
  const entry = screen.getByRole('button', { name: 'Lentil soup' });
  const image = entry.querySelector('img');
  if (!image) throw new Error('Recipe thumbnail not found');
  fireEvent.error(image);
  expect(entry).toHaveAccessibleDescription('Picture unavailable');
  await user.click(entry);

  const detailImage = screen.getByRole('img', { name: 'Lentil soup' });
  fireEvent.error(detailImage);
  expect(screen.getByRole('img', { name: 'Picture unavailable' })).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Edit recipe' }));
  const reviewImage = screen.getByRole('img', { name: 'Lentil soup' });
  fireEvent.error(reviewImage);
  expect(screen.getByRole('img', { name: 'Picture unavailable' })).toBeInTheDocument();
  await user.clear(screen.getByLabelText('Picture URL'));
  await user.type(screen.getByLabelText('Picture URL'), 'https://images.example.com/updated.jpg');
  expect(screen.getByRole('img', { name: 'Lentil soup' })).toHaveAttribute(
    'src',
    'https://images.example.com/updated.jpg',
  );
  await user.click(screen.getByRole('button', { name: 'Save changes' }));
  await screen.findByRole('heading', { name: 'Lentil soup' });
  await user.click(screen.getByRole('button', { name: 'Back to recipes' }));
  const updated = screen.getByRole('button', { name: 'Lentil soup' });
  expect(updated.querySelector('img')).toHaveAttribute(
    'src',
    'https://images.example.com/updated.jpg',
  );
  expect(updated).not.toHaveAccessibleDescription('Picture unavailable');
});

it('retains unresolved ingredients, requires confirmation, and saves the corrected recipe', async () => {
  const user = userEvent.setup();
  const { recipes } = renderApp();
  await openRecipes(user);
  await startReview(user);
  await user.selectOptions(screen.getByRole('combobox', { name: 'Category' }), 'desserts');
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
    {
      title: 'Lentil soup',
      category: 'desserts',
      ingredients: [{ name: 'lentils', amount: 200 }, { name: 'salt' }],
    },
  ]);
});

it('validates, saves and edits countable ingredient units with localized display', async () => {
  const user = userEvent.setup();
  const { recipes } = renderApp();
  await openRecipes(user);
  await startReview(user);

  const first = screen.getByRole('group', { name: 'Ingredients 1' });
  const amount = await waitFor(() => {
    const input = first.querySelector<HTMLInputElement>('ion-input input');
    if (!input) throw new Error('Ingredient amount input not rendered');
    return input;
  });
  await user.clear(amount);
  await user.selectOptions(within(first).getByLabelText('Unit for 1'), 'unit');
  const second = screen.getByRole('group', { name: 'Ingredients 2' });
  await user.clear(within(second).getByLabelText('Ingredient name'));
  await user.type(within(second).getByLabelText('Ingredient name'), 'salt');
  await user.click(
    within(second).getByRole('checkbox', { name: 'I have reviewed this ingredient' }),
  );
  await user.click(screen.getByRole('button', { name: 'Save recipe' }));
  expect(await within(first).findByText('Enter an amount for this unit.')).toBeInTheDocument();
  expect(await recipes.list()).toEqual([]);

  await user.type(amount, '1');
  await user.click(screen.getByRole('button', { name: 'Save recipe' }));
  await user.click(await screen.findByRole('button', { name: 'Lentil soup' }));
  expect(await screen.findByText('lentils — 1 unit')).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Edit recipe' }));
  const edit = screen.getByRole('group', { name: 'Ingredients 1' });
  expect(within(edit).getByLabelText('Unit for 1')).toHaveValue('unit');
  const editAmount = await waitFor(() => {
    const input = edit.querySelector<HTMLInputElement>('ion-input input');
    if (!input) throw new Error('Ingredient amount input not rendered');
    return input;
  });
  await user.clear(editAmount);
  await user.type(editAmount, '2');
  await user.click(screen.getByRole('button', { name: 'Save changes' }));
  expect(await screen.findByText('lentils — 2 units')).toBeInTheDocument();
  expect(await recipes.list()).toMatchObject([
    { ingredients: [{ amount: 2, unit: 'unit' }, { name: 'salt' }] },
  ]);
  await user.selectOptions(screen.getByRole('combobox', { name: 'Language' }), 'es');
  expect(await screen.findByText('lentils — 2 unidades')).toBeInTheDocument();
  await user.selectOptions(screen.getByRole('combobox', { name: 'Idioma' }), 'ca');
  expect(await screen.findByText('lentils — 2 unitats')).toBeInTheDocument();
});

it('preserves ingredient quantities when changing the language and saves them', async () => {
  const user = userEvent.setup();
  const { recipes } = renderApp();
  await openRecipes(user);
  await startReview(user);
  const first = screen.getByRole('group', { name: 'Ingredients 1' });
  const amount = await waitFor(() => {
    const input = first.querySelector<HTMLInputElement>('ion-input input');
    if (!input) throw new Error('Ingredient amount input not rendered');
    return input;
  });
  await user.selectOptions(within(first).getByLabelText('Unit for 1'), 'tablespoon');
  await user.selectOptions(screen.getByRole('combobox', { name: 'Language' }), 'es');
  const selector = within(first).getByLabelText('Unidad para 1');
  expect(selector).toHaveValue('tablespoon');
  expect(amount).toHaveValue('200');
  const labels = Array.from(selector.querySelectorAll('option'))
    .slice(1)
    .map((option) => option.textContent);
  expect(labels).toEqual([...labels].sort(new Intl.Collator('es').compare));
  await user.selectOptions(screen.getByRole('combobox', { name: 'Idioma' }), 'en');
  const second = screen.getByRole('group', { name: 'Ingredients 2' });
  await user.clear(within(second).getByLabelText('Ingredient name'));
  await user.type(within(second).getByLabelText('Ingredient name'), 'salt');
  await user.click(
    within(second).getByRole('checkbox', { name: 'I have reviewed this ingredient' }),
  );
  await user.click(screen.getByRole('button', { name: 'Save recipe' }));
  await screen.findByRole('button', { name: 'Lentil soup' });
  expect(await recipes.list()).toMatchObject([
    { ingredients: [{ amount: 200, unit: 'tablespoon' }, { name: 'salt' }] },
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

it('keeps a recipe when deletion is canceled and removes it when confirmed', async () => {
  const user = userEvent.setup();
  const recipes = await createSavedRecipe(user);

  await user.click(screen.getByRole('button', { name: 'Lentil soup' }));
  await screen.findByRole('heading', { name: 'Lentil soup' });
  await user.click(screen.getByRole('button', { name: 'Delete recipe' }));
  let dialog = await screen.findByRole('alertdialog');
  expect(dialog).toHaveTextContent('Are you sure you want to delete “Lentil soup”?');
  await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
  expect(await screen.findByRole('heading', { name: 'Lentil soup' })).toBeInTheDocument();
  expect(await recipes.list()).toHaveLength(1);

  await user.click(screen.getByRole('button', { name: 'Delete recipe' }));
  dialog = await screen.findByRole('alertdialog');
  await user.click(within(dialog).getByRole('button', { name: 'Delete' }));
  expect(await screen.findByText('No recipes yet.')).toBeInTheDocument();
  expect(await recipes.list()).toEqual([]);
});

it('announces recipe deletion failure and leaves the recipe available', async () => {
  const user = userEvent.setup();
  const recipes = await createSavedRecipe(user);
  vi.spyOn(recipes, 'remove').mockRejectedValue(
    new PersistenceError('Storage failed', { action: 'remove-recipe' }),
  );
  vi.spyOn(console, 'error').mockImplementation(() => undefined);

  await user.click(screen.getByRole('button', { name: 'Lentil soup' }));
  await screen.findByRole('heading', { name: 'Lentil soup' });
  await user.click(screen.getByRole('button', { name: 'Delete recipe' }));
  const dialog = await screen.findByRole('alertdialog');
  await user.click(within(dialog).getByRole('button', { name: 'Delete' }));

  expect(
    await screen.findByText('Could not delete the recipe because local storage failed.'),
  ).toHaveAttribute('role', 'alert');
  expect(screen.getByRole('heading', { name: 'Lentil soup' })).toBeInTheDocument();
  expect(await recipes.list()).toHaveLength(1);
});

it('edits saved recipe fields and ingredient order without changing its identity or source', async () => {
  const user = userEvent.setup();
  const recipes = await createSavedRecipe(user);
  const original = (await recipes.list())[0];
  if (!original) throw new Error('Expected the saved recipe');

  await user.click(screen.getByRole('button', { name: 'Lentil soup' }));
  await screen.findByRole('heading', { name: 'Lentil soup' });
  await user.click(screen.getByRole('button', { name: 'Edit recipe' }));
  expect(screen.getByLabelText('Title')).toHaveValue('Lentil soup');
  expect(screen.getByLabelText('Yield')).toHaveValue('4');
  expect(screen.queryByText(/Original ingredient:/)).not.toBeInTheDocument();

  await user.clear(screen.getByLabelText('Title'));
  await user.type(screen.getByLabelText('Title'), 'Updated soup');
  await user.clear(screen.getByLabelText('Yield'));
  await user.type(screen.getByLabelText('Yield'), '2');
  await user.clear(screen.getByLabelText('Instructions'));
  await user.type(screen.getByLabelText('Instructions'), 'Simmer slowly.');
  await user.clear(screen.getByLabelText('Picture URL'));
  await user.type(screen.getByLabelText('Picture URL'), 'https://images.example.com/updated.jpg');

  const salt = screen.getByRole('group', { name: 'Ingredients 2' });
  await user.click(within(salt).getByRole('button', { name: 'Remove ingredient' }));
  await user.click(screen.getByRole('button', { name: 'Add ingredient' }));
  const thirdIngredient = screen.getByRole('group', { name: 'Ingredients 2' });
  await user.type(within(thirdIngredient).getByLabelText('Ingredient name'), 'pepper');
  await user.click(screen.getByRole('button', { name: 'Save changes' }));

  expect(await screen.findByRole('heading', { name: 'Updated soup' })).toBeInTheDocument();
  expect(screen.getByText('Simmer slowly.')).toBeInTheDocument();
  const updated = await recipes.list();
  expect(updated).toHaveLength(1);
  expect(updated[0]).toMatchObject({
    id: original.id,
    sourceUrl: original.sourceUrl,
    title: 'Updated soup',
    yield: 2,
    ingredients: [{ name: 'lentils', amount: 200 }, { name: 'pepper' }],
    instructions: 'Simmer slowly.',
    imageUrl: 'https://images.example.com/updated.jpg',
  });

  await user.click(screen.getByRole('button', { name: 'Back to recipes' }));
  expect(await screen.findByRole('button', { name: 'Updated soup' })).toBeInTheDocument();
});

it('cancels recipe editing without changing saved values', async () => {
  const user = userEvent.setup();
  const recipes = await createSavedRecipe(user);
  const original = (await recipes.list())[0];
  if (!original) throw new Error('Expected the saved recipe');

  await user.click(screen.getByRole('button', { name: 'Lentil soup' }));
  await screen.findByRole('heading', { name: 'Lentil soup' });
  await user.click(screen.getByRole('button', { name: 'Edit recipe' }));
  await user.clear(screen.getByLabelText('Title'));
  await user.type(screen.getByLabelText('Title'), 'Not saved');
  await user.selectOptions(screen.getByRole('combobox', { name: 'Category' }), 'desserts');
  await user.click(screen.getByRole('button', { name: 'Cancel' }));

  expect(await screen.findByRole('heading', { name: 'Lentil soup' })).toBeInTheDocument();
  expect(await recipes.list()).toEqual([original]);
});

it('keeps an invalid edit available and identifies missing required ingredients', async () => {
  const user = userEvent.setup();
  const recipes = await createSavedRecipe(user);

  await user.click(screen.getByRole('button', { name: 'Lentil soup' }));
  await screen.findByRole('heading', { name: 'Lentil soup' });
  await user.click(screen.getByRole('button', { name: 'Edit recipe' }));
  const ingredient1 = screen.getByRole('group', { name: 'Ingredients 1' });
  await user.click(within(ingredient1).getByRole('button', { name: 'Remove ingredient' }));
  const remainingIngredient = screen.getByRole('group', { name: 'Ingredients 1' });
  await user.click(within(remainingIngredient).getByRole('button', { name: 'Remove ingredient' }));
  await user.click(screen.getByRole('button', { name: 'Save changes' }));

  expect(await screen.findByText('At least one ingredient is required.')).toHaveAttribute(
    'role',
    'alert',
  );
  expect(screen.getByLabelText('Title')).toHaveValue('Lentil soup');
  expect(await recipes.list()).toHaveLength(1);
});

it('retains the edit draft and translates storage failures when language changes', async () => {
  const user = userEvent.setup();
  const recipes = await createSavedRecipe(user);
  vi.spyOn(recipes, 'update').mockRejectedValueOnce(
    new PersistenceError('Storage failed', { action: 'update-recipe' }),
  );
  vi.spyOn(console, 'error').mockImplementation(() => undefined);

  await user.click(screen.getByRole('button', { name: 'Lentil soup' }));
  await screen.findByRole('heading', { name: 'Lentil soup' });
  await user.click(screen.getByRole('button', { name: 'Edit recipe' }));
  await user.clear(screen.getByLabelText('Title'));
  await user.type(screen.getByLabelText('Title'), 'Updated soup');
  await user.selectOptions(screen.getByRole('combobox', { name: 'Category' }), 'desserts');
  await user.click(screen.getByRole('button', { name: 'Save changes' }));

  expect(
    await screen.findByText('Could not update the recipe because local storage failed.'),
  ).toHaveAttribute('role', 'alert');
  await user.selectOptions(screen.getByRole('combobox', { name: 'Language' }), 'es');
  expect(screen.getByLabelText('Título')).toHaveValue('Updated soup');
  expect(
    screen.getByText('No se pudo actualizar la receta porque falló el almacenamiento local.'),
  ).toBeInTheDocument();
  const saved = (await recipes.list())[0];
  if (!saved) throw new Error('Expected the saved recipe');
  expect(saved.title).toBe('Lentil soup');
  expect(saved.category).toBeUndefined();
  expect(screen.getByRole('combobox', { name: 'Categoría' })).toHaveValue('desserts');
});

it('reports when a recipe disappears while being edited without recreating it', async () => {
  const user = userEvent.setup();
  const recipes = await createSavedRecipe(user);

  await user.click(screen.getByRole('button', { name: 'Lentil soup' }));
  await screen.findByRole('heading', { name: 'Lentil soup' });
  await user.click(screen.getByRole('button', { name: 'Edit recipe' }));
  const saved = (await recipes.list())[0];
  if (!saved) throw new Error('Expected the saved recipe');
  await recipes.remove(saved.id);
  await user.clear(screen.getByLabelText('Title'));
  await user.type(screen.getByLabelText('Title'), 'Updated soup');
  await user.click(screen.getByRole('button', { name: 'Save changes' }));

  expect(await screen.findByText('This recipe is no longer available.')).toHaveAttribute(
    'role',
    'alert',
  );
  expect(screen.getByLabelText('Title')).toHaveValue('Updated soup');
  expect(await recipes.list()).toEqual([]);
});
