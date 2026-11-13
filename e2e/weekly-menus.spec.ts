import { expect, test } from '@playwright/test';

test('creates weekly menus and retains them after reload', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Open menu' }).click();
  await page.locator('ion-menu').getByText('Weekly menus', { exact: true }).click();
  await expect(page.getByText('No weekly menus yet.')).toBeVisible();
  await page.getByLabel('Start date').fill('2026-11-16');
  await expect(page.getByLabel('Menu name')).toHaveValue('Weekly menu (2026-11-16)');
  await page.getByLabel('Servings', { exact: true }).fill('4');
  await page.getByRole('button', { name: 'Create weekly menu' }).click();
  await expect(page.getByRole('status')).toHaveText('Weekly menu created.');
  await page.getByLabel('Menu name').fill('Family meals');
  await page.getByLabel('Servings', { exact: true }).fill('2');
  await page.getByRole('button', { name: 'Create weekly menu' }).click();
  const list = page.getByRole('list', { name: 'Saved weekly menus' });
  const firstMenu = list.getByRole('listitem').filter({ hasText: 'Weekly menu (2026-11-16)' });
  const secondMenu = list.getByRole('listitem').filter({ hasText: 'Family meals' });
  await expect(secondMenu.getByText('2 servings', { exact: true })).toBeVisible();
  await firstMenu
    .getByRole('button', { name: 'Edit servings for Weekly menu (2026-11-16) (2026-11-16)' })
    .click();
  await firstMenu.getByLabel('Servings', { exact: true }).fill('3');
  await firstMenu.getByRole('button', { name: 'Save servings' }).click();
  await expect(firstMenu.getByText('3 servings', { exact: true })).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'Open menu' }).click();
  await page.locator('ion-menu').getByText('Weekly menus', { exact: true }).click();
  await expect(firstMenu.getByText('3 servings', { exact: true })).toBeVisible();
  await expect(secondMenu.getByText('2 servings', { exact: true })).toBeVisible();
});
