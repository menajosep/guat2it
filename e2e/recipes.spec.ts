import { expect, test } from '@playwright/test';

const pageSource = `<script type="application/ld+json">${JSON.stringify({
  '@type': 'Recipe',
  name: 'Lentil soup',
  recipeYield: 4,
  recipeIngredient: ['200 g lentils', 'salt to taste'],
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
  await expect(page.getByText('Original ingredient: salt to taste')).toBeVisible();
  await page.getByRole('button', { name: 'Save recipe' }).click();
  await expect(page.getByText('Review and confirm this ingredient.')).toBeVisible();
  const secondIngredient = page.getByRole('group', { name: 'Ingredients 2' });
  await secondIngredient.getByLabel('Ingredient name').fill('salt');
  await secondIngredient.getByRole('checkbox', { name: 'I have reviewed this ingredient' }).check();
  await page.getByRole('button', { name: 'Save recipe' }).click();
  await expect(page.getByRole('button', { name: 'Lentil soup' })).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'Open menu' }).click();
  await page.locator('ion-menu').getByText('Recipes', { exact: true }).click();
  await page.getByRole('button', { name: 'Lentil soup' }).click();
  await expect(page.getByRole('heading', { name: 'Lentil soup' })).toBeVisible();
  await expect(page.getByText('lentils — 200 grams')).toBeVisible();
  await expect(page.getByText('salt', { exact: true })).toBeVisible();
  await expect(page.getByText('Cook gently.')).toBeVisible();
  await expect(page.getByRole('img', { name: 'Picture unavailable' })).toBeVisible();
});
