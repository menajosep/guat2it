import { expect, test } from '@playwright/test';

test('orders units in the current language and preserves a draft across language changes', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByLabel('Item name').fill('Flour');
  await page.getByLabel('Amount', { exact: true }).fill('2');
  await page.getByLabel('Unit', { exact: true }).selectOption('tablespoon');
  for (const [locale, languageLabel, language, unitLabel, amountLabel, emptyLabel] of [
    ['es', 'Language', 'Español', 'Unidad', 'Cantidad', 'Sin unidad'],
    ['ca', 'Idioma', 'Català', 'Unitat', 'Quantitat', 'Sense unitat'],
  ] as const) {
    await page.getByLabel(languageLabel).selectOption({ label: language });
    const unit = page.getByLabel(unitLabel, { exact: true });
    await expect(unit).toHaveValue('tablespoon');
    await expect(page.getByLabel(amountLabel, { exact: true })).toHaveValue('2');
    const labels = await unit.locator('option').allTextContents();
    expect(labels).toHaveLength(41);
    expect(labels[0]).toBe(emptyLabel);
    const translated = labels.slice(1);
    expect(translated).toEqual([...translated].sort(new Intl.Collator(locale).compare));
  }
  await page.getByRole('button', { name: 'Afegeix un article' }).click();
  await expect(page.getByText('2 cullerades')).toBeVisible();
  await page.reload();
  await expect(page.getByText('2 cullerades')).toBeVisible();
});

test('switches language, keeps it after a reload and shows units in that language', async ({
  page,
}) => {
  await page.goto('/');
  await expect(
    page.locator('#main-content').getByText('Shopping list', { exact: true }),
  ).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');

  await page.getByLabel('Language').selectOption({ label: 'Català' });
  await expect(
    page.locator('#main-content').getByText('Llista de la compra', { exact: true }),
  ).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ca');

  await page.getByLabel("Nom de l'article").fill('Farina');
  await page.getByLabel('Quantitat', { exact: true }).fill('2');
  await page.getByLabel('Unitat', { exact: true }).selectOption({ label: 'cullerada' });
  await page.getByRole('button', { name: 'Afegeix un article' }).click();
  await expect(page.getByRole('status')).toHaveText("S'ha afegit Farina");
  await expect(page.getByText('2 cullerades')).toBeVisible();

  await page.reload();
  await expect(
    page.locator('#main-content').getByText('Llista de la compra', { exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel('Idioma')).toHaveValue('ca');
  await expect(page.getByText('2 cullerades')).toBeVisible();

  await page.getByLabel('Idioma').selectOption({ label: 'English' });
  await expect(
    page.locator('#main-content').getByText('Shopping list', { exact: true }),
  ).toBeVisible();
  await expect(page.getByText('2 tablespoons')).toBeVisible();
  await expect(page.getByRole('checkbox', { name: /Farina/ })).toBeVisible();
});
