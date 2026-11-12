import { expect, test } from '@playwright/test';

test('creates weekly menus and retains them after reload', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Open menu' }).click();
  await page.locator('ion-menu').getByText('Weekly menus', { exact: true }).click();
  await expect(page.getByText('No weekly menus yet.')).toBeVisible();
  await page.getByLabel('Start date').fill('2026-11-16');
  await expect(page.getByLabel('Menu name')).toHaveValue('Weekly menu (2026-11-16)');
  await page.getByRole('button', { name: 'Create weekly menu' }).click();
  await expect(page.getByRole('status')).toHaveText('Weekly menu created.');
  await page.getByLabel('Menu name').fill('Family meals');
  await page.getByRole('button', { name: 'Create weekly menu' }).click();
  const list = page.getByRole('list', { name: 'Saved weekly menus' });
  await expect(list.getByText('Family meals', { exact: false })).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'Open menu' }).click();
  await page.locator('ion-menu').getByText('Weekly menus', { exact: true }).click();
  await expect(list.getByText('Weekly menu (2026-11-16)', { exact: false })).toBeVisible();
  await expect(list.getByText('Family meals', { exact: false })).toBeVisible();
});
