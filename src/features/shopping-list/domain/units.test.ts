import { isUnitId, UNIT_IDS, UNITS } from './units';

describe('UNITS', () => {
  it('gives every unit a singular and a plural label', () => {
    for (const id of UNIT_IDS) {
      expect(UNITS[id].singular.length).toBeGreaterThan(0);
      expect(UNITS[id].plural.length).toBeGreaterThan(0);
    }
  });

  it('has only "to taste" and "a bit" without an amount', () => {
    const withoutAmount = UNIT_IDS.filter((id) => !UNITS[id].takesAmount);
    expect(withoutAmount).toEqual(['to-taste', 'a-bit']);
  });

  it('has unique singular labels so the choices are distinguishable', () => {
    const labels = UNIT_IDS.map((id) => UNITS[id].singular);
    expect(new Set(labels).size).toBe(labels.length);
  });
});

describe('isUnitId', () => {
  it('accepts known ids only', () => {
    expect(isUnitId('gram')).toBe(true);
    expect(isUnitId('')).toBe(false);
    expect(isUnitId('toString')).toBe(false);
  });
});
