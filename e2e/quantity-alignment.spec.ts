import { devices, expect, test, type Locator } from '@playwright/test';

async function expectAligned(amountControl: Locator, unitSelect: Locator): Promise<void> {
  const [amount, unit] = await Promise.all([amountControl.boundingBox(), unitSelect.boundingBox()]);
  expect(amount).not.toBeNull();
  expect(unit).not.toBeNull();
  if (!amount || !unit) throw new Error('Quantity controls are not visible');

  expect(Math.abs(amount.y - unit.y), 'top edges').toBeLessThanOrEqual(1);
  expect(
    Math.abs(amount.y + amount.height - unit.y - unit.height),
    'bottom edges',
  ).toBeLessThanOrEqual(1);
}

for (const [name, viewport] of [
  ['mobile', { width: 390, height: 844 }],
  ['desktop', { width: 1280, height: 844 }],
] as const) {
  test.describe(`${name} quantity fields`, () => {
    test.use({ viewport });

    test('aligns labelled controls in the add and edit forms', async ({ page }) => {
      await page.goto('/');
      const addForm = page.locator('.add-item-form');
      const amountControl = addForm.locator('.quantity-fields ion-input .input-wrapper');
      const unit = addForm.getByLabel('Unit', { exact: true });
      await expect(addForm.getByLabel('Amount', { exact: true })).toBeVisible();
      await expect(unit).toBeVisible();
      await expectAligned(amountControl, unit);

      await addForm.getByLabel('Item name').fill('Flour');
      await addForm.getByLabel('Amount', { exact: true }).fill('2');
      await unit.selectOption('tablespoon');
      await addForm.getByRole('button', { name: 'Add item' }).click();
      await expect(page.getByText('2 tablespoons')).toBeVisible();

      await page.getByRole('button', { name: 'Edit Flour' }).click();
      const editForm = page.locator('.edit-item-form');
      const editAmount = editForm.getByLabel('Amount for Flour');
      const editUnit = editForm.getByLabel('Unit for Flour');
      await expect(editAmount).toHaveValue('2');
      await expect(editUnit).toHaveValue('tablespoon');
      await expectAligned(editForm.locator('.quantity-fields ion-input .input-wrapper'), editUnit);

      await editUnit.selectOption('to-taste');
      await expect(editAmount).toBeDisabled();
      await expectAligned(editForm.locator('.quantity-fields ion-input .input-wrapper'), editUnit);
      await editForm.getByRole('button', { name: 'Save' }).click();
      await expect(page.locator('.item-quantity')).toHaveText('to taste');
    });
  });
}

test.describe('iOS-style quantity fields', () => {
  test.use({
    userAgent: devices['iPhone 13'].userAgent,
    viewport: devices['iPhone 13'].viewport,
    deviceScaleFactor: devices['iPhone 13'].deviceScaleFactor,
    isMobile: true,
    hasTouch: true,
  });

  test('aligns the labelled amount and unit controls', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByLabel('Amount', { exact: true })).toBeVisible();
    await expectAligned(
      page.locator('.add-item-form .quantity-fields ion-input .input-wrapper'),
      page.getByLabel('Unit', { exact: true }),
    );
  });
});
