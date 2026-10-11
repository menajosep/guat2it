import {
  createShoppingItem,
  MAX_ITEM_NAME_LENGTH,
  parseItemName,
  sortByCreation,
  withCompleted,
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
    expect(createShoppingItem(' ', 'id-1', created)).toEqual({ ok: false, error: 'empty' });
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

describe('sortByCreation', () => {
  it('orders items from oldest to newest without mutating the input', () => {
    const newest = item('newest', new Date('2026-01-03T00:00:00Z'));
    const oldest = item('oldest', new Date('2026-01-01T00:00:00Z'));
    const input = [newest, oldest];
    expect(sortByCreation(input).map((i) => i.id)).toEqual(['oldest', 'newest']);
    expect(input[0]).toBe(newest);
  });
});
