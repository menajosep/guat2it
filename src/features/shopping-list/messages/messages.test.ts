import { LANGUAGES } from '../../language/domain/language';
import { UNIT_IDS } from '../domain/units';
import { SHOPPING_LIST_MESSAGES } from './index';
import type { ShoppingListMessages } from './types';

const en = SHOPPING_LIST_MESSAGES.en;

/** Calls every message function with sample values so all texts can be compared. */
function collectTexts(value: unknown, path: string, out: Map<string, string>): void {
  if (typeof value === 'string') {
    out.set(path, value);
  } else if (typeof value === 'function') {
    const fn = value as (...args: unknown[]) => unknown;
    if (path === 'amount' || path === 'unit') {
      collectTexts(fn(), `${path}()`, out);
      collectTexts(fn('Milk'), `${path}('Milk')`, out);
    } else if (path.endsWith('.renamed')) {
      collectTexts(fn('Milk', 'Oat milk'), path, out);
    } else if (path.includes('.cleared') || path.endsWith('.message')) {
      collectTexts(fn(1), `${path}(1)`, out);
      collectTexts(fn(3), `${path}(3)`, out);
    } else {
      collectTexts(fn('Milk'), path, out);
    }
  } else if (typeof value === 'object' && value !== null) {
    for (const [key, child] of Object.entries(value)) {
      collectTexts(child, path === '' ? key : `${path}.${key}`, out);
    }
  }
}

function texts(messages: ShoppingListMessages): Map<string, string> {
  const out = new Map<string, string>();
  collectTexts(messages, '', out);
  return out;
}

describe('English messages', () => {
  it('words the clear-completed messages for one and several items', () => {
    expect(en.feedback.cleared(1)).toBe('Cleared 1 completed item');
    expect(en.feedback.cleared(3)).toBe('Cleared 3 completed items');
    expect(en.clearCompletedDialog.message(1)).toBe('This removes 1 completed item from the list.');
    expect(en.clearCompletedDialog.message(2)).toBe(
      'This removes 2 completed items from the list.',
    );
  });

  it('words the success feedback with the item names', () => {
    expect(en.feedback.added('Milk')).toBe('Added Milk');
    expect(en.feedback.completed('Milk')).toBe('Marked Milk as completed');
    expect(en.feedback.reactivated('Milk')).toBe('Marked Milk as active');
    expect(en.feedback.removed('Milk')).toBe('Removed Milk');
    expect(en.feedback.updated('Flour')).toBe('Updated Flour');
    expect(en.feedback.renamed('Milk', 'Oat milk')).toBe('Renamed Milk to Oat milk');
  });

  it('explains each name validation error', () => {
    expect(en.itemNameErrors.empty).toBe('Enter an item name.');
    expect(en.itemNameErrors['too-long']).toBe('Item names can have at most 100 characters.');
  });

  it('explains each quantity validation error', () => {
    expect(en.quantityErrors['unit-required']).toBe('Choose a unit for the amount.');
    expect(en.quantityErrors['amount-required']).toBe('Enter an amount for this unit.');
    expect(en.quantityErrors['amount-not-allowed']).toBe('This unit takes no amount.');
    expect(en.quantityErrors['invalid-amount']).toBe(en.quantityErrors['amount-too-large']);
    expect(en.quantityErrors['invalid-amount']).toContain('9999.99');
  });

  it('labels the fields with and without an item name', () => {
    expect(en.amount()).toBe('Amount');
    expect(en.amount('Flour')).toBe('Amount for Flour');
    expect(en.unit('Flour')).toBe('Unit for Flour');
  });
});

describe('Spanish and Catalan messages', () => {
  it('words the count-dependent messages for one and several items', () => {
    const { es, ca } = SHOPPING_LIST_MESSAGES;
    expect(es.feedback.cleared(1)).toBe('Se ha borrado 1 artículo completado');
    expect(es.feedback.cleared(3)).toBe('Se han borrado 3 artículos completados');
    expect(es.clearCompletedDialog.message(1)).toBe(
      'Se eliminará 1 artículo completado de la lista.',
    );
    expect(ca.feedback.cleared(1)).toBe("S'ha esborrat 1 article completat");
    expect(ca.feedback.cleared(3)).toBe("S'han esborrat 3 articles completats");
    expect(ca.clearCompletedDialog.message(2)).toBe(
      "S'eliminaran 2 articles completats de la llista.",
    );
  });
});

describe.each(LANGUAGES)('%s catalog', (language) => {
  const messages = SHOPPING_LIST_MESSAGES[language];

  it('has the same texts as English, none of them empty', () => {
    const actual = texts(messages);
    const expected = texts(en);
    expect([...actual.keys()]).toEqual([...expected.keys()]);
    for (const [key, value] of actual) {
      expect(value.trim(), key).not.toBe('');
    }
  });

  it('names every unit with a singular and a plural', () => {
    expect(Object.keys(messages.units)).toEqual(UNIT_IDS);
    for (const id of UNIT_IDS) {
      expect(messages.units[id].singular.length).toBeGreaterThan(0);
      expect(messages.units[id].plural.length).toBeGreaterThan(0);
    }
  });

  it('has unique singular unit names so the choices are distinguishable', () => {
    const labels = UNIT_IDS.map((id) => messages.units[id].singular);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it('keeps item names untouched inside messages', () => {
    expect(messages.feedback.added('Milk')).toContain('Milk');
    expect(messages.feedback.renamed('Milk', 'Oat milk')).toContain('Oat milk');
  });
});
