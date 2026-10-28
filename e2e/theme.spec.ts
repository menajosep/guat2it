/// <reference lib="dom" />

import { expect, test, type Locator, type Page } from '@playwright/test';

type ColorProperty = 'color' | 'backgroundColor' | 'borderTopColor' | 'outlineColor' | 'stroke';

async function color(locator: Locator, property: ColorProperty): Promise<string> {
  return locator.evaluate((element, key) => getComputedStyle(element)[key], property);
}

function contrast(first: string, second: string): number {
  function luminance(value: string): number {
    const components = value.match(/[\d.]+/g);
    if (!components || components.length < 3 || (components[3] && Number(components[3]) !== 1)) {
      throw new Error(`Expected an opaque RGB color, got ${value}`);
    }
    const [red, green, blue] = components.slice(0, 3).map((component) => {
      const channel = Number(component) / 255;
      return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    });
    if (red === undefined || green === undefined || blue === undefined) {
      throw new Error(`Expected three RGB channels, got ${value}`);
    }
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  }
  const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  if (lighter === undefined || darker === undefined) throw new Error('Missing luminance');
  return (lighter + 0.05) / (darker + 0.05);
}

async function assertContrast(
  foreground: Locator,
  property: ColorProperty,
  background: Locator,
  minimum: number,
): Promise<void> {
  const [front, back] = await Promise.all([
    color(foreground, property),
    color(background, 'backgroundColor'),
  ]);
  expect(contrast(front, back), `${front} against ${back}`).toBeGreaterThanOrEqual(minimum);
}

