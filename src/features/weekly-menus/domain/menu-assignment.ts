import { fail, ok, type Result } from '../../../shared/types/result';
import { isCalendarDate } from './weekly-menu';

export const MEALS = ['lunch', 'dinner'] as const;
export type Meal = (typeof MEALS)[number];

export interface MenuAssignment {
  readonly menuId: string;
  readonly recipeId: string;
  readonly dayOffset: number;
  readonly meal: Meal;
}

export interface AssignedRecipe extends MenuAssignment {
  readonly title: string;
}

export type AssignmentError = 'invalid-slot' | 'duplicate' | 'menu-not-found' | 'recipe-not-found';

export function validateSlot(dayOffset: number, meal: string): Result<Meal, 'invalid-slot'> {
  if (!Number.isInteger(dayOffset) || dayOffset < 0 || dayOffset > 6) return fail('invalid-slot');
  if (meal !== 'lunch' && meal !== 'dinner') return fail('invalid-slot');
  return ok(meal);
}

export function menuDays(startDate: string): Date[] {
  if (!isCalendarDate(startDate)) throw new Error('Invalid weekly menu start date.');
  const year = Number(startDate.slice(0, 4));
  const month = Number(startDate.slice(5, 7));
  const day = Number(startDate.slice(8, 10));
  const start = new Date(0);
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCFullYear(year, month - 1, day);
  return Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + offset);
    return date;
  });
}
