import type { AppDatabase } from '../../../infrastructure/persistence/app-database';
import { PersistenceError } from '../../../shared/errors/persistence-error';
import { fail, ok, type Result } from '../../../shared/types/result';
import type {
  MenuTransferStore,
  TransferCommitError,
  TransferReadError,
  TransferWrite,
} from '../application/menu-transfer-store';
import { groupTransfer, type TransferSnapshot } from '../domain/menu-transfer';

async function guard<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    throw new PersistenceError(
      'Could not transfer menu ingredients because local storage failed.',
      {
        cause: error,
      },
    );
  }
}

async function snapshot(
  db: AppDatabase,
  menuId: string,
): Promise<Result<TransferSnapshot, TransferReadError>> {
  const menu = await db.weeklyMenus.get(menuId);
  if (!menu) return fail('menu-not-found');
  const assignments = await db.menuAssignments.where('menuId').equals(menuId).toArray();
  if (assignments.length > 0 && menu.servings === null) return fail('servings-required');
  const recipes = await db.recipes.bulkGet(assignments.map((entry) => entry.recipeId));
  const resolved: TransferSnapshot['assignments'][number][] = [];
  for (const [index, assignment] of assignments.entries()) {
    const recipe = recipes[index];
    if (!recipe) return fail('recipe-not-found');
    if (!Number.isFinite(recipe.yield) || recipe.yield <= 0) return fail('invalid-recipe-yield');
    resolved.push({ assignment, recipe });
  }
  return ok({
    menu,
    assignments: resolved,
    items: await db.shoppingItems.toArray(),
    categories: await db.categories.toArray(),
  });
}

function signature(value: TransferSnapshot): string {
  const compare = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
  const assignments = [...value.assignments].sort(
    (a, b) =>
      a.assignment.dayOffset - b.assignment.dayOffset ||
      compare(a.assignment.meal, b.assignment.meal) ||
      compare(a.assignment.recipeId, b.assignment.recipeId),
  );
  const relevantItems = groupTransfer(value)
    .flatMap((group) => group.items)
    .sort((a, b) => compare(a.id, b.id));
  const categories = [...value.categories].sort((a, b) => compare(a.id, b.id));
  return JSON.stringify({ menu: value.menu, assignments, items: relevantItems, categories });
}

export class DexieMenuTransferStore implements MenuTransferStore {
  constructor(private readonly db: AppDatabase) {}

  read(menuId: string): Promise<Result<TransferSnapshot, TransferReadError>> {
    return guard(() =>
      this.db.transaction(
        'r',
        this.db.weeklyMenus,
        this.db.menuAssignments,
        this.db.recipes,
        this.db.shoppingItems,
        this.db.categories,
        () => snapshot(this.db, menuId),
      ),
    );
  }

  commit(
    reviewed: TransferSnapshot,
    write: TransferWrite,
  ): Promise<Result<void, TransferCommitError>> {
    return guard(() =>
      this.db.transaction(
        'rw',
        this.db.weeklyMenus,
        this.db.menuAssignments,
        this.db.recipes,
        this.db.shoppingItems,
        this.db.categories,
        async () => {
          const current = await snapshot(this.db, reviewed.menu.id);
          if (!current.ok) return current;
          if (signature(current.value) !== signature(reviewed)) return fail('stale');
          await this.db.shoppingItems.bulkPut([...write.items]);
          await this.db.shoppingItems.bulkDelete([...write.removeIds]);
          return ok(undefined);
        },
      ),
    );
  }
}
