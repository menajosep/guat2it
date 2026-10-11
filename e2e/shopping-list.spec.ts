import { expect, test } from '@playwright/test';

test('adds, completes and removes an item, and keeps it after a reload', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('Shopping list', { exact: true })).toBeVisible();
  await expect(page.getByText(/shopping list is empty/i)).toBeVisible();

  await page.getByLabel('Item name').fill('Milk');
  await page.getByRole('button', { name: 'Add item' }).click();
  await expect(page.getByText('Milk')).toBeVisible();

  await page.reload();
  await expect(page.getByText('Milk')).toBeVisible();

  const checkbox = page.getByRole('checkbox', { name: 'Milk' });
  await checkbox.click();
  await expect(checkbox).toBeChecked();
  await page.reload();
  await expect(checkbox).toBeChecked();
  await checkbox.click();
  await expect(checkbox).not.toBeChecked();

  await page.getByRole('button', { name: 'Remove Milk' }).click();
  await expect(page.getByText(/shopping list is empty/i)).toBeVisible();
});

test('rejects a blank item name', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Add item' }).click();
  await expect(page.getByRole('alert')).toHaveText('Enter an item name.');
});
