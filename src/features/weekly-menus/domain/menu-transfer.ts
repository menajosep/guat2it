import type { Category } from '../../shopping-list/domain/category';
import {
  MAX_AMOUNT,
  parseQuantity,
  type Quantity,
  type QuantityDraft,
  type QuantityError,
} from '../../shopping-list/domain/quantity';
import type { ShoppingItem } from '../../shopping-list/domain/shopping-item';
import type { UnitId } from '../../shopping-list/domain/units';
import type { Recipe } from '../../recipes/domain/recipe';
import { fail, ok, type Result } from '../../../shared/types/result';
import { MEALS, type MenuAssignment } from './menu-assignment';
import type { WeeklyMenu } from './weekly-menu';

export interface TransferSnapshot {
  readonly menu: WeeklyMenu;
  readonly assignments: readonly { assignment: MenuAssignment; recipe: Recipe }[];
  readonly items: readonly ShoppingItem[];
  readonly categories: readonly Category[];
}

export interface TransferContribution {
  readonly quantity: Quantity;
  readonly scaledAmount?: ExactAmount;
  readonly source:
    | {
        readonly kind: 'recipe';
        readonly title: string;
        readonly yield: number;
        readonly assignment: MenuAssignment;
      }
    | { readonly kind: 'shopping'; readonly itemId: string };
}

export interface ExactAmount {
  readonly numerator: bigint;
  readonly denominator: bigint;
}

export interface TransferGroup {
  readonly key: string;
  readonly name: string;
  readonly servings: number | null;
  readonly contributions: readonly TransferContribution[];
  readonly items: readonly ShoppingItem[];
}

export interface TransferChoice {
  readonly target?: UnitId | null;
  readonly manual?: QuantityDraft;
}

export type TransferQuantityError =
  | 'choose-unit'
  | 'manual-required'
  | 'unit-mismatch'
  | 'servings-required'
  | 'invalid-yield'
  | QuantityError;

const nameKey = (name: string) => name.trim().toLowerCase();
const compareText = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
const quantityOf = (quantity: Quantity): Quantity => ({
  ...(quantity.amount === undefined ? {} : { amount: quantity.amount }),
  ...(quantity.unit === undefined ? {} : { unit: quantity.unit }),
});

function compareItems(a: ShoppingItem, b: ShoppingItem): number {
  return a.createdAt.getTime() - b.createdAt.getTime() || compareText(a.id, b.id);
}

function gcd(a: bigint, b: bigint): bigint {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b !== 0n) {
    [a, b] = [b, a % b];
  }
  return a;
}

function rational(numerator: bigint, denominator: bigint): ExactAmount {
  if (denominator < 0n) {
    numerator = -numerator;
    denominator = -denominator;
  }
  const divisor = gcd(numerator, denominator);
  return { numerator: numerator / divisor, denominator: denominator / divisor };
}

function multiply(a: ExactAmount, b: ExactAmount): ExactAmount {
  return rational(a.numerator * b.numerator, a.denominator * b.denominator);
}

function add(a: ExactAmount, b: ExactAmount): ExactAmount {
  return rational(
    a.numerator * b.denominator + b.numerator * a.denominator,
    a.denominator * b.denominator,
  );
}

function decimalRational(value: number): ExactAmount | undefined {
  if (!Number.isFinite(value)) return undefined;
  const text = value.toString().toLowerCase();
  const [coefficient = '', exponentText] = text.split('e');
  const exponent = exponentText === undefined ? 0 : Number(exponentText);
  const decimalIndex = coefficient.indexOf('.');
  const places = (decimalIndex < 0 ? 0 : coefficient.length - decimalIndex - 1) - exponent;
  const digits = coefficient.replace('.', '');
  if (!/^-?\d+$/.test(digits) || !Number.isInteger(places)) return undefined;
  const numerator = BigInt(digits);
  if (places <= 0) return rational(numerator * 10n ** BigInt(-places), 1n);
  return rational(numerator, 10n ** BigInt(places));
}

function servingsFactor(servings: number, yieldValue: number): ExactAmount | undefined {
  const recipeYield = decimalRational(yieldValue);
  if (!recipeYield || recipeYield.numerator <= 0n) return undefined;
  return rational(BigInt(servings) * recipeYield.denominator, recipeYield.numerator);
}

