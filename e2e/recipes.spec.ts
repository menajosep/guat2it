import { expect, test } from '@playwright/test';

const pageSource = `<script type="application/ld+json">${JSON.stringify({
  '@type': 'Recipe',
  name: 'Lentil soup',
  recipeYield: 4,
  recipeIngredient: ['2count Pan de molde', '1count Huevos', '200 g lentils', 'salt to taste'],
  recipeInstructions: 'Cook gently.',
  image: 'https://images.example.com/soup.jpg',
})}</script>`;

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
