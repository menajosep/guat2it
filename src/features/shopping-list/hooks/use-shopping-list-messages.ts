import { useLanguage } from '../../language/hooks/language-context';
import { SHOPPING_LIST_MESSAGES, type ShoppingListMessages } from '../messages';

/** The shopping list texts in the language the user selected. */
export function useShoppingListMessages(): ShoppingListMessages {
  return SHOPPING_LIST_MESSAGES[useLanguage().language];
}
