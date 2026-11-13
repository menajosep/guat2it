import { expect, test } from '@playwright/test';

const pageSource = `<script type="application/ld+json">${JSON.stringify({
  '@type': 'Recipe',
  name: 'Lentil soup',
  recipeYield: 4,
  recipeIngredient: ['2count Pan de molde', '1count Huevos', '200 g lentils', 'salt to taste'],
  recipeInstructions: 'Cook gently.',
  image: 'https://images.example.com/soup.jpg',
})}</script>`;

test('shows two recipes per row on mobile and desktop and opens a thumbnail', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.route('https://images.example.com/**', (route) =>
    route.fulfill({
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="green"/></svg>',
    }),
  );
  const title = 'A very long recipe title with Supercalifragilisticexpialidocious ingredients';
  const titles = [title, 'Green salad', 'Roasted vegetables'];

  await page.goto('/');
  await page.getByRole('button', { name: 'Open menu' }).click();
  await page.locator('ion-menu').getByText('Recipes', { exact: true }).click();
  for (const recipeTitle of titles) {
    const source = `<script type="application/ld+json">${JSON.stringify({
      '@type': 'Recipe',
      name: recipeTitle,
      recipeYield: 4,
      recipeIngredient: ['200 g lentils'],
      recipeInstructions: 'Cook gently.',
      image: 'https://images.example.com/soup.jpg',
    })}</script>`;
    await page.getByRole('button', { name: 'Import recipe' }).click();
    await page.getByLabel('Recipe URL').fill('https://www.directoalpaladar.com/example');
    await page.getByLabel('Page source').fill(source);
    await page.getByRole('button', { name: 'Review recipe' }).click();
    await page.getByRole('button', { name: 'Save recipe' }).click();
    await expect(page.getByRole('button', { name: recipeTitle })).toBeVisible();
  }

  const entry = page.getByRole('button', { name: title });
  const thumbnail = entry.locator('img');
  await expect(entry).toBeVisible();
  await expect(thumbnail).toBeVisible();
  await expect(thumbnail).toHaveJSProperty('naturalWidth', 100);
  for (const width of [320, 1280]) {
    await page.setViewportSize({ width, height: 640 });
    const dimensions = await page.locator('.recipe-list__entry').evaluateAll((elements) => {
      const entries = elements.map((element) => {
        const rect = element.getBoundingClientRect();
        const titleRect = element.lastElementChild?.getBoundingClientRect();
        return {
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom,
          titleLeft: titleRect?.left,
          titleRight: titleRect?.right,
        };
      });
      const content = elements[0]?.closest('ion-content');
      const scrollElement = content?.shadowRoot?.querySelector<HTMLElement>('.inner-scroll');
      return {
        entries,
        pageOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        contentOverflow: scrollElement
          ? scrollElement.scrollWidth > scrollElement.clientWidth
          : true,
      };
    });
    const [first, second, third] = dimensions.entries;
    if (!first || !second || !third) throw new Error('Expected three recipe entries');
    expect(first.top).toBe(second.top);
    expect(first.right).toBeLessThanOrEqual(second.left);
    expect(third.top).toBeGreaterThanOrEqual(Math.max(first.bottom, second.bottom));
    for (const item of dimensions.entries) {
      expect(item.left).toBeGreaterThanOrEqual(0);
      expect(item.right).toBeLessThanOrEqual(width);
      expect(item.titleLeft).toBeGreaterThanOrEqual(item.left);
      expect(item.titleRight).toBeLessThanOrEqual(item.right);
    }
    expect(dimensions.pageOverflow).toBe(false);
    expect(dimensions.contentOverflow).toBe(false);
  }
  await thumbnail.click();
  await expect(page.getByRole('heading', { name: title })).toBeVisible();
});

