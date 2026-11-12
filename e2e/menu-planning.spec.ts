import { expect, test, type Page } from '@playwright/test';

async function navigate(page: Page, destination: string) {
  await page.getByRole('button', { name: 'Open menu' }).click();
  await page.locator('ion-menu').getByText(destination, { exact: true }).click();
}

test('plans a meal, prevents duplicates and deletion, and removes the persisted assignment', async ({
  page,
}) => {
  const source = `<script type="application/ld+json">${JSON.stringify({
    '@type': 'Recipe',
    name: 'Lentil soup',
    recipeYield: 4,
    recipeIngredient: ['200 g lentils'],
    recipeInstructions: 'Cook gently.',
    image: 'https://images.example.com/soup.jpg',
  })}</script>`;
  await page.route('https://images.example.com/**', (route) => route.abort());
  await page.goto('/');
  await navigate(page, 'Weekly menus');
  await page.getByLabel('Start date').fill('2026-11-18');
  await page.getByLabel('Menu name').fill('Family meals');
  await page.getByRole('button', { name: 'Create weekly menu' }).click();
  const menuList = page.getByRole('list', { name: 'Saved weekly menus' });
  await menuList.getByRole('button', { name: 'Select menu' }).click();
  await expect(menuList.getByRole('button', { name: 'Select menu' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );

  await navigate(page, 'Recipes');
  await page.getByRole('button', { name: 'Import recipe' }).click();
  await page.getByLabel('Recipe URL').fill('https://www.directoalpaladar.com/example');
  await page.getByLabel('Page source').fill(source);
  await page.getByRole('button', { name: 'Review recipe' }).click();
  await page.getByRole('button', { name: 'Save recipe' }).click();
  await page.getByRole('button', { name: 'Lentil soup' }).click();
  await expect(page.getByText('Selected menu: Family meals — 2026-11-18')).toBeVisible();
  await page.getByRole('button', { name: 'Add to weekly menu' }).click();
  await page.getByLabel('Meal').selectOption('dinner');
  await page.getByRole('button', { name: 'Add recipe', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Dinner');
  await expect(page.getByRole('status')).toContainText('Lentil soup');
  await page.getByRole('button', { name: 'Add recipe', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('already in this meal');
  await page.getByRole('button', { name: 'Delete recipe' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Delete' }).click();
  await expect(
    page.getByText('Remove this recipe from all weekly menus before deleting it.'),
  ).toBeVisible();

  await page.reload();
  await navigate(page, 'Recipes');
  await page.getByRole('button', { name: 'Lentil soup' }).click();
  await expect(page.getByText('Select a weekly menu before adding a recipe.')).toBeVisible();
  await navigate(page, 'Weekly menus');
  await menuList.getByRole('button', { name: 'Select menu' }).click();
  await expect(
    page.getByRole('button', { name: 'Remove Lentil soup from this meal' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Remove Lentil soup from this meal' }).click();
  const cancelDialog = page.getByRole('alertdialog');
  await expect(cancelDialog).toContainText('Lentil soup');
  await expect(cancelDialog).toContainText('Dinner');
  await cancelDialog.getByRole('button', { name: 'Cancel' }).click();
  await expect(
    page.getByRole('button', { name: 'Remove Lentil soup from this meal' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Remove Lentil soup from this meal' }).click();
  await expect(page.getByRole('alertdialog')).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('alertdialog')).toHaveCount(0);
  await navigate(page, 'Weekly menus');
  await expect(
    page.getByRole('button', { name: 'Remove Lentil soup from this meal' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Remove Lentil soup from this meal' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Remove' }).click();
  await expect(page.getByRole('button', { name: 'Remove Lentil soup from this meal' })).toHaveCount(
    0,
  );
  await page.reload();
  await navigate(page, 'Weekly menus');
  await menuList.getByRole('button', { name: 'Select menu' }).click();
  await expect(page.getByRole('button', { name: 'Remove Lentil soup from this meal' })).toHaveCount(
    0,
  );
  await navigate(page, 'Recipes');
  await page.getByRole('button', { name: 'Lentil soup' }).click();
  await page.getByRole('button', { name: 'Delete recipe' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText('No recipes yet.')).toBeVisible();
});

test('distinguishes selected entries for menus with identical names and dates', async ({
  page,
}) => {
  await page.goto('/');
  await navigate(page, 'Weekly menus');
  await page.getByLabel('Start date').fill('2026-11-18');
  await page.getByLabel('Menu name').fill('Same');
  await page.getByRole('button', { name: 'Create weekly menu' }).click();
  await page.getByLabel('Menu name').fill('Same');
  await page.getByRole('button', { name: 'Create weekly menu' }).click();
  const buttons = page.getByRole('list', { name: 'Saved weekly menus' }).getByRole('button', {
    name: 'Select menu',
  });
  await expect(buttons).toHaveCount(2);
  await buttons.nth(1).click();
  await expect(buttons.nth(0)).toHaveAttribute('aria-pressed', 'false');
  await expect(buttons.nth(1)).toHaveAttribute('aria-pressed', 'true');
  await buttons.nth(0).click();
  await expect(buttons.nth(0)).toHaveAttribute('aria-pressed', 'true');
  await expect(buttons.nth(1)).toHaveAttribute('aria-pressed', 'false');
});