async function addItem(page: Page, name: string): Promise<void> {
  await page.getByLabel('Item name').fill(name);
  await page.getByRole('button', { name: 'Add item' }).click();
  await expect(page.getByRole('checkbox', { name })).toBeVisible();
}

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`${scheme} appearance`, () => {
    test.use({ colorScheme: scheme });

    test('preserves form and list state across system appearance changes', async ({ page }) => {
      await page.goto('/');
      await addItem(page, 'Milk');
      await page.getByLabel('Item name').fill('Bread');
      const background = page.locator('ion-content').locator('#background-content');
      const before = await color(background, 'backgroundColor');

      await page.emulateMedia({ colorScheme: scheme === 'light' ? 'dark' : 'light' });
      await expect.poll(() => color(background, 'backgroundColor')).not.toBe(before);
      await expect(page.getByLabel('Item name')).toHaveValue('Bread');
      await expect(page.getByRole('checkbox', { name: 'Milk' })).toBeVisible();
      await expect(page.getByLabel('Language')).toHaveValue('en');
    });

    test('renders readable text, controls, focus and feedback', async ({ page }) => {
      await page.goto('/');
      const content = page.locator('ion-content').locator('#background-content');
      const toolbar = page.locator('ion-toolbar').locator('.toolbar-background');
      const nameInput = page.locator('ion-input').first();
      const inputOutline = nameInput.locator('.input-outline-start');
      const select = page.getByLabel('Unit', { exact: true });
      const language = page.getByLabel('Language');
      const addButton = page.getByRole('button', { name: 'Add item' });
      const buttonNative = page.locator('ion-button[type="submit"]').locator('button');

      await expect(inputOutline).toBeVisible();
      await assertContrast(page.getByText('Shopping list', { exact: true }), 'color', toolbar, 4.5);
      await assertContrast(nameInput.locator('.label-text'), 'color', content, 4.5);
      await assertContrast(page.locator('.unit-field label'), 'color', content, 4.5);
      await assertContrast(select, 'color', content, 4.5);
      await assertContrast(inputOutline, 'borderTopColor', content, 3);
      await assertContrast(select, 'borderTopColor', content, 3);
      await assertContrast(language, 'borderTopColor', toolbar, 3);
      await assertContrast(buttonNative, 'color', buttonNative, 4.5);

      await page.keyboard.press('Tab');
      await expect(language).toBeFocused();
      await expect(language).toHaveCSS('outline-style', 'solid');
      await assertContrast(language, 'outlineColor', toolbar, 3);
      await page.keyboard.press('Tab');
      await expect(page.getByLabel('Item name')).toBeFocused();
      await expect(nameInput).toHaveCSS('outline-style', 'solid');
      await assertContrast(nameInput, 'outlineColor', content, 3);

      await select.focus();
      await page.keyboard.press('Tab');
      await expect(addButton).toBeFocused();
      await expect(buttonNative).toHaveCSS('outline-style', 'solid');
      await assertContrast(buttonNative, 'outlineColor', content, 3);

      await addButton.click();
      const validation = page.getByText('Enter an item name.');
      await expect(validation).toBeVisible();
      await assertContrast(validation, 'color', content, 4.5);

      await addItem(page, 'Milk');
      const success = page.locator('.feedback-toast-success');
      await expect(success).toBeVisible();
      await assertContrast(success, 'color', success, 4.5);
      const checkbox = page.getByRole('checkbox', { name: 'Milk' });
      const itemBackground = page.locator('ion-item').first().locator('.item-native');
      const checkboxIcon = checkbox.locator('.checkbox-icon');
      await assertContrast(checkbox, 'color', itemBackground, 4.5);
      await assertContrast(checkboxIcon, 'borderTopColor', itemBackground, 3);
      const removeButton = page.getByRole('button', { name: 'Remove Milk' });
      await assertContrast(removeButton, 'color', itemBackground, 3);
      await checkbox.focus();
      await expect(checkbox).toHaveCSS('outline-style', 'solid');
      await assertContrast(checkbox, 'outlineColor', itemBackground, 3);
      await checkbox.click();
      await expect(checkbox).toHaveAttribute('aria-checked', 'true');
      const primaryBackground = await color(buttonNative, 'backgroundColor');
      await expect.poll(() => color(checkboxIcon, 'backgroundColor')).toBe(primaryBackground);
      await assertContrast(checkboxIcon.locator('path'), 'stroke', checkboxIcon, 3);
      await page.getByRole('button', { name: 'Clear completed' }).click();

      const dialog = page.getByRole('alertdialog', { name: 'Clear completed items?' });
      const dialogBackground = page.locator('ion-alert .alert-wrapper');
      await expect(dialogBackground).toBeVisible();
      await assertContrast(page.locator('ion-alert .alert-title'), 'color', dialogBackground, 4.5);
      await assertContrast(
        page.locator('ion-alert .alert-message'),
        'color',
        dialogBackground,
        4.5,
      );
      await assertContrast(
        dialog.getByRole('button', { name: 'Cancel' }),
        'color',
        dialogBackground,
        4.5,
      );
      await dialog.getByRole('button', { name: 'Cancel' }).focus();
      await page.keyboard.press('Tab');
      await page.keyboard.press('Shift+Tab');
      await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused();
      await expect(dialog.getByRole('button', { name: 'Cancel' })).toHaveCSS(
        'outline-style',
        'solid',
      );
      await assertContrast(
        dialog.getByRole('button', { name: 'Cancel' }),
        'outlineColor',
        dialogBackground,
        3,
      );
      await dialog.getByRole('button', { name: 'Cancel' }).click();
    });

    test('keeps storage error feedback readable', async ({ page }) => {
      await page.goto('/');
      await expect(page.getByLabel('Item name')).toBeVisible();
      await page.evaluate(() => {
        IDBObjectStore.prototype.put = function () {
          throw new DOMException('Storage unavailable', 'QuotaExceededError');
        };
      });
      await page.getByLabel('Item name').fill('Milk');
      await page.getByRole('button', { name: 'Add item' }).click();
      const error = page.locator('.feedback-toast-error');
      await expect(error).toBeVisible();
      await expect(error).toContainText('Could not save');
      await assertContrast(error, 'color', error, 4.5);
    });
  });
}
