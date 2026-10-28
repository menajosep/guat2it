import { MAX_AMOUNT, type QuantityError } from './domain/quantity';
import { MAX_ITEM_NAME_LENGTH, type ItemNameError } from './domain/shopping-item';

export const ITEM_NAME_MESSAGES: Record<ItemNameError, string> = {
  empty: 'Enter an item name.',
  'too-long': `Item names can have at most ${String(MAX_ITEM_NAME_LENGTH)} characters.`,
};

const AMOUNT_MESSAGE = `Enter a positive amount up to ${String(MAX_AMOUNT)} with at most two decimals.`;

export const QUANTITY_MESSAGES: Record<QuantityError, string> = {
  'invalid-amount': AMOUNT_MESSAGE,
  'amount-too-large': AMOUNT_MESSAGE,
  'unit-required': 'Choose a unit for the amount.',
  'amount-required': 'Enter an amount for this unit.',
  'amount-not-allowed': 'This unit takes no amount.',
};

export const FALLBACK_ERROR_MESSAGE = 'Something went wrong. Please try again.';

const completedItemsLabel = (count: number) =>
  `${String(count)} completed ${count === 1 ? 'item' : 'items'}`;

export const feedbackMessages = {
  added: (name: string) => `Added ${name}`,
  completed: (name: string) => `Marked ${name} as completed`,
  reactivated: (name: string) => `Marked ${name} as active`,
  removed: (name: string) => `Removed ${name}`,
  updated: (name: string) => `Updated ${name}`,
  renamed: (previousName: string, name: string) => `Renamed ${previousName} to ${name}`,
  cleared: (count: number) => `Cleared ${completedItemsLabel(count)}`,
};

export const clearCompletedDialog = {
  title: 'Clear completed items?',
  message: (count: number) => `This removes ${completedItemsLabel(count)} from the list.`,
};
