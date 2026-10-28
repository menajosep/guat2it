import { ITEM_NAME_MESSAGES, feedbackMessages } from './messages';

describe('messages', () => {
  it('words the success feedback with the item names', () => {
    expect(feedbackMessages.added('Milk')).toBe('Added Milk');
    expect(feedbackMessages.completed('Milk')).toBe('Marked Milk as completed');
    expect(feedbackMessages.reactivated('Milk')).toBe('Marked Milk as active');
    expect(feedbackMessages.removed('Milk')).toBe('Removed Milk');
    expect(feedbackMessages.renamed('Milk', 'Oat milk')).toBe('Renamed Milk to Oat milk');
  });

  it('explains each name validation error', () => {
    expect(ITEM_NAME_MESSAGES.empty).toBe('Enter an item name.');
    expect(ITEM_NAME_MESSAGES['too-long']).toBe('Item names can have at most 100 characters.');
  });
});
