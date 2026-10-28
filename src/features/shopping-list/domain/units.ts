export interface UnitDefinition {
  readonly singular: string;
  readonly plural: string;
  /** Units such as "to taste" are vague by nature and are never combined with an amount. */
  readonly takesAmount: boolean;
}

const counted = (singular: string, plural: string = `${singular}s`): UnitDefinition => ({
  singular,
  plural,
  takesAmount: true,
});

const vague = (label: string): UnitDefinition => ({
  singular: label,
  plural: label,
  takesAmount: false,
});

/** The ids are stored in the database, so never rename one. Keys are in the order shown to the user. */
export const UNITS = {
  'to-taste': vague('to taste'),
  'a-bit': vague('a bit'),
  stick: counted('stick'),
  jar: counted('jar'),
  bottle: counted('bottle'),
  dash: counted('dash', 'dashes'),
  'small-glass': counted('small glass', 'small glasses'),
  square: counted('square'),
  tablespoon: counted('tablespoon'),
  teaspoon: counted('teaspoon'),
  dozen: counted('dozen', 'dozen'),
  clove: counted('clove'),
  whole: counted('whole', 'whole'),
  flake: counted('flake'),
  ear: counted('ear'),
  wedge: counted('wedge'),
  drop: counted('drop'),
  gram: counted('gram'),
  leaf: counted('leaf', 'leaves'),
  kilogram: counted('kilogram'),
  can: counted('can'),
  pound: counted('pound'),
  liter: counted('liter'),
  bunch: counted('bunch', 'bunches'),
  half: counted('half', 'halves'),
  milliliter: counted('milliliter'),
  pinch: counted('pinch', 'pinches'),
  inch: counted('inch', 'inches'),
  handful: counted('handful'),
  strip: counted('strip'),
  sprig: counted('sprig'),
  slice: counted('slice'),
  piece: counted('piece'),
  sachet: counted('sachet'),
  'small-cup': counted('small cup'),
  stalk: counted('stalk'),
  cup: counted('cup'),
  shaving: counted('shaving'),
  glass: counted('glass', 'glasses'),
} as const satisfies Record<string, UnitDefinition>;

export type UnitId = keyof typeof UNITS;

export const UNIT_IDS = Object.keys(UNITS) as UnitId[];

export function isUnitId(value: string): value is UnitId {
  return Object.hasOwn(UNITS, value);
}
