import { createContext, useContext } from 'react';
import type { RecipeService } from '../application/recipe-service';

const RecipeServiceContext = createContext<RecipeService | null>(null);

export const RecipeServiceProvider = RecipeServiceContext.Provider;

export function useRecipeService(): RecipeService {
  const service = useContext(RecipeServiceContext);
  if (!service) throw new Error('useRecipeService must be used inside a RecipeServiceProvider.');
  return service;
}
