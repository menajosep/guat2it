import { LanguageService } from '../features/language/application/language-service';
import { LocalStorageLanguagePreferenceStore } from '../features/language/infrastructure/local-storage-language-preference-store';
import { ShoppingListService } from '../features/shopping-list/application/shopping-list-service';
import { DexieShoppingItemStore } from '../features/shopping-list/infrastructure/dexie-shopping-item-store';
import { RecipeService } from '../features/recipes/application/recipe-service';
import { DexieRecipeStore } from '../features/recipes/infrastructure/dexie-recipe-store';
import { extractRecipe } from '../features/recipes/infrastructure/extract-recipe';
import { NativeRecipeSourceReader } from '../features/recipes/infrastructure/native-recipe-source-reader';
import { AppDatabase, DATABASE_NAME } from '../infrastructure/persistence/app-database';
import { generateId } from '../shared/utils/generate-id';

/** Composition root: wires the application services to their concrete infrastructure. */
export function createShoppingListService(
  databaseName: string = DATABASE_NAME,
): ShoppingListService {
  return new ShoppingListService({
    store: new DexieShoppingItemStore(new AppDatabase(databaseName)),
    generateId,
    now: () => new Date(),
  });
}

export function createLanguageService(storage: Storage = localStorage): LanguageService {
  return new LanguageService(new LocalStorageLanguagePreferenceStore(storage));
}

export function createRecipeService(databaseName: string = DATABASE_NAME): RecipeService {
  const platform = Capacitor.getPlatform();
  return new RecipeService(
    new DexieRecipeStore(new AppDatabase(databaseName)),
    extractRecipe,
    generateId,
    platform === 'android' || platform === 'ios' ? new NativeRecipeSourceReader() : undefined,
  );
}
import { Capacitor } from '@capacitor/core';
