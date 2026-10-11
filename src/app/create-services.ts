import { ShoppingListService } from '../features/shopping-list/application/shopping-list-service';
import { DexieShoppingItemStore } from '../features/shopping-list/infrastructure/dexie-shopping-item-store';
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
