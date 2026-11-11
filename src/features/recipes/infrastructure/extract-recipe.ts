import { fail, ok, type Result } from '../../../shared/types/result';
import type { ExtractedRecipe } from '../application/recipe-ports';

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function findRecipe(value: unknown): JsonRecord | undefined {
  const pending: unknown[] = [value];
  while (pending.length > 0) {
    const current = pending.pop();
    if (Array.isArray(current)) {
      for (let index = current.length - 1; index >= 0; index--) pending.push(current[index]);
    } else if (isRecord(current)) {
      const type = current['@type'];
      const types = Array.isArray(type) ? type : [type];
      if (types.some((entry) => entry === 'Recipe' || entry === 'https://schema.org/Recipe')) {
        return current;
      }
      const children = Object.values(current);
      for (let index = children.length - 1; index >= 0; index--) {
        const child = children[index];
        if (typeof child === 'object' && child !== null) pending.push(child);
      }
    }
  }
  return undefined;
}

function plainText(markup: string): string {
  const template = document.createElement('template');
  template.innerHTML = markup;
  for (const element of template.content.querySelectorAll('script, style')) element.remove();
  for (const element of template.content.querySelectorAll('br, p, div, li')) {
    element.append('\n');
  }
  return template.content.textContent.trim();
}

function instructionText(value: unknown): string {
  const pending: unknown[] = [value];
  const parts: string[] = [];
  while (pending.length > 0) {
    const current = pending.pop();
    if (typeof current === 'string') {
      const text = plainText(current);
      if (text) parts.push(text);
    } else if (Array.isArray(current)) {
      for (let index = current.length - 1; index >= 0; index--) pending.push(current[index]);
    } else if (isRecord(current)) {
      pending.push(typeof current.text === 'string' ? current.text : current.itemListElement);
    }
  }
  return parts.join('\n');
}

function imageUrl(value: unknown): string {
  let current = value;
  while (typeof current !== 'string') {
    if (Array.isArray(current)) current = current[0];
    else if (isRecord(current)) current = current.url;
    else return '';
  }
  return current;
}

function numericYield(value: unknown): string {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (typeof value === 'string' && /^\d+(?:[.,]\d+)?$/.test(value.trim())) return value.trim();
  return '';
}

export function extractRecipe(source: string): Result<ExtractedRecipe, 'no-recipe'> {
  const template = document.createElement('template');
  template.innerHTML = source;
  for (const script of template.content.querySelectorAll('script[type="application/ld+json"]')) {
    let data: unknown;
    try {
      data = JSON.parse(script.textContent);
    } catch (error) {
      if (error instanceof SyntaxError) continue;
      throw error;
    }
    const recipe = findRecipe(data);
    if (!recipe) continue;
    if (
      recipe.recipeIngredient !== undefined &&
      (!Array.isArray(recipe.recipeIngredient) ||
        recipe.recipeIngredient.some((entry) => typeof entry !== 'string'))
    ) {
      return fail('no-recipe');
    }
    const ingredients = Array.isArray(recipe.recipeIngredient)
      ? recipe.recipeIngredient.filter((entry): entry is string => typeof entry === 'string')
      : [];
    const title = typeof recipe.name === 'string' ? plainText(recipe.name) : '';
    const instructions = instructionText(recipe.recipeInstructions);
    if (!title && ingredients.length === 0 && !instructions) continue;
    return ok({
      title,
      yield: numericYield(recipe.recipeYield),
      ingredients,
      instructions,
      imageUrl: imageUrl(recipe.image),
    });
  }
  return fail('no-recipe');
}
