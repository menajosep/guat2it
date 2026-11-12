import type { AppDatabase } from '../../../infrastructure/persistence/app-database';
import { PersistenceError } from '../../../shared/errors/persistence-error';
import { fail, ok, type Result } from '../../../shared/types/result';
import type { MenuAssignmentStore } from '../application/menu-assignment-store';
import type { AssignedRecipe, AssignmentError, MenuAssignment } from '../domain/menu-assignment';

async function guard<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    throw new PersistenceError('Could not access menu assignments because local storage failed.', {
      cause: error,
    });
  }
}

export class DexieMenuAssignmentStore implements MenuAssignmentStore {
  constructor(private readonly db: AppDatabase) {}

  private async resolve(assignments: MenuAssignment[]): Promise<AssignedRecipe[]> {
    const recipes = await this.db.recipes.bulkGet(assignments.map((item) => item.recipeId));
    return assignments.map((assignment, index) => {
      const recipe = recipes[index];
      if (!recipe) throw new Error(`Assigned recipe ${assignment.recipeId} is missing.`);
      return { ...assignment, title: recipe.title };
    });
  }

  add(assignment: MenuAssignment): Promise<Result<AssignedRecipe[], AssignmentError>> {
    return guard(() =>
      this.db.transaction(
        'rw',
        this.db.weeklyMenus,
        this.db.recipes,
        this.db.menuAssignments,
        async () => {
          if (!(await this.db.weeklyMenus.get(assignment.menuId))) return fail('menu-not-found');
          if (!(await this.db.recipes.get(assignment.recipeId))) return fail('recipe-not-found');
          const key: [string, number, typeof assignment.meal, string] = [
            assignment.menuId,
            assignment.dayOffset,
            assignment.meal,
            assignment.recipeId,
          ];
          if (await this.db.menuAssignments.get(key)) return fail('duplicate');
          await this.db.menuAssignments.add(assignment);
          const slot = await this.db.menuAssignments
            .where('menuId')
            .equals(assignment.menuId)
            .filter(
              (item) => item.dayOffset === assignment.dayOffset && item.meal === assignment.meal,
            )
            .toArray();
          return ok(await this.resolve(slot));
        },
      ),
    );
  }

  list(menuId: string): Promise<Result<AssignedRecipe[], 'menu-not-found'>> {
    return guard(() =>
      this.db.transaction(
        'r',
        this.db.weeklyMenus,
        this.db.recipes,
        this.db.menuAssignments,
        async () => {
          if (!(await this.db.weeklyMenus.get(menuId))) return fail('menu-not-found');
          const assignments = await this.db.menuAssignments
            .where('menuId')
            .equals(menuId)
            .toArray();
          return ok(await this.resolve(assignments));
        },
      ),
    );
  }

  remove(assignment: MenuAssignment): Promise<Result<void, 'not-found'>> {
    return guard(() =>
      this.db.transaction('rw', this.db.menuAssignments, async () => {
        const key: [string, number, typeof assignment.meal, string] = [
          assignment.menuId,
          assignment.dayOffset,
          assignment.meal,
          assignment.recipeId,
        ];
        if (!(await this.db.menuAssignments.get(key))) return fail('not-found');
        await this.db.menuAssignments.delete(key);
        return ok(undefined);
      }),
    );
  }
}
