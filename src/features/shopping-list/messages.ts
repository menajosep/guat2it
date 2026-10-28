import { MAX_ITEM_NAME_LENGTH, type ItemNameError } from './domain/shopping-item';

export const ITEM_NAME_MESSAGES: Record<ItemNameError, string> = {
  empty: 'Enter an item name.',
  'too-long': `Item names can have at most ${String(MAX_ITEM_NAME_LENGTH)} characters.`,
};

export const FALLBACK_ERROR_MESSAGE = 'Something went wrong. Please try again.';

const completedItemsLabel = (count: number) =>
  `${String(count)} completed ${count === 1 ? 'item' : 'items'}`;

export const feedbackMessages = {
  added: (name: string) => `Added ${name}`,
  completed: (name: string) => `Marked ${name} as completed`,
  reactivated: (name: string) => `Marked ${name} as active`,
  removed: (name: string) => `Removed ${name}`,
  renamed: (previousName: string, name: string) => `Renamed ${previousName} to ${name}`,
  cleared: (count: number) => `Cleared ${completedItemsLabel(count)}`,
};

export const clearCompletedDialog = {
  title: 'Clear completed items?',
  message: (count: number) => `This removes ${completedItemsLabel(count)} from the list.`,
};
