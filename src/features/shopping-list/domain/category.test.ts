import { categoryNameKey, distinctCategoryIds, parseCategoryName } from './category';
import { createShoppingItem, withDetails } from './shopping-item';

describe('categories', () => {
  it('trims and validates names', () => {
    expect(parseCategoryName(' Butchery ')).toEqual({ ok: true, value: 'Butchery' });
    expect(parseCategoryName('  ')).toEqual({ ok: false, error: 'empty' });
    expect(parseCategoryName('x'.repeat(101))).toEqual({ ok: false, error: 'too-long' });
    expect(categoryNameKey('Butchery')).toBe(categoryNameKey('BUTCHERY'));
  });

  it('deduplicates assignments and preserves them when editing other details', () => {
    expect(distinctCategoryIds(['a', 'b', 'a'])).toEqual(['a', 'b']);
    const item = createShoppingItem('Milk', 'id', new Date(0), undefined, ['a', 'a', 'b']);
    if (!item.ok) throw new Error('expected an item');
    const edited = withDetails(item.value, 'Oat milk', { amount: '', unit: undefined });
    expect(edited.ok && edited.value.categoryIds).toEqual(['a', 'b']);
  });
});
