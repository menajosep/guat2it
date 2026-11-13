import type { Recipe, RecipeIngredient } from '../../recipes/domain/recipe';
import type { ShoppingItem } from '../../shopping-list/domain/shopping-item';
import {
  groupTransfer,
  formatExactAmount,
  resolveTransferQuantity,
  transferItem,
  transferUnits,
  type TransferGroup,
  type TransferSnapshot,
} from './menu-transfer';

const date = new Date('2026-01-01T00:00:00Z');

function recipe(ingredients: RecipeIngredient[], yieldValue = 4): Recipe {
  return {
    id: 'recipe',
    title: 'Soup',
    sourceUrl: 'https://example.com/recipe',
    yield: yieldValue,
    ingredients,
    instructions: 'Cook.',
    imageUrl: 'https://example.com/image.jpg',
  };
}

function snapshot(
  ingredients: RecipeIngredient[],
  items: ShoppingItem[] = [],
  servings: number | null = 4,
  yieldValue = 4,
): TransferSnapshot {
  const saved = recipe(ingredients, yieldValue);
  return {
    menu: { id: 'menu', name: 'Family', startDate: '2026-11-18', servings },
    assignments: [
      {
        assignment: { menuId: 'menu', recipeId: 'recipe', dayOffset: 0, meal: 'lunch' },
        recipe: saved,
      },
    ],
    items,
    categories: [],
  };
}

function firstGroup(input: TransferSnapshot): TransferGroup {
  const group = groupTransfer(input)[0];
  if (!group) throw new Error('Expected a group');
  return group;
}

function item(id: string, name: string, quantity: Partial<ShoppingItem> = {}): ShoppingItem {
  return { id, name, createdAt: date, completed: false, ...quantity };
}

it('counts each assignment and groups matching active records without duplicating categories', () => {
  const input = snapshot(
    [{ name: 'tomato', amount: 2, unit: 'unit' }],
    [
      item('z', ' TOMATO ', { amount: 1, unit: 'unit', categoryIds: ['a', 'b'] }),
      item('a', 'Tomato', { amount: 3, unit: 'unit', categoryIds: ['b', 'c'] }),
      item('done', 'tomato', { completed: true, amount: 50, unit: 'unit' }),
      item('different', 'tomatoes', { amount: 10, unit: 'unit' }),
    ],
  );
  const original = input.assignments[0];
  if (!original) throw new Error('Expected assignment');
  const group = firstGroup({
    ...input,
    assignments: [original, { ...original, assignment: { ...original.assignment, dayOffset: 1 } }],
  });
  expect(group.items.map((entry) => entry.id)).toEqual(['a', 'z']);
  const quantity = resolveTransferQuantity(group, {});
  expect(quantity).toEqual({ ok: true, value: { amount: 8, unit: 'unit' } });
  if (!quantity.ok) throw new Error('Expected quantity');
  expect(transferItem(group, quantity.value, 'new', new Date())).toEqual({
    id: 'a',
    name: 'Tomato',
    completed: false,
    createdAt: date,
    amount: 8,
    unit: 'unit',
    categoryIds: ['b', 'c', 'a'],
  });
});

it('uses the first ingredient in deterministic day and meal order for new groups', () => {
  const input = snapshot([{ name: 'Salt', amount: 1, unit: 'gram' }]);
  const original = input.assignments[0];
  if (!original) throw new Error('Expected assignment');
  const earlier = {
    ...original,
    assignment: { ...original.assignment, meal: 'dinner' as const },
    recipe: recipe([{ name: 'SALT', amount: 2, unit: 'gram' }]),
  };
  const group = firstGroup({ ...input, assignments: [earlier, original] });
  expect(group.name).toBe('Salt');
  expect(transferItem(group, { amount: 3, unit: 'gram' }, 'new', date)).toEqual({
    id: 'new',
    name: 'Salt',
    completed: false,
    createdAt: date,
    amount: 3,
    unit: 'gram',
  });
});

it('does not merge plural names or internal whitespace', () => {
  const groups = groupTransfer(
    snapshot([
      { name: 'tomato' },
      { name: 'tomatoes' },
      { name: 'green  beans' },
      { name: 'green beans' },
    ]),
  );
  expect(groups.map((group) => group.key)).toEqual([
    'tomato',
    'tomatoes',
    'green  beans',
    'green beans',
  ]);
});

