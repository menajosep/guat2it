import { MAX_ITEM_NAME_LENGTH, type ItemNameError } from './domain/shopping-item';

export const ITEM_NAME_MESSAGES: Record<ItemNameError, string> = {
  empty: 'Enter an item name.',
  'too-long': `Item names can have at most ${String(MAX_ITEM_NAME_LENGTH)} characters.`,
};

export const FALLBACK_ERROR_MESSAGE = 'Something went wrong. Please try again.';

export const feedbackMessages = {
  added: (name: string) => `Added ${name}`,
  completed: (name: string) => `Marked ${name} as completed`,
  reactivated: (name: string) => `Marked ${name} as active`,
  removed: (name: string) => `Removed ${name}`,
  renamed: (previousName: string, name: string) => `Renamed ${previousName} to ${name}`,
};
