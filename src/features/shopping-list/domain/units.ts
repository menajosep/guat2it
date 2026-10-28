export interface UnitDefinition {
  /** Units such as "to taste" are vague by nature and are never combined with an amount. */
  readonly takesAmount: boolean;
}

const counted: UnitDefinition = { takesAmount: true };
const vague: UnitDefinition = { takesAmount: false };

/**
 * The ids are stored in the database, so never rename one. Keys are in the order shown to the
 * user. Display names live in the message catalogs, one per language.
 */
export const UNITS = {
  'to-taste': vague,
  'a-bit': vague,
  stick: counted,
  jar: counted,
  bottle: counted,
  dash: counted,
  'small-glass': counted,
  square: counted,
  tablespoon: counted,
  teaspoon: counted,
  dozen: counted,
  clove: counted,
  whole: counted,
  flake: counted,
  ear: counted,
  wedge: counted,
  drop: counted,
  gram: counted,
  leaf: counted,
  kilogram: counted,
  can: counted,
  pound: counted,
  liter: counted,
  bunch: counted,
  half: counted,
  milliliter: counted,
  pinch: counted,
  inch: counted,
  handful: counted,
  strip: counted,
  sprig: counted,
  slice: counted,
  piece: counted,
  sachet: counted,
  'small-cup': counted,
  stalk: counted,
  cup: counted,
  shaving: counted,
  glass: counted,
} as const satisfies Record<string, UnitDefinition>;

export type UnitId = keyof typeof UNITS;

export const UNIT_IDS = Object.keys(UNITS) as UnitId[];

export function isUnitId(value: string): value is UnitId {
  return Object.hasOwn(UNITS, value);
}