test('imports, reviews and persists a recipe from pasted page source', async ({ page }) => {
  await page.route('https://images.example.com/**', (route) => route.abort());
  await page.goto('/');
  await page.getByRole('button', { name: 'Open menu' }).click();
  await page.locator('ion-menu').getByText('Recipes', { exact: true }).click();
  await expect(page.getByText('No recipes yet.')).toBeVisible();
  await page.getByRole('button', { name: 'Import recipe' }).click();
  await page.getByLabel('Recipe URL').fill('https://www.directoalpaladar.com/example');
  await page.getByLabel('Page source').fill(pageSource);
  await page.getByRole('button', { name: 'Review recipe' }).click();
  await expect(page.getByLabel('Title')).toHaveValue('Lentil soup');
  await expect(page.getByText('Original ingredient: 2count Pan de molde')).toBeVisible();
  await expect(page.getByText('Original ingredient: 1count Huevos')).toBeVisible();
  const firstIngredient = page.getByRole('group', { name: 'Ingredients 1' });
  await expect(firstIngredient.getByLabel('Ingredient name')).toHaveValue('Pan de molde');
  await expect(firstIngredient.getByLabel('Amount for 1')).toHaveValue('2');
  await expect(firstIngredient.getByLabel('Unit for 1')).toHaveValue('whole');
  await expect(
    firstIngredient.getByRole('checkbox', { name: 'I have reviewed this ingredient' }),
  ).toBeChecked();
  const secondCountIngredient = page.getByRole('group', { name: 'Ingredients 2' });
  await expect(secondCountIngredient.getByLabel('Ingredient name')).toHaveValue('Huevos');
  await expect(secondCountIngredient.getByLabel('Amount for 2')).toHaveValue('1');
  await expect(secondCountIngredient.getByLabel('Unit for 2')).toHaveValue('whole');
  await expect(
    secondCountIngredient.getByRole('checkbox', { name: 'I have reviewed this ingredient' }),
  ).toBeChecked();
  await firstIngredient.getByLabel('Unit for 1').selectOption({ label: 'unit' });
  await page.getByRole('button', { name: 'Save recipe' }).click();
  await expect(page.getByText('Review and confirm this ingredient.')).toBeVisible();
  const fourthIngredient = page.getByRole('group', { name: 'Ingredients 4' });
  await fourthIngredient.getByLabel('Ingredient name').fill('salt');
  await fourthIngredient.getByRole('checkbox', { name: 'I have reviewed this ingredient' }).check();
  await page.getByRole('button', { name: 'Save recipe' }).click();
  await expect(page.getByRole('button', { name: 'Lentil soup' })).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'Open menu' }).click();
  await page.locator('ion-menu').getByText('Recipes', { exact: true }).click();
  await page.getByRole('button', { name: 'Lentil soup' }).click();
  await expect(page.getByRole('heading', { name: 'Lentil soup' })).toBeVisible();
  await expect(page.getByText('Pan de molde — 2 units')).toBeVisible();
  await expect(page.getByText('Huevos — 1 whole')).toBeVisible();
  await expect(page.getByText('lentils — 200 grams')).toBeVisible();
  await expect(page.getByText('salt', { exact: true })).toBeVisible();
  await expect(page.getByText('Cook gently.')).toBeVisible();
  await expect(page.getByRole('img', { name: 'Picture unavailable' })).toBeVisible();
  await page.getByRole('button', { name: 'Delete recipe' }).click();
  const cancelDialog = page.getByRole('alertdialog');
  await expect(cancelDialog).toContainText('Are you sure you want to delete “Lentil soup”?');
  await cancelDialog.getByRole('button', { name: 'Cancel' }).click();
  await expect(cancelDialog).toBeHidden();
  await expect(page.getByRole('heading', { name: 'Lentil soup' })).toBeVisible();
  await page.getByRole('button', { name: 'Delete recipe' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText('No recipes yet.')).toBeVisible();
});

