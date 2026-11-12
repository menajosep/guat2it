import { createWeeklyMenu, isCalendarDate, localCalendarDate } from './weekly-menu';

describe('weekly menu validation', () => {
  it('uses the local calendar fields rather than UTC', () => {
    expect(localCalendarDate(new Date(2026, 0, 2, 23, 30))).toBe('2026-01-02');
    expect(localCalendarDate(new Date(2026, 11, 31, 0, 1))).toBe('2026-12-31');
  });

  it.each(['2024-02-29', '2000-02-29', '2026-11-16', '0001-01-01'])(
    'accepts real calendar date %s',
    (date) => {
      expect(isCalendarDate(date)).toBe(true);
    },
  );

  it.each(['', '2023-02-29', '1900-02-29', '2026-04-31', '0000-01-01', '2026-13-01', '2026-1-01'])(
    'rejects invalid date %s',
    (date) => {
      expect(isCalendarDate(date)).toBe(false);
    },
  );

  it('validates both fields and trims the saved name', () => {
    expect(createWeeklyMenu({ name: '  Menu  ', startDate: '2026-11-16' }, 'a')).toEqual({
      ok: true,
      value: { id: 'a', name: 'Menu', startDate: '2026-11-16' },
    });
    expect(createWeeklyMenu({ name: ' ', startDate: '' }, 'a')).toEqual({
      ok: false,
      error: { name: 'empty', startDate: 'invalid' },
    });
    expect(createWeeklyMenu({ name: 'x'.repeat(101), startDate: '2026-11-16' }, 'a')).toEqual({
      ok: false,
      error: { name: 'too-long' },
    });
    expect(createWeeklyMenu({ name: 'x'.repeat(100), startDate: '2026-11-16' }, 'a').ok).toBe(true);
  });
});
