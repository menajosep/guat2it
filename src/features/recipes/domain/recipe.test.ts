import {
  recipeToDraft,
  isRecipeCategory,
  RECIPE_CATEGORIES,
  validateIngredient,
  validateRecipe,
  type Recipe,
  type RecipeDraft,
} from './recipe';

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
  it('converts saved recipes to editable drafts without source-line assumptions', () => {
    const saved: Recipe = {
      id: 'recipe-1',
      sourceUrl: draft.sourceUrl,
      title: 'Soup',
      yield: 4,
      ingredients: [{ name: 'lentils', amount: 200, unit: 'gram' }, { name: 'salt' }],
      instructions: 'Cook.',
      imageUrl: draft.imageUrl,
    };

    expect(recipeToDraft(saved)).toEqual({
      sourceUrl: draft.sourceUrl,
      title: 'Soup',
      yield: '4',
      ingredients: [
        {
          source: '',
          name: 'lentils',
          quantity: { amount: '200', unit: 'gram' },
          confirmed: true,
        },
        {
          source: '',
          name: 'salt',
          quantity: { amount: '', unit: undefined },
          confirmed: true,
        },
      ],
      instructions: 'Cook.',
      imageUrl: draft.imageUrl,
    });
  });

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

  it('accepts each supported category and retains it when editing', () => {
    for (const category of RECIPE_CATEGORIES) {
      const categorized = validateRecipe({ ...draft, category }, 'recipe-1');
      expect(categorized).toMatchObject({ ok: true, value: { category } });
      if (categorized.ok) expect(recipeToDraft(categorized.value).category).toBe(category);
    }
  });

  it('treats an omitted or legacy category as uncategorized', () => {
    const uncategorized = validateRecipe(draft, 'recipe-1');
    expect(uncategorized.ok).toBe(true);
    if (uncategorized.ok) expect('category' in uncategorized.value).toBe(false);
    expect(isRecipeCategory(undefined)).toBe(false);
    expect(isRecipeCategory('custom-category')).toBe(false);
  });

  it('rejects invalid category identifiers at validation time', () => {
    const invalidDraft = { ...draft };
    Object.defineProperty(invalidDraft, 'category', { value: 'custom-category' });
    expect(validateRecipe(invalidDraft, 'recipe-1')).toMatchObject({
      ok: false,
      error: { category: 'invalid' },
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