test('cancels recipe edits and persists saved changes after reload', async ({ page }) => {
  const editableSource = `<script type="application/ld+json">${JSON.stringify({
    '@type': 'Recipe',
    name: 'Simple soup',
    recipeYield: 4,
    recipeIngredient: ['200 g lentils'],
    recipeInstructions: 'Cook gently.',
    image: 'https://images.example.com/soup.jpg',
  })}</script>`;
  await page.route('https://images.example.com/**', (route) => route.abort());
  await page.goto('/');
  await page.getByRole('button', { name: 'Open menu' }).click();
  await page.locator('ion-menu').getByText('Recipes', { exact: true }).click();
  await page.getByRole('button', { name: 'Import recipe' }).click();
  await page.getByLabel('Recipe URL').fill('https://www.directoalpaladar.com/example');
  await page.getByLabel('Page source').fill(editableSource);
  await page.getByRole('button', { name: 'Review recipe' }).click();
  await page.getByRole('button', { name: 'Save recipe' }).click();
  await expect(page.getByRole('button', { name: 'Simple soup' })).toBeVisible();
  await page.getByRole('button', { name: 'Simple soup' }).click();
  await page.getByRole('button', { name: 'Edit recipe' }).click();

  await page.getByLabel('Title').fill('Canceled edit');
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByRole('heading', { name: 'Simple soup' })).toBeVisible();

  await page.getByRole('button', { name: 'Edit recipe' }).click();
  await page.getByLabel('Title').fill('Updated soup');
  await page.getByLabel('Yield').fill('2');
  await page.getByLabel('Instructions').fill('Simmer slowly.');
  await page.getByLabel('Picture URL').fill('https://images.example.com/updated.jpg');
  const ingredient = page.getByRole('group', { name: 'Ingredients 1' });
  await ingredient.getByLabel('Ingredient name').fill('red lentils');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('heading', { name: 'Updated soup' })).toBeVisible();
  await expect(page.getByText('Simmer slowly.')).toBeVisible();

  await page.reload();
  await page.getByRole('button', { name: 'Open menu' }).click();
  await page.locator('ion-menu').getByText('Recipes', { exact: true }).click();
  await page.getByRole('button', { name: 'Updated soup' }).click();
  await expect(page.getByRole('heading', { name: 'Updated soup' })).toBeVisible();
  await expect(page.getByText('red lentils — 200 grams')).toBeVisible();
  await expect(page.getByText('Simmer slowly.')).toBeVisible();
});

