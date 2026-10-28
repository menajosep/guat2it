import { expect, test } from '@playwright/test';

test('switches language, keeps it after a reload and shows units in that language', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByText('Shopping list', { exact: true })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');

  await page.getByLabel('Language').selectOption({ label: 'Català' });
  await expect(page.getByText('Llista de la compra', { exact: true })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ca');

  await page.getByLabel("Nom de l'article").fill('Farina');
  await page.getByLabel('Quantitat', { exact: true }).fill('2');
  await page.getByLabel('Unitat', { exact: true }).selectOption({ label: 'cullerada' });
  await page.getByRole('button', { name: 'Afegeix un article' }).click();
  await expect(page.getByRole('status')).toHaveText("S'ha afegit Farina");
  await expect(page.getByText('2 cullerades')).toBeVisible();

  await page.reload();
  await expect(page.getByText('Llista de la compra', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Idioma')).toHaveValue('ca');
  await expect(page.getByText('2 cullerades')).toBeVisible();

  await page.getByLabel('Idioma').selectOption({ label: 'English' });
  await expect(page.getByText('Shopping list', { exact: true })).toBeVisible();
  await expect(page.getByText('2 tablespoons')).toBeVisible();
  await expect(page.getByRole('checkbox', { name: /Farina/ })).toBeVisible();
});
