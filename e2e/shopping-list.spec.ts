import { expect, test } from '@playwright/test';

test('adds, completes and removes an item, and keeps it after a reload', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('Shopping list', { exact: true })).toBeVisible();
  await expect(page.getByText(/shopping list is empty/i)).toBeVisible();

  await page.getByLabel('Item name').fill('Milk');
  await page.getByRole('button', { name: 'Add item' }).click();
  await expect(page.getByRole('status')).toHaveText('Added Milk');
  const checkbox = page.getByRole('checkbox', { name: 'Milk' });
  await expect(checkbox).toBeVisible();

  await page.reload();
  await expect(checkbox).toBeVisible();

  await checkbox.click();
  await expect(checkbox).toBeChecked();
  await expect(page.getByRole('status')).toHaveText('Marked Milk as completed');
  await page.reload();
  await expect(checkbox).toBeChecked();
  await checkbox.click();
  await expect(checkbox).not.toBeChecked();
  await expect(page.getByRole('status')).toHaveText('Marked Milk as active');

  await page.getByRole('button', { name: 'Remove Milk' }).click();
  await expect(page.getByRole('status')).toHaveText('Removed Milk');
  await expect(page.getByText(/shopping list is empty/i)).toBeVisible();
});

test('renames an item inline and keeps the new name after a reload', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Item name').fill('Milk');
  await page.getByRole('button', { name: 'Add item' }).click();
  await expect(page.getByRole('checkbox', { name: 'Milk' })).toBeVisible();

  await page.getByRole('button', { name: 'Edit Milk' }).click();
  const field = page.getByLabel('New name for Milk');
  await expect(field).toBeFocused();
  await expect(field).toHaveValue('Milk');

  await field.fill('   ');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByRole('list', { name: 'Shopping items' }).getByRole('alert')).toHaveText(
    'Enter an item name.',
  );

  await field.fill('Oat milk');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByRole('status')).toHaveText('Renamed Milk to Oat milk');
  await expect(page.getByRole('checkbox', { name: 'Oat milk' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Edit Oat milk' })).toBeFocused();

  await page.reload();
  await expect(page.getByRole('checkbox', { name: 'Oat milk' })).toBeVisible();
});

test('cancels an inline edit with Escape', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Item name').fill('Bread');
  await page.getByRole('button', { name: 'Add item' }).click();
  await page.getByRole('button', { name: 'Edit Bread' }).click();

  await page.getByLabel('New name for Bread').fill('Rye');
  await page.keyboard.press('Escape');
  await expect(page.getByLabel('New name for Bread')).toHaveCount(0);
  await expect(page.getByRole('checkbox', { name: 'Bread' })).toBeVisible();
});

test('rejects a blank item name', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Add item' }).click();
  await expect(page.getByRole('alert')).toHaveText('Enter an item name.');
});