it('calculates decimal totals exactly and asks for a mixed-unit target', () => {
  const group = firstGroup(
    snapshot([
      { name: 'Flour', amount: 1.25, unit: 'kilogram' },
      { name: 'flour', amount: 250, unit: 'gram' },
    ]),
  );
  expect(transferUnits(group)).toEqual(['kilogram', 'gram']);
  expect(resolveTransferQuantity(group, {})).toEqual({ ok: false, error: 'choose-unit' });
  expect(resolveTransferQuantity(group, { target: 'gram' })).toEqual({
    ok: true,
    value: { amount: 1500, unit: 'gram' },
  });
  expect(resolveTransferQuantity(group, { target: 'kilogram' })).toEqual({
    ok: true,
    value: { amount: 1.5, unit: 'kilogram' },
  });
});

it('converts only compatible units and requires manual input for imprecise totals', () => {
  const group = firstGroup(
    snapshot([
      { name: 'Flour', amount: 1, unit: 'pound' },
      { name: 'Flour', amount: 1, unit: 'gram' },
    ]),
  );
  expect(resolveTransferQuantity(group, { target: 'gram' })).toEqual({
    ok: false,
    error: 'manual-required',
  });
  expect(resolveTransferQuantity(group, { target: 'liter' })).toEqual({
    ok: false,
    error: 'manual-required',
  });
  expect(
    resolveTransferQuantity(group, { target: 'gram', manual: { amount: '455', unit: 'gram' } }),
  ).toEqual({ ok: true, value: { amount: 455, unit: 'gram' } });
  expect(
    resolveTransferQuantity(group, { target: 'gram', manual: { amount: '455', unit: 'kilogram' } }),
  ).toEqual({ ok: false, error: 'unit-mismatch' });
});

it('sums decimal quantities and converts metric volume exactly', () => {
  const same = firstGroup(
    snapshot([
      { name: 'Milk', amount: 0.1, unit: 'liter' },
      { name: 'Milk', amount: 0.2, unit: 'liter' },
    ]),
  );
  expect(resolveTransferQuantity(same, {})).toEqual({
    ok: true,
    value: { amount: 0.3, unit: 'liter' },
  });
  const mixed = firstGroup(
    snapshot([
      { name: 'Milk', amount: 1, unit: 'liter' },
      { name: 'Milk', amount: 250, unit: 'milliliter' },
    ]),
  );
  expect(resolveTransferQuantity(mixed, { target: 'milliliter' })).toEqual({
    ok: true,
    value: { amount: 1250, unit: 'milliliter' },
  });
});

it('scales repeated assignments exactly and defers only unrepresentable totals', () => {
  const input = snapshot([{ name: 'Tomato', amount: 1, unit: 'unit' }], [], 1, 3);
  const original = input.assignments[0];
  if (!original) throw new Error('Expected assignment');
  const group = firstGroup({
    ...input,
    assignments: [
      original,
      { ...original, assignment: { ...original.assignment, dayOffset: 1 } },
      { ...original, assignment: { ...original.assignment, dayOffset: 2 } },
    ],
  });
  expect(
    group.contributions.map(({ scaledAmount }) =>
      scaledAmount ? formatExactAmount(scaledAmount) : undefined,
    ),
  ).toEqual(['1/3', '1/3', '1/3']);
  expect(resolveTransferQuantity(group, {})).toEqual({
    ok: true,
    value: { amount: 1, unit: 'unit' },
  });

  const unrepresentable = firstGroup(
    snapshot([{ name: 'Tomato', amount: 1, unit: 'unit' }], [], 1, 3),
  );
  const contribution = unrepresentable.contributions[0];
  if (!contribution?.scaledAmount) throw new Error('Expected scaled contribution');
  expect(formatExactAmount(contribution.scaledAmount)).toBe('1/3');
  expect(resolveTransferQuantity(unrepresentable, {})).toEqual({
    ok: false,
    error: 'manual-required',
  });
});

