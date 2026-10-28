import {
  ITEM_NAME_MESSAGES,
  QUANTITY_MESSAGES,
  clearCompletedDialog,
  feedbackMessages,
} from './messages';

describe('messages', () => {
  it('words the clear-completed messages for one and several items', () => {
    expect(feedbackMessages.cleared(1)).toBe('Cleared 1 completed item');
    expect(feedbackMessages.cleared(3)).toBe('Cleared 3 completed items');
    expect(clearCompletedDialog.message(1)).toBe('This removes 1 completed item from the list.');
    expect(clearCompletedDialog.message(2)).toBe('This removes 2 completed items from the list.');
  });

  it('words the success feedback with the item names', () => {
    expect(feedbackMessages.added('Milk')).toBe('Added Milk');
    expect(feedbackMessages.completed('Milk')).toBe('Marked Milk as completed');
    expect(feedbackMessages.reactivated('Milk')).toBe('Marked Milk as active');
    expect(feedbackMessages.removed('Milk')).toBe('Removed Milk');
    expect(feedbackMessages.updated('Flour')).toBe('Updated Flour');
    expect(feedbackMessages.renamed('Milk', 'Oat milk')).toBe('Renamed Milk to Oat milk');
  });

  it('explains each name validation error', () => {
    expect(ITEM_NAME_MESSAGES.empty).toBe('Enter an item name.');
    expect(ITEM_NAME_MESSAGES['too-long']).toBe('Item names can have at most 100 characters.');
  });

  it('explains each quantity validation error', () => {
    expect(QUANTITY_MESSAGES['unit-required']).toBe('Choose a unit for the amount.');
    expect(QUANTITY_MESSAGES['amount-required']).toBe('Enter an amount for this unit.');
    expect(QUANTITY_MESSAGES['amount-not-allowed']).toBe('This unit takes no amount.');
    expect(QUANTITY_MESSAGES['invalid-amount']).toBe(QUANTITY_MESSAGES['amount-too-large']);
    expect(QUANTITY_MESSAGES['invalid-amount']).toContain('9999.99');
  });
});
