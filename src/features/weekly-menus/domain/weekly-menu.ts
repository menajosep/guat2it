import { fail, ok, type Result } from '../../../shared/types/result';

export const MAX_MENU_NAME_LENGTH = 100;

export interface WeeklyMenu {
  readonly id: string;
  readonly name: string;
  readonly startDate: string;
}

export interface WeeklyMenuDraft {
  readonly name: string;
  readonly startDate: string;
}

export interface WeeklyMenuErrors {
  readonly name?: 'empty' | 'too-long';
  readonly startDate?: 'invalid';
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
  if (nameError || !dateValid) {
    return fail({
      ...(nameError ? { name: nameError } : {}),
      ...(!dateValid ? { startDate: 'invalid' as const } : {}),
    });
  }
  return ok({ id, name, startDate: draft.startDate });
}
