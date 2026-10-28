import {
  createShoppingItem,
  MAX_ITEM_NAME_LENGTH,
  parseItemName,
  sortByCreation,
  withCompleted,
  withDetails,
  type ShoppingItem,
} from './shopping-item';

const created = new Date('2026-01-01T10:00:00Z');

function item(id: string, createdAt: Date): ShoppingItem {
  return { id, name: id, completed: false, createdAt };
}

describe('parseItemName', () => {
  it('trims surrounding whitespace', () => {
    expect(parseItemName('  Milk \n')).toEqual({ ok: true, value: 'Milk' });
  });

  it.each(['', '   ', '\t\n'])('rejects blank name %j', (raw) => {
    expect(parseItemName(raw)).toEqual({ ok: false, error: 'empty' });
  });

  it('accepts a name at the length limit and rejects one beyond it', () => {
    expect(parseItemName('a'.repeat(MAX_ITEM_NAME_LENGTH)).ok).toBe(true);
    expect(parseItemName('a'.repeat(MAX_ITEM_NAME_LENGTH + 1))).toEqual({
      ok: false,
      error: 'too-long',
    });
  });
});

describe('createShoppingItem', () => {
  it('creates an active item with the given id and timestamp', () => {
    expect(createShoppingItem(' Eggs ', 'id-1', created)).toEqual({
      ok: true,
      value: { id: 'id-1', name: 'Eggs', completed: false, createdAt: created },
    });
  });

  it('propagates validation errors', () => {
    expect(createShoppingItem(' ', 'id-1', created)).toEqual({
      ok: false,
      error: { name: 'empty' },
    });
  });

  it('stores a validated amount and unit', () => {
    expect(
      createShoppingItem('Flour', 'id-1', created, { amount: '0,5', unit: 'kilogram' }),
    ).toEqual({
      ok: true,
      value: {
        id: 'id-1',
        name: 'Flour',
        completed: false,
        createdAt: created,
        amount: 0.5,
        unit: 'kilogram',
      },
    });
  });

  it('stores a unit that takes no amount without an amount', () => {
    expect(createShoppingItem('Salt', 'id-1', created, { amount: '', unit: 'to-taste' })).toEqual({
      ok: true,
      value: { id: 'id-1', name: 'Salt', completed: false, createdAt: created, unit: 'to-taste' },
    });
  });

  it('reports name and quantity errors together', () => {
    expect(createShoppingItem(' ', 'id-1', created, { amount: '2', unit: undefined })).toEqual({
      ok: false,
      error: { name: 'empty', quantity: 'unit-required' },
    });
  });
});

describe('withCompleted', () => {
  it('returns a changed copy without mutating the original', () => {
    const original = item('a', created);
    const completed = withCompleted(original, true);
    expect(completed.completed).toBe(true);
    expect(original.completed).toBe(false);
    expect(withCompleted(completed, false).completed).toBe(false);
  });
});

const NO_QUANTITY = { amount: '', unit: undefined } as const;

describe('withDetails', () => {
  it('replaces the trimmed name and keeps every other field', () => {
    const original: ShoppingItem = { ...item('a', created), completed: true };
    expect(withDetails(original, ' Oat milk ', NO_QUANTITY)).toEqual({
      ok: true,
      value: { id: 'a', name: 'Oat milk', completed: true, createdAt: created },
    });
    expect(original.name).toBe('a');
  });

  it('rejects blank and too long names', () => {
    const original = item('a', created);
    expect(withDetails(original, '  ', NO_QUANTITY)).toEqual({
      ok: false,
      error: { name: 'empty' },
    });
    expect(withDetails(original, 'a'.repeat(MAX_ITEM_NAME_LENGTH + 1), NO_QUANTITY)).toEqual({
      ok: false,
      error: { name: 'too-long' },
    });
  });

  it('sets, changes and clears the quantity', () => {
    const original = item('a', created);
    const withQuantity = withDetails(original, 'a', { amount: '2', unit: 'cup' });
    expect(withQuantity).toMatchObject({ ok: true, value: { amount: 2, unit: 'cup' } });
    if (!withQuantity.ok) throw new Error('expected a valid item');

    const cleared = withDetails(withQuantity.value, 'a', NO_QUANTITY);
    expect(cleared).toEqual({ ok: true, value: original });
    expect(cleared.ok && 'amount' in cleared.value).toBe(false);
  });

  it('rejects an invalid quantity', () => {
    expect(withDetails(item('a', created), 'a', { amount: '2', unit: undefined })).toEqual({
      ok: false,
      error: { quantity: 'unit-required' },
    });
  });
});

describe('sortByCreation', () => {
  it('orders items from oldest to newest without mutating the input', () => {
    const newest = item('newest', new Date('2026-01-03T00:00:00Z'));
    const oldest = item('oldest', new Date('2026-01-01T00:00:00Z'));
    const input = [newest, oldest];
    expect(sortByCreation(input).map((i) => i.id)).toEqual(['oldest', 'newest']);
    expect(input[0]).toBe(newest);
  });
});