it('scales decimal yields and leaves shopping-list contributions unchanged', () => {
  const fractionalYield = firstGroup(
    snapshot([{ name: 'Flour', amount: 3, unit: 'kilogram' }], [], 1, 1.5),
  );
  expect(resolveTransferQuantity(fractionalYield, {})).toEqual({
    ok: true,
    value: { amount: 2, unit: 'kilogram' },
  });

  const existing = firstGroup(
    snapshot(
      [{ name: 'Tomato', amount: 4, unit: 'unit' }],
      [item('saved', 'Tomato', { amount: 3, unit: 'unit' })],
      2,
      4,
    ),
  );
  expect(resolveTransferQuantity(existing, {})).toEqual({
    ok: true,
    value: { amount: 5, unit: 'unit' },
  });
});

it('scales each assigned recipe by its own yield', () => {
  const input = snapshot([{ name: 'Flour', amount: 100, unit: 'gram' }], [], 4, 2);
  const original = input.assignments[0];
  if (!original) throw new Error('Expected assignment');
  const second = {
    ...original,
    assignment: { ...original.assignment, recipeId: 'other', dayOffset: 1 },
    recipe: { ...recipe([{ name: 'Flour', amount: 400, unit: 'gram' }], 8), id: 'other' },
  };
  const group = firstGroup({ ...input, assignments: [original, second] });
  expect(
    group.contributions.map(({ scaledAmount }) =>
      scaledAmount ? formatExactAmount(scaledAmount) : undefined,
    ),
  ).toEqual(['200', '200']);
  expect(resolveTransferQuantity(group, {})).toEqual({
    ok: true,
    value: { amount: 400, unit: 'gram' },
  });
});

it('parses exponential decimal notation and scales it without rounding', () => {
  const group = firstGroup(
    snapshot([{ name: 'Ingredient', amount: 1e-7, unit: 'gram' }], [], 1, 1e-7),
  );
  expect(resolveTransferQuantity(group, {})).toEqual({
    ok: true,
    value: { amount: 1, unit: 'gram' },
  });
});

it('requires explicit handling for invalid yields, missing servings and sub-cent results', () => {
  const invalidYield = firstGroup(snapshot([{ name: 'Salt', amount: 1, unit: 'gram' }], [], 1, 0));
  expect(resolveTransferQuantity(invalidYield, {})).toEqual({
    ok: false,
    error: 'invalid-yield',
  });
  const legacy = firstGroup(snapshot([{ name: 'Salt', amount: 1, unit: 'gram' }], [], null, 4));
  expect(resolveTransferQuantity(legacy, {})).toEqual({
    ok: false,
    error: 'servings-required',
  });
  const tooPrecise = firstGroup(snapshot([{ name: 'Salt', amount: 1, unit: 'gram' }], [], 1, 400));
  const contribution = tooPrecise.contributions[0];
  if (!contribution?.scaledAmount) throw new Error('Expected scaled contribution');
  expect(formatExactAmount(contribution.scaledAmount)).toBe('0.0025');
  expect(resolveTransferQuantity(tooPrecise, {})).toEqual({
    ok: false,
    error: 'manual-required',
  });
});

it.each([
  [{ name: 'Salt' }, { name: 'Salt', amount: 2, unit: 'gram' }],
  [{ name: 'Salt', unit: 'to-taste' }],
  [
    { name: 'Salt', amount: 9999, unit: 'gram' },
    { name: 'Salt', amount: 1, unit: 'gram' },
  ],
  [
    { name: 'Salt', amount: 1, unit: 'gram' },
    { name: 'Salt', amount: 1, unit: 'unit' },
  ],
] satisfies RecipeIngredient[][])(
  'requires an explicit quantity for unresolved contributions',
  (...ingredients) => {
    const group = firstGroup(snapshot(ingredients));
    const units = transferUnits(group);
    const target = units[0];
    expect(resolveTransferQuantity(group, target ? { target } : {})).toEqual({
      ok: false,
      error: 'manual-required',
    });
  },
);

it('retains existing quantity validation for manual resolutions', () => {
  const group = firstGroup(snapshot([{ name: 'Salt', amount: 1, unit: 'gram' }, { name: 'Salt' }]));
  expect(resolveTransferQuantity(group, { manual: { unit: 'gram', amount: '0' } })).toEqual({
    ok: false,
    error: 'invalid-amount',
  });
  expect(resolveTransferQuantity(group, { manual: { unit: 'gram', amount: '10000' } })).toEqual({
    ok: false,
    error: 'amount-too-large',
  });
});
