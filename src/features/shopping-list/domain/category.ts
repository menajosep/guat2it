import { fail, ok, type Result } from '../../../shared/types/result';

export const MAX_CATEGORY_NAME_LENGTH = 100;

export interface Category {
  readonly id: string;
  readonly name: string;
}

export type CategoryNameError = 'empty' | 'too-long' | 'duplicate';

export function parseCategoryName(raw: string): Result<string, CategoryNameError> {
  const name = raw.trim();
  if (name.length === 0) return fail('empty');
  if (name.length > MAX_CATEGORY_NAME_LENGTH) return fail('too-long');
  return ok(name);
}

export function categoryNameKey(name: string): string {
  return name.toLowerCase();
}

export function distinctCategoryIds(ids: readonly string[]): string[] {
  return [...new Set(ids)];
}
