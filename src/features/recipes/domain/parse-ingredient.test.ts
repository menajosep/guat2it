import { parseIngredient } from './parse-ingredient';
import { validateIngredient } from './recipe';

describe('parseIngredient', () => {
  it.each([
    ['200 g lentejas', 'lentejas', '200', 'gram'],
    ['lentejas 200 g', 'lentejas', '200', 'gram'],
    ['2 dientes de ajo', 'ajo', '2', 'clove'],
    ['0,5 kg de harina', 'harina', '0,5', 'kilogram'],
    ['2count Pan de molde', 'Pan de molde', '2', 'whole'],
    ['1 count Huevos', 'Huevos', '1', 'whole'],
    ['Pan de molde 2count', 'Pan de molde', '2', 'whole'],
    ['Pan de molde 2 count', 'Pan de molde', '2', 'whole'],
  ])('recognizes %s', (source, name, amount, unit) => {
    expect(parseIngredient(source)).toMatchObject({
      source,
      name,
      quantity: { amount, unit },
      confirmed: true,
    });
  });

  it('preserves the original source line when parsing count quantities', () => {
    const source = '  2count Pan de molde  ';
    expect(parseIngredient(source)).toMatchObject({
      source,
      name: 'Pan de molde',
      quantity: { amount: '2', unit: 'whole' },
      confirmed: true,
    });
  });

  it.each([
    'sal al gusto',
    '2 tomates',
    '1/3 taza de harina',
    '200 puñados de arroz',
    '10000count Pan de molde',
    '0count Pan de molde',
    '2counter Pan de molde',
    '2count',
  ])('retains unresolved text without guessing: %s', (source) => {
    const draft = parseIngredient(source);
    expect(draft).toEqual({
      source,
      name: source,
      quantity: { amount: '', unit: undefined },
      confirmed: false,
    });
    expect(validateIngredient(draft).ok).toBe(false);
  });
});
