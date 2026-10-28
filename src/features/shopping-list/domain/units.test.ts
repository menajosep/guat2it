import { isUnitId, UNIT_IDS, UNITS } from './units';

describe('UNITS', () => {
  it('has only "to taste" and "a bit" without an amount', () => {
    const withoutAmount = UNIT_IDS.filter((id) => !UNITS[id].takesAmount);
    expect(withoutAmount).toEqual(['to-taste', 'a-bit']);
  });

  it('keeps the stored ids stable', () => {
    expect(UNIT_IDS).toHaveLength(39);
    expect(UNIT_IDS.slice(0, 3)).toEqual(['to-taste', 'a-bit', 'stick']);
    expect(UNIT_IDS).toContain('small-glass');
  });
});

describe('isUnitId', () => {
  it('accepts known ids only', () => {
    expect(isUnitId('gram')).toBe(true);
    expect(isUnitId('')).toBe(false);
    expect(isUnitId('toString')).toBe(false);
  });
});
