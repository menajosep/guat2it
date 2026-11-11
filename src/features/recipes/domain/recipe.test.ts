import { validateIngredient, validateRecipe, type RecipeDraft } from './recipe';

const draft: RecipeDraft = {
  sourceUrl: 'https://www.directoalpaladar.com/example',
  title: '  Soup  ',
  yield: '4',
  ingredients: [
    {
      source: '200 g lentejas',
      name: ' lentejas ',
      quantity: { amount: '200', unit: 'gram' },
      confirmed: true,
    },
  ],
  instructions: ' Cook. ',
  imageUrl: 'https://example.com/image.jpg',
};

describe('recipe validation', () => {
  it('creates a recipe with shopping-compatible ingredient values', () => {
    expect(validateRecipe(draft, 'recipe-1')).toEqual({
      ok: true,
      value: {
        id: 'recipe-1',
        sourceUrl: draft.sourceUrl,
        title: 'Soup',
        yield: 4,
        ingredients: [{ name: 'lentejas', amount: 200, unit: 'gram' }],
        instructions: 'Cook.',
        imageUrl: draft.imageUrl,
      },
    });
  });

  it.each(['', '0', '-1', 'Infinity', '1e3', '1.2.3'])('rejects yield %j', (value) => {
    expect(validateRecipe({ ...draft, yield: value }, 'id')).toMatchObject({
      ok: false,
      error: { yield: 'invalid' },
    });
  });

  it('accepts a decimal yield with a comma', () => {
    expect(validateRecipe({ ...draft, yield: '1,5' }, 'id')).toMatchObject({
      ok: true,
      value: { yield: 1.5 },
    });
  });

  it('reports all invalid required fields', () => {
    expect(
      validateRecipe(
        {
          ...draft,
          title: ' ',
          ingredients: [],
          instructions: ' ',
          imageUrl: 'http://example.com',
        },
        'id',
      ),
    ).toEqual({
      ok: false,
      error: {
        title: 'required',
        ingredients: 'required',
        instructions: 'required',
        imageUrl: 'invalid',
      },
    });
  });

  it('does not save unresolved or invalid ingredients', () => {
    const invalid = {
      source: 'a pinch',
      name: ' ',
      quantity: { amount: '2', unit: undefined },
      confirmed: false,
    };
    expect(validateIngredient(invalid)).toEqual({
      ok: false,
      error: { name: 'empty', quantity: 'unit-required', unconfirmed: true },
    });
    expect(validateRecipe({ ...draft, ingredients: [invalid] }, 'id')).toMatchObject({
      ok: false,
      error: { ingredientErrors: [{ unconfirmed: true }] },
    });
  });
});