test('labels, filters, edits, and reloads recipes including uncategorized recipes', async ({
  page,
}) => {
  await page.route('https://images.example.com/**', (route) => route.abort());
  await page.goto('/');
  await page.getByRole('button', { name: 'Open menu' }).click();
  await page.locator('ion-menu').getByText('Recipes', { exact: true }).click();

  const importRecipe = async (
    title: string,
    ingredient: string,
    category?: string,
    labels: readonly string[] = [],
  ) => {
    const source = `<script type="application/ld+json">${JSON.stringify({
      '@type': 'Recipe',
      name: title,
      recipeYield: 2,
      recipeIngredient: [ingredient],
      recipeInstructions: 'Cook gently.',
      image: 'https://images.example.com/soup.jpg',
    })}</script>`;
    await page.getByRole('button', { name: 'Import recipe' }).click();
    await page.getByLabel('Recipe URL').fill('https://www.directoalpaladar.com/example');
    await page.getByLabel('Page source').fill(source);
    await page.getByRole('button', { name: 'Review recipe' }).click();
    if (category) await page.getByLabel('Category').selectOption({ label: category });
    const facetByLabel: Record<string, string> = {
      Poultry: 'Main Ingredient',
      Beef: 'Main Ingredient',
      Vegetables: 'Main Ingredient',
      'Oven/Roast': 'Cooking Method',
      Vegetarian: 'Dietary & Allergens',
      'No-Cook': 'Cooking Method',
    };
    const facets = [...new Set(labels.map((label) => facetByLabel[label]))];
    for (const facet of facets) {
      if (!facet) throw new Error('Recipe label has no facet');
      await page.locator('.recipe-label-group summary').filter({ hasText: facet }).click();
    }
    for (const label of labels) await page.getByRole('checkbox', { name: label }).check();
    await page.getByRole('button', { name: 'Save recipe' }).click();
    await expect(page.getByRole('button', { name: title })).toBeVisible();
  };

  await importRecipe('Lentil soup', '200 g lentils', 'Desserts', [
    'Poultry',
    'Oven/Roast',
    'Vegetarian',
  ]);
  await importRecipe('Beef roast', '200 g beef', 'Desserts', ['Beef', 'Oven/Roast']);
  await importRecipe('Green salad', '100 g lettuce', undefined, ['Vegetables', 'No-Cook']);

  const filterSection = page.locator('.recipe-filter-section');
  const filterSummary = filterSection.locator(':scope > summary');
  await expect(filterSummary).toHaveText('Recipe filters (0 active filters)');
  await expect(filterSection).not.toHaveAttribute('open');
  await filterSummary.click();
  const filter = page.getByLabel('Filter recipes by category');
  await expect(filter).toHaveValue('all');
  await page.setViewportSize({ width: 320, height: 640 });
  const narrowLayout = await page.locator('.recipe-category-filter').evaluate((element) => {
    const label = element.querySelector('label');
    const select = element.querySelector('select');
    if (!label || !select) throw new Error('Recipe category filter controls are missing');
    return {
      labelBottom: label.getBoundingClientRect().bottom,
      selectTop: select.getBoundingClientRect().top,
      selectWidth: select.getBoundingClientRect().width,
      panelRight: element.getBoundingClientRect().right,
    };
  });
  expect(narrowLayout.selectTop).toBeGreaterThanOrEqual(narrowLayout.labelBottom);
  expect(narrowLayout.selectWidth).toBeGreaterThan(200);
  expect(narrowLayout.panelRight).toBeLessThanOrEqual(320);
  const labelPanel = page.locator('.recipe-label-filter');
  await expect(labelPanel).toBeVisible();
  const narrowLabelPanel = await labelPanel.evaluate((element) => ({
    right: element.getBoundingClientRect().right,
    fits: element.scrollWidth <= element.clientWidth,
  }));
  expect(narrowLabelPanel.right).toBeLessThanOrEqual(320);
  expect(narrowLabelPanel.fits).toBe(true);
  await page.setViewportSize({ width: 1024, height: 768 });
  const wideLayout = await page.locator('.recipe-category-filter').evaluate((element) => {
    const label = element.querySelector('label');
    const select = element.querySelector('select');
    if (!label || !select) throw new Error('Recipe category filter controls are missing');
    return {
      labelLeft: label.getBoundingClientRect().left,
      selectLeft: select.getBoundingClientRect().left,
    };
  });
  expect(wideLayout.selectLeft).toBeGreaterThan(wideLayout.labelLeft);

  await filter.selectOption('desserts');
  const mainIngredientFacet = page
    .locator('.recipe-label-filter__facet summary')
    .filter({ hasText: 'Main Ingredient' });
  await mainIngredientFacet.focus();
  await page.keyboard.press('Space');
  const poultryFilter = page.getByRole('checkbox', { name: 'Poultry' });
  await poultryFilter.focus();
  await page.keyboard.press('Space');
  await expect(poultryFilter).toBeChecked();
  await page.getByRole('checkbox', { name: 'Beef' }).check();
  await page
    .locator('.recipe-label-filter__facet summary')
    .filter({ hasText: 'Cooking Method' })
    .click();
  await page.getByRole('checkbox', { name: 'Oven/Roast' }).check();
  await page
    .locator('.recipe-label-filter__facet summary')
    .filter({ hasText: 'Dietary & Allergens' })
    .click();
  await page.getByRole('checkbox', { name: 'Vegetarian' }).check();
  await filterSummary.click();
  await expect(filterSummary).toHaveText('Recipe filters (5 active filters)');
  await expect(filterSection).not.toHaveAttribute('open');
  await filterSummary.click();
  await expect(page.getByRole('checkbox', { name: 'Poultry' })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'Beef' })).toBeChecked();
  await expect(page.getByRole('button', { name: 'Lentil soup' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Beef roast' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Green salad' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Lentil soup' }).click();
  await expect(page.getByText('Category: Desserts')).toBeVisible();
  await page.getByRole('button', { name: 'Edit recipe' }).click();
  await page.locator('.recipe-label-group summary').filter({ hasText: 'Main Ingredient' }).click();
  await page.getByLabel('Category').selectOption('soups-stews');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByText('Category: Soups & Stews')).toBeVisible();
  await page.getByRole('button', { name: 'Back to recipes' }).click();
  await expect(page.getByText('No recipes match the selected filters.')).toBeVisible();
  await filterSummary.click();
  await filter.selectOption('soups-stews');
  await expect(page.getByRole('button', { name: 'Lentil soup' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear label filters' }).click();
  await expect(page.getByRole('button', { name: 'Lentil soup' })).toBeVisible();

  await page.reload();
  await page.getByRole('button', { name: 'Open menu' }).click();
  await page.locator('ion-menu').getByText('Recipes', { exact: true }).click();
  await page.getByRole('button', { name: 'Lentil soup' }).click();
  await expect(page.getByText('Category: Soups & Stews')).toBeVisible();
  await expect(page.getByText('Main Ingredient: Poultry')).toBeVisible();
  await expect(page.getByText('Dietary & Allergens: Vegetarian')).toBeVisible();
  await expect(
    page.getByText(
      'Dietary and allergen labels are user-assigned and are not verified safety claims.',
    ),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Back to recipes' }).click();
  await filterSummary.click();
  await page.getByLabel('Filter recipes by category').selectOption('uncategorized');
  await expect(page.getByRole('button', { name: 'Green salad' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Lentil soup' })).toHaveCount(0);
});
