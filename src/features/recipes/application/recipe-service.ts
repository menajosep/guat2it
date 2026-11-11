import { fail, ok, type Result } from '../../../shared/types/result';
import { parseIngredient } from '../domain/parse-ingredient';
import { validateRecipe, type Recipe, type RecipeDraft, type RecipeErrors } from '../domain/recipe';
import type {
  RecipeDownloadError,
  RecipeExtractor,
  RecipeSourceReader,
  RecipeStore,
} from './recipe-ports';

export const MAX_SOURCE_BYTES = 5 * 1024 * 1024;
export type ImportError = RecipeDownloadError | 'no-recipe';

export function isSupportedSourceUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:' &&
      (url.hostname === 'www.directoalpaladar.com' || url.hostname === 'directoalpaladar.com') &&
      url.port === '' &&
      url.username === '' &&
      url.password === ''
    );
  } catch {
    return false;
  }
}

export class RecipeService {
  constructor(
    private readonly store: RecipeStore,
    private readonly extract: RecipeExtractor,
    private readonly generateId: () => string,
    private readonly sourceReader?: RecipeSourceReader,
  ) {}

  get canDownload(): boolean {
    return this.sourceReader !== undefined;
  }

  async importFromUrl(sourceUrl: string): Promise<Result<RecipeDraft, ImportError>> {
    const url = sourceUrl.trim();
    if (!isSupportedSourceUrl(url)) return fail('invalid-url');
    if (!this.sourceReader) throw new Error('Native recipe downloading is not available.');
    const source = await this.sourceReader.read(url);
    if (!source.ok) return source;
    return this.import(url, source.value);
  }

  import(sourceUrl: string, source: string): Result<RecipeDraft, ImportError> {
    const url = sourceUrl.trim();
    if (!isSupportedSourceUrl(url)) return fail('invalid-url');
    if (
      source.length > MAX_SOURCE_BYTES ||
      new TextEncoder().encode(source).length > MAX_SOURCE_BYTES
    )
      return fail('source-too-large');
    const extracted = this.extract(source);
    if (!extracted.ok) return extracted;
    return ok({
      sourceUrl: url,
      ...extracted.value,
      ingredients: extracted.value.ingredients.map(parseIngredient),
    });
  }

  list(): Promise<Recipe[]> {
    return this.store.list();
  }

  async remove(id: string): Promise<Result<void, 'not-found'>> {
    const removed = await this.store.remove(id);
    return removed ? ok(undefined) : fail('not-found');
  }

  async update(
    id: string,
    draft: RecipeDraft,
  ): Promise<Result<Recipe, RecipeErrors | 'not-found'>> {
    const existing = await this.store.get(id);
    if (!existing) return fail('not-found');
    const validated = validateRecipe({ ...draft, sourceUrl: existing.sourceUrl }, id);
    if (!validated.ok) return validated;
    const updated = await this.store.update(validated.value);
    return updated ? ok(validated.value) : fail('not-found');
  }

  get(id: string): Promise<Recipe | undefined> {
    return this.store.get(id);
  }

  async save(draft: RecipeDraft): Promise<Result<Recipe, RecipeErrors | 'invalid-url'>> {
    if (!isSupportedSourceUrl(draft.sourceUrl)) return fail('invalid-url');
    const recipe = validateRecipe(draft, this.generateId());
    if (!recipe.ok) return recipe;
    await this.store.save(recipe.value);
    return recipe;
  }
}