export function groupTransfer(snapshot: TransferSnapshot): TransferGroup[] {
  const groups = new Map<string, { name: string; contributions: TransferContribution[] }>();
  const assignments = [...snapshot.assignments].sort(
    (a, b) =>
      a.assignment.dayOffset - b.assignment.dayOffset ||
      MEALS.indexOf(a.assignment.meal) - MEALS.indexOf(b.assignment.meal) ||
      compareText(a.assignment.recipeId, b.assignment.recipeId),
  );
  for (const { assignment, recipe } of assignments) {
    const scale =
      snapshot.menu.servings === null
        ? undefined
        : servingsFactor(snapshot.menu.servings, recipe.yield);
    for (const ingredient of recipe.ingredients) {
      const amount =
        ingredient.amount === undefined ? undefined : decimalRational(ingredient.amount);
      const key = nameKey(ingredient.name);
      let group = groups.get(key);
      if (!group) {
        group = { name: ingredient.name, contributions: [] };
        groups.set(key, group);
      }
      group.contributions.push({
        quantity: quantityOf(ingredient),
        ...(amount && scale ? { scaledAmount: multiply(amount, scale) } : {}),
        source: { kind: 'recipe', title: recipe.title, yield: recipe.yield, assignment },
      });
    }
  }
  return [...groups].map(([key, group]) => {
    const items = snapshot.items
      .filter((item) => !item.completed && nameKey(item.name) === key)
      .sort(compareItems);
    return {
      key,
      name: items[0]?.name ?? group.name,
      servings: snapshot.menu.servings,
      items,
      contributions: [
        ...group.contributions,
        ...items.map((item): TransferContribution => {
          const amount = item.amount === undefined ? undefined : decimalRational(item.amount);
          return {
            quantity: quantityOf(item),
            ...(amount ? { scaledAmount: amount } : {}),
            source: { kind: 'shopping', itemId: item.id },
          };
        }),
      ],
    };
  });
}

const mass: Partial<Record<UnitId, bigint>> = {
  gram: 100000n,
  kilogram: 100000000n,
  pound: 45359237n,
};
const volume: Partial<Record<UnitId, bigint>> = { milliliter: 1n, liter: 1000n };

function factor(unit: UnitId, target: UnitId): ExactAmount | undefined {
  if (unit === target) return rational(1n, 1n);
  const massSource = mass[unit];
  const massTarget = mass[target];
  if (massSource !== undefined && massTarget !== undefined) return rational(massSource, massTarget);
  const volumeSource = volume[unit];
  const volumeTarget = volume[target];
  if (volumeSource !== undefined && volumeTarget !== undefined)
    return rational(volumeSource, volumeTarget);
  return undefined;
}

export function transferUnits(group: TransferGroup): UnitId[] {
  return [
    ...new Set(
      group.contributions.flatMap(({ quantity }) => (quantity.unit ? [quantity.unit] : [])),
    ),
  ];
}

export function formatExactAmount(amount: ExactAmount): string {
  let denominator = amount.denominator;
  let twos = 0;
  let fives = 0;
  while (denominator % 2n === 0n) {
    denominator /= 2n;
    twos += 1;
  }
  while (denominator % 5n === 0n) {
    denominator /= 5n;
    fives += 1;
  }
  if (denominator !== 1n) return `${String(amount.numerator)}/${String(amount.denominator)}`;

  const places = Math.max(twos, fives);
  const scaled = amount.numerator * 2n ** BigInt(places - twos) * 5n ** BigInt(places - fives);
  const negative = scaled < 0n;
  const digits = String(negative ? -scaled : scaled).padStart(places + 1, '0');
  if (places === 0) return `${negative ? '-' : ''}${digits}`;
  const whole = digits.slice(0, -places);
  const fractional = digits.slice(-places).replace(/0+$/, '');
  return `${negative ? '-' : ''}${whole}${fractional ? `.${fractional}` : ''}`;
}

export function resolveTransferQuantity(
  group: TransferGroup,
  choice: TransferChoice,
): Result<Quantity, TransferQuantityError> {
  if (
    group.contributions.some(
      ({ source }) =>
        source.kind === 'recipe' && (!Number.isFinite(source.yield) || source.yield <= 0),
    )
  )
    return fail('invalid-yield');
  if (group.servings === null) return fail('servings-required');
  const units = transferUnits(group);
  const target =
    choice.target === null
      ? undefined
      : (choice.target ?? (units.length === 1 ? units[0] : undefined));
  if (units.length > 1 && choice.target === undefined) return fail('choose-unit');
  if (choice.manual) {
    if (target !== undefined && choice.manual.unit !== target) return fail('unit-mismatch');
    return parseQuantity(choice.manual);
  }
  if (target === undefined) return fail('manual-required');
  let numerator = 0n;
  let denominator = 1n;
  for (const contribution of group.contributions) {
    const { quantity, scaledAmount } = contribution;
    if (scaledAmount === undefined || quantity.unit === undefined) return fail('manual-required');
    const ratio = factor(quantity.unit, target);
    if (!ratio) return fail('manual-required');
    const converted = multiply(scaledAmount, ratio);
    const total = add({ numerator, denominator }, converted);
    numerator = total.numerator;
    denominator = total.denominator;
  }
  const cents = numerator * 100n;
  if (cents % denominator !== 0n) return fail('manual-required');
  const totalCents = cents / denominator;
  if (totalCents <= 0n || totalCents > BigInt(Math.round(MAX_AMOUNT * 100)))
    return fail('manual-required');
  return ok({ amount: Number(totalCents) / 100, unit: target });
}

export function transferItem(
  group: TransferGroup,
  quantity: Quantity,
  id: string,
  createdAt: Date,
): ShoppingItem {
  const existing = group.items[0];
  const categoryIds = [...new Set(group.items.flatMap((item) => item.categoryIds ?? []))];
  return {
    id: existing?.id ?? id,
    name: group.name,
    completed: false,
    createdAt: existing?.createdAt ?? createdAt,
    ...quantity,
    ...(categoryIds.length ? { categoryIds } : {}),
  };
}
