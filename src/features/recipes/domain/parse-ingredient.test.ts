import { parseIngredient } from './parse-ingredient';
import { validateIngredient } from './recipe';

describe('parseIngredient', () => {
  it.each([
    ['200 g lentejas', 'lentejas', '200', 'gram'],
    ['lentejas 200 g', 'lentejas', '200', 'gram'],
    ['2 dientes de ajo', 'ajo', '2', 'clove'],
    ['0,5 kg de harina', 'harina', '0,5', 'kilogram'],
  ])('recognizes %s', (source, name, amount, unit) => {
    expect(parseIngredient(source)).toMatchObject({
      source,
      name,
      quantity: { amount, unit },
      confirmed: true,
    });
  });

  it.each(['sal al gusto', '2 tomates', '1/3 taza de harina', '200 puñados de arroz'])(
    'retains unresolved text without guessing: %s',
    (source) => {
      const draft = parseIngredient(source);
      expect(draft).toEqual({
        source,
        name: source,
        quantity: { amount: '', unit: undefined },
        confirmed: false,
      });
      expect(validateIngredient(draft).ok).toBe(false);
    },
  );
});
