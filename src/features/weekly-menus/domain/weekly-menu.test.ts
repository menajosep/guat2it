import { createWeeklyMenu, isCalendarDate, localCalendarDate, parseServings } from './weekly-menu';

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

  it('validates fields and trims the saved name', () => {
    expect(
      createWeeklyMenu({ name: '  Menu  ', startDate: '2026-11-16', servings: '2' }, 'a'),
    ).toEqual({
      ok: true,
      value: { id: 'a', name: 'Menu', startDate: '2026-11-16', servings: 2 },
    });
    expect(createWeeklyMenu({ name: ' ', startDate: '', servings: '' }, 'a')).toEqual({
      ok: false,
      error: { name: 'empty', startDate: 'invalid', servings: 'invalid' },
    });
    expect(
      createWeeklyMenu({ name: 'x'.repeat(101), startDate: '2026-11-16', servings: '2' }, 'a'),
    ).toEqual({
      ok: false,
      error: { name: 'too-long' },
    });
    expect(
      createWeeklyMenu({ name: 'x'.repeat(100), startDate: '2026-11-16', servings: '2' }, 'a').ok,
    ).toBe(true);
  });

  it.each([
    ['1', 1],
    [String(Number.MAX_SAFE_INTEGER), Number.MAX_SAFE_INTEGER],
  ])('accepts safe positive whole-number servings %s', (value, servings) => {
    expect(parseServings(value)).toEqual({ ok: true, value: servings });
  });

  it.each(['', '0', '-1', '1.5', '1e3', String(Number.MAX_SAFE_INTEGER + 1), 'NaN'])(
    'rejects invalid servings %s',
    (value) => {
      expect(parseServings(value)).toEqual({ ok: false, error: 'invalid' });
    },
  );
});
