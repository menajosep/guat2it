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
  await page.getByLabel('Servings', { exact: true }).fill('4');
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
  await page.getByLabel('Servings', { exact: true }).fill('4');
  await page.getByRole('button', { name: 'Create weekly menu' }).click();
  await page.getByLabel('Menu name').fill('Same');
  await page.getByLabel('Servings', { exact: true }).fill('4');
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

test('confirms deletion of a populated menu without deleting recipes or other assignments', async ({
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
  await page.getByLabel('Menu name').fill('First menu');
  await page.getByLabel('Servings', { exact: true }).fill('4');
  await page.getByRole('button', { name: 'Create weekly menu' }).click();
  await page.getByLabel('Menu name').fill('Second menu');
  await page.getByLabel('Servings', { exact: true }).fill('2');
  await page.getByRole('button', { name: 'Create weekly menu' }).click();
  const list = page.getByRole('list', { name: 'Saved weekly menus' });
  const first = list.getByRole('listitem').filter({ hasText: 'First menu' });
  const second = list.getByRole('listitem').filter({ hasText: 'Second menu' });
  await first.getByRole('button', { name: 'Select menu' }).click();

  await navigate(page, 'Recipes');
  await page.getByRole('button', { name: 'Import recipe' }).click();
  await page.getByLabel('Recipe URL').fill('https://www.directoalpaladar.com/example');
  await page.getByLabel('Page source').fill(source);
  await page.getByRole('button', { name: 'Review recipe' }).click();
  await page.getByRole('button', { name: 'Save recipe' }).click();
  await page.getByRole('button', { name: 'Lentil soup' }).click();
  await page.getByRole('button', { name: 'Add to weekly menu' }).click();
  await page.getByRole('button', { name: 'Add recipe', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Lentil soup');
  await navigate(page, 'Weekly menus');
  await second.getByRole('button', { name: 'Select menu' }).click();
  await navigate(page, 'Recipes');
  await page.getByRole('button', { name: 'Lentil soup' }).click();
  await page.getByRole('button', { name: 'Add to weekly menu' }).click();
  await page.getByRole('button', { name: 'Add recipe', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Lentil soup');

  await navigate(page, 'Weekly menus');
  await first.getByRole('button', { name: 'Delete menu First menu' }).click();
  let dialog = page.getByRole('alertdialog');
  await expect(dialog).toContainText('First menu');
  await expect(dialog).toContainText('2026-11-18');
  await expect(dialog).toContainText('saved recipes will be kept');
  await dialog.getByRole('button', { name: 'Cancel' }).click();
  await expect(first).toBeVisible();
  await first.getByRole('button', { name: 'Delete menu First menu' }).click();
  await expect(page.getByRole('alertdialog')).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('alertdialog')).toHaveCount(0);
  await navigate(page, 'Weekly menus');
  await expect(first).toBeVisible();
  await first.getByRole('button', { name: 'Delete menu First menu' }).click();
  dialog = page.getByRole('alertdialog');
  await dialog.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText('Weekly menu deleted.')).toBeVisible();
  await expect(first).toHaveCount(0);
  await expect(second.getByRole('button', { name: 'Select menu' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(
    page.getByRole('button', { name: 'Remove Lentil soup from this meal' }),
  ).toBeVisible();

  await page.reload();
  await navigate(page, 'Weekly menus');
  await expect(first).toHaveCount(0);
  await second.getByRole('button', { name: 'Select menu' }).click();
  await expect(
    page.getByRole('button', { name: 'Remove Lentil soup from this meal' }),
  ).toBeVisible();
  await navigate(page, 'Recipes');
  await page.getByRole('button', { name: 'Lentil soup' }).click();
  await page.getByRole('button', { name: 'Delete recipe' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Delete' }).click();
  await expect(
    page.getByText('Remove this recipe from all weekly menus before deleting it.'),
  ).toBeVisible();
});
