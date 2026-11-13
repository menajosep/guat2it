import { fail, ok, type Result } from '../../../shared/types/result';
import { parseItemName, type ItemNameError } from '../../shopping-list/domain/shopping-item';
import {
  amountToText,
  parseQuantity,
  type Quantity,
  type QuantityDraft,
  type QuantityError,
} from '../../shopping-list/domain/quantity';

export interface RecipeIngredient extends Quantity {
  readonly name: string;
}

export interface IngredientDraft {
  readonly source: string;
  readonly name: string;
  readonly quantity: QuantityDraft;
  readonly confirmed: boolean;
}

export const RECIPE_CATEGORIES = [
  'breakfast-brunch',
  'appetizers-snacks',
  'soups-stews',
  'salads',
  'main-courses',
  'side-dishes',
  'breads-baked-goods',
  'desserts',
  'sauces-condiments',
  'beverages',
] as const;

export type RecipeCategory = (typeof RECIPE_CATEGORIES)[number];

export function isRecipeCategory(value: unknown): value is RecipeCategory {
  return typeof value === 'string' && RECIPE_CATEGORIES.some((category) => category === value);
}

export interface RecipeDraft {
  readonly sourceUrl: string;
  readonly title: string;
  readonly category?: RecipeCategory | undefined;
  readonly yield: string;
  readonly ingredients: readonly IngredientDraft[];
  readonly instructions: string;
  readonly imageUrl: string;
}

export interface Recipe {
  readonly id: string;
  readonly sourceUrl: string;
  readonly title: string;
  readonly category?: RecipeCategory;
  readonly yield: number;
  readonly ingredients: readonly RecipeIngredient[];
  readonly instructions: string;
  readonly imageUrl: string;
}

export function recipeToDraft(recipe: Recipe): RecipeDraft {
  return {
    sourceUrl: recipe.sourceUrl,
    title: recipe.title,
    ...(recipe.category ? { category: recipe.category } : {}),
    yield: String(recipe.yield),
    ingredients: recipe.ingredients.map((ingredient) => ({
      source: '',
      name: ingredient.name,
      quantity: { amount: amountToText(ingredient), unit: ingredient.unit },
      confirmed: true,
    })),
    instructions: recipe.instructions,
    imageUrl: recipe.imageUrl,
  };
}

export interface IngredientErrors {
  readonly name?: ItemNameError;
  readonly quantity?: QuantityError;
  readonly unconfirmed?: true;
}

export interface RecipeErrors {
  readonly title?: 'required';
  readonly category?: 'invalid';
  readonly yield?: 'invalid';
  readonly ingredients?: 'required';
  readonly ingredientErrors?: readonly (IngredientErrors | undefined)[];
  readonly instructions?: 'required';
  readonly imageUrl?: 'invalid';
}

export function isHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.username === '' && url.password === '';
  } catch {
    return false;
  }
}

export function validateIngredient(
  draft: IngredientDraft,
): Result<RecipeIngredient, IngredientErrors> {
  const name = parseItemName(draft.name);
  const quantity = parseQuantity(draft.quantity);
  if (!name.ok || !quantity.ok || !draft.confirmed) {
    return fail({
      ...(name.ok ? {} : { name: name.error }),
      ...(quantity.ok ? {} : { quantity: quantity.error }),
      ...(draft.confirmed ? {} : { unconfirmed: true as const }),
    });
  }
  return ok({ name: name.value, ...quantity.value });
}

export function validateRecipe(draft: RecipeDraft, id: string): Result<Recipe, RecipeErrors> {
  const title = draft.title.trim();
  const instructions = draft.instructions.trim();
  const yieldText = draft.yield.trim();
  const yieldNumber = Number(yieldText.replace(',', '.'));
  const validYield = /^\d+(?:[.,]\d+)?$/.test(yieldText) && Number.isFinite(yieldNumber);
  const ingredientResults = draft.ingredients.map(validateIngredient);
  const ingredientErrors = ingredientResults.map((result) =>
    result.ok ? undefined : result.error,
  );
  const errors: RecipeErrors = {
    ...(title ? {} : { title: 'required' }),
    ...(draft.category === undefined || isRecipeCategory(draft.category)
      ? {}
      : { category: 'invalid' }),
    ...(validYield && yieldNumber > 0 ? {} : { yield: 'invalid' }),
    ...(draft.ingredients.length > 0 ? {} : { ingredients: 'required' }),
    ...(ingredientErrors.some((error) => error !== undefined) ? { ingredientErrors } : {}),
    ...(instructions ? {} : { instructions: 'required' }),
    ...(isHttpsUrl(draft.imageUrl.trim()) ? {} : { imageUrl: 'invalid' }),
  };
  if (Object.keys(errors).length > 0) return fail(errors);

  const ingredients: RecipeIngredient[] = [];
  for (const result of ingredientResults) {
    if (!result.ok) return fail(errors);
    ingredients.push(result.value);
  }
  return ok({
    id,
    sourceUrl: draft.sourceUrl,
    title,
    ...(draft.category ? { category: draft.category } : {}),
    yield: yieldNumber,
    ingredients,
    instructions,
    imageUrl: draft.imageUrl.trim(),
  });
}
