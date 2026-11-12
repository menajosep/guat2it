import { menuDays, validateSlot } from './menu-assignment';

it.each([
  ['2024-02-27', '2024-02-29', '2024-03-04'],
  ['0099-12-29', '0099-12-31', '0100-01-04'],
  ['9999-12-29', '9999-12-31', '+010000-01-04'],
])('derives seven calendar days from %s', (start, third, last) => {
  const days = menuDays(start);
  expect(days).toHaveLength(7);
  expect(days[2]?.toISOString().split('T')[0]).toBe(third);
  expect(days[6]?.toISOString().split('T')[0]).toBe(last);
});

it('rejects invalid start dates and invalid slots', () => {
  expect(() => menuDays('2026-02-29')).toThrow();
  for (const offset of [-1, 7, 0.5, Number.NaN]) {
    expect(validateSlot(offset, 'lunch')).toEqual({ ok: false, error: 'invalid-slot' });
  }
  expect(validateSlot(0, 'breakfast')).toEqual({ ok: false, error: 'invalid-slot' });
  expect(validateSlot(6, 'dinner')).toEqual({ ok: true, value: 'dinner' });
});
