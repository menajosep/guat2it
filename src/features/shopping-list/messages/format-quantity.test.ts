import { formatQuantity } from './format-quantity';
import { SHOPPING_LIST_MESSAGES } from './index';

const en = SHOPPING_LIST_MESSAGES.en.units;
const es = SHOPPING_LIST_MESSAGES.es.units;
const ca = SHOPPING_LIST_MESSAGES.ca.units;

describe('formatQuantity', () => {
  it('uses the singular for 1 and the plural otherwise', () => {
    expect(formatQuantity({ amount: 1, unit: 'cup' }, en)).toBe('1 cup');
    expect(formatQuantity({ amount: 2, unit: 'cup' }, en)).toBe('2 cups');
    expect(formatQuantity({ amount: 0.5, unit: 'teaspoon' }, en)).toBe('0.5 teaspoons');
    expect(formatQuantity({ amount: 500, unit: 'gram' }, en)).toBe('500 grams');
    expect(formatQuantity({ amount: 2, unit: 'leaf' }, en)).toBe('2 leaves');
  });

  it('shows units without an amount as their label', () => {
    expect(formatQuantity({ unit: 'to-taste' }, en)).toBe('to taste');
  });

  it('returns undefined when there is no unit', () => {
    expect(formatQuantity({}, en)).toBeUndefined();
  });

  it('shows the unit in the language of the given labels', () => {
    expect(formatQuantity({ amount: 2, unit: 'tablespoon' }, es)).toBe('2 cucharadas');
    expect(formatQuantity({ amount: 2, unit: 'tablespoon' }, ca)).toBe('2 cullerades');
    expect(formatQuantity({ amount: 1, unit: 'tablespoon' }, ca)).toBe('1 cullerada');
    expect(formatQuantity({ unit: 'to-taste' }, es)).toBe('al gusto');
  });
});
