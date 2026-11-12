import type { AppDatabase } from '../../../infrastructure/persistence/app-database';
import { PersistenceError, type PersistenceAction } from '../../../shared/errors/persistence-error';
import type { RecipeStore } from '../application/recipe-ports';
import type { Recipe } from '../domain/recipe';

async function guard<T>(action: PersistenceAction, operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    throw new PersistenceError('Could not access recipes because local storage failed.', {
      cause: error,
      action,
    });
  }
}

export class DexieRecipeStore implements RecipeStore {
  constructor(private readonly db: AppDatabase) {}

  list(): Promise<Recipe[]> {
    return guard('load-recipes', () => this.db.recipes.toArray());
  }

  get(id: string): Promise<Recipe | undefined> {
    return guard('read-recipe', () => this.db.recipes.get(id));
  }

  save(recipe: Recipe): Promise<void> {
    return guard('save-recipe', async () => {
      await this.db.recipes.add(recipe);
    });
  }

  update(recipe: Recipe): Promise<boolean> {
    return guard('update-recipe', () =>
      this.db.transaction('rw', this.db.recipes, async () => {
        const existing = await this.db.recipes.get(recipe.id);
        if (!existing) return false;
        await this.db.recipes.put(recipe);
        return true;
      }),
    );
  }

  remove(id: string): Promise<boolean | 'in-use'> {
    return guard('remove-recipe', () =>
      this.db.transaction('rw', this.db.recipes, this.db.menuAssignments, async () => {
        const recipe = await this.db.recipes.get(id);
        if (!recipe) return false;
        if (await this.db.menuAssignments.where('recipeId').equals(id).count()) return 'in-use';
        await this.db.recipes.delete(id);
        return true;
      }),
    );
  }
}
