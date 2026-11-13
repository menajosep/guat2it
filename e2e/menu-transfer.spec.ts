import { expect, test, type Page } from '@playwright/test';

async function navigate(page: Page, destination: string) {
  await page.getByRole('button', { name: 'Open menu' }).click();
  await page.locator('ion-menu').getByText(destination, { exact: true }).click();
}

test('reviews and transfers menu ingredients into active shopping items', async ({ page }) => {
  const source = `<script type="application/ld+json">${JSON.stringify({
    '@type': 'Recipe',
    name: 'Bread',
    recipeYield: 4,
    recipeIngredient: ['500 g flour'],
    recipeInstructions: 'Bake.',
    image: 'https://images.example.com/bread.jpg',
  })}</script>`;
  await page.route('https://images.example.com/**', (route) => route.abort());
  await page.goto('/');
  await page.getByLabel('Item name').fill('Flour');
  await page.getByLabel('Amount', { exact: true }).fill('7');
  await page.getByLabel('Unit', { exact: true }).selectOption('kilogram');
  await page.getByRole('button', { name: 'Add item' }).click();
  await page.getByRole('checkbox', { name: /Flour/ }).click();
  await expect(page.getByRole('status')).toContainText('Marked Flour as completed');
  await page.getByLabel('Item name').fill('flour');
  await page.getByLabel('Amount', { exact: true }).fill('1');
  await page.getByLabel('Unit', { exact: true }).selectOption('kilogram');
  await page.getByRole('button', { name: 'Add item' }).click();
  await expect(page.getByRole('status')).toContainText('Added flour');

  await navigate(page, 'Weekly menus');
  await page.getByLabel('Start date').fill('2026-11-18');
  await page.getByLabel('Menu name').fill('Family');
  await page.getByRole('button', { name: 'Create weekly menu' }).click();
  await page.getByRole('button', { name: 'Select menu' }).click();
  await navigate(page, 'Recipes');
  await page.getByRole('button', { name: 'Import recipe' }).click();
  await page.getByLabel('Recipe URL').fill('https://www.directoalpaladar.com/example');
  await page.getByLabel('Page source').fill(source);
  await page.getByRole('button', { name: 'Review recipe' }).click();
  await page.getByRole('button', { name: 'Save recipe' }).click();
  await page.getByRole('button', { name: 'Bread' }).click();
  await page.getByRole('button', { name: 'Add to weekly menu' }).click();
  await page.getByRole('button', { name: 'Add recipe', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Bread');
  await page.getByLabel('Day').selectOption('1');
  await page.getByLabel('Meal').selectOption('dinner');
  await page.getByRole('button', { name: 'Add recipe', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Dinner');

  await navigate(page, 'Weekly menus');
  await page.getByRole('button', { name: 'Add menu ingredients to shopping list' }).click();
  const group = page.getByRole('group', { name: 'flour' });
  await expect(group.getByText('Bread', { exact: false })).toHaveCount(2);
  await page.getByRole('button', { name: 'Add ingredients' }).click();
  await expect(group.getByRole('alert')).toBeVisible();
  await group.getByLabel('Final unit for flour').selectOption('kilogram');
  await expect(group.getByText('Proposed total: 2 kilograms')).toBeVisible();
  await page.getByRole('button', { name: 'Add ingredients' }).click();
  await expect(page.getByText('Menu ingredients added to the shopping list.')).toBeVisible();
  await navigate(page, 'Shopping list');
  await expect(page.getByText('2 kilograms')).toBeVisible();
  await expect(page.getByText('7 kilograms')).toBeVisible();
  await expect(page.getByRole('checkbox', { name: /Flour.*7 kilograms/ })).toBeChecked();
  await page.reload();
  await expect(page.getByText('2 kilograms')).toBeVisible();
  await expect(page.getByText('7 kilograms')).toBeVisible();
  await expect(page.getByRole('checkbox', { name: /Flour.*7 kilograms/ })).toBeChecked();
});
