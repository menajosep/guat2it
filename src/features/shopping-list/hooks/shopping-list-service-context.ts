import { createContext, useContext } from 'react';
import type { ShoppingListService } from '../application/shopping-list-service';

const ShoppingListServiceContext = createContext<ShoppingListService | null>(null);

export const ShoppingListServiceProvider = ShoppingListServiceContext.Provider;

export function useShoppingListService(): ShoppingListService {
  const service = useContext(ShoppingListServiceContext);
  if (!service) {
    throw new Error('useShoppingListService must be used inside a ShoppingListServiceProvider.');
  }
  return service;
}
