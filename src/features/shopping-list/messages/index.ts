import type { Language } from '../../language/domain/language';
import { ca } from './ca';
import { en } from './en';
import { es } from './es';
import type { ShoppingListMessages } from './types';

export const SHOPPING_LIST_MESSAGES: Record<Language, ShoppingListMessages> = { en, es, ca };

export type { ShoppingListMessages, UnitLabel } from './types';
