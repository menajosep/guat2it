import type { Result } from '../../../shared/types/result';
import type { Recipe } from '../domain/recipe';

export interface ExtractedRecipe {
  readonly title: string;
  readonly yield: string;
  readonly ingredients: readonly string[];
  readonly instructions: string;
  readonly imageUrl: string;
}

export type RecipeExtractor = (source: string) => Result<ExtractedRecipe, 'no-recipe'>;

export type RecipeDownloadError =
  'invalid-url' | 'source-too-large' | 'network' | 'http' | 'redirect' | 'timeout' | 'encoding';

export interface RecipeSourceReader {
  read(url: string): Promise<Result<string, RecipeDownloadError>>;
}

export interface RecipeStore {
  list(): Promise<Recipe[]>;
  get(id: string): Promise<Recipe | undefined>;
  save(recipe: Recipe): Promise<void>;
}
