import { fail, ok, type Result } from '../../../shared/types/result';

export const MAX_MENU_NAME_LENGTH = 100;

export interface WeeklyMenu {
  readonly id: string;
  readonly name: string;
  readonly startDate: string;
  readonly servings: number | null;
}

export interface WeeklyMenuDraft {
  readonly name: string;
  readonly startDate: string;
  readonly servings: string;
}

export interface WeeklyMenuErrors {
  readonly name?: 'empty' | 'too-long';
  readonly startDate?: 'invalid';
  readonly servings?: 'invalid';
}

export function parseServings(value: string): Result<number, 'invalid'> {
  const text = value.trim();
  if (!/^\d+$/.test(text)) return fail('invalid');
  const servings = Number(text);
  return Number.isSafeInteger(servings) && servings > 0 ? ok(servings) : fail('invalid');
}

export function localCalendarDate(date: Date): string {
  const year = String(date.getFullYear()).padStart(4, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isCalendarDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1 || month < 1 || month > 12 || day < 1) return false;
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day <= (days[month - 1] ?? 0);
}

export function createWeeklyMenu(
  draft: WeeklyMenuDraft,
  id: string,
): Result<WeeklyMenu, WeeklyMenuErrors> {
  const name = draft.name.trim();
  const nameError =
    name.length === 0 ? 'empty' : name.length > MAX_MENU_NAME_LENGTH ? 'too-long' : undefined;
  const dateValid = isCalendarDate(draft.startDate);
  const servings = parseServings(draft.servings);
  if (nameError || !dateValid || !servings.ok) {
    return fail({
      ...(nameError ? { name: nameError } : {}),
      ...(!dateValid ? { startDate: 'invalid' as const } : {}),
      ...(!servings.ok ? { servings: 'invalid' as const } : {}),
    });
  }
  return ok({ id, name, startDate: draft.startDate, servings: servings.value });
}
