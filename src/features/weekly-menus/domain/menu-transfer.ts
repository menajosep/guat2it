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
  readonly source:
    | { readonly kind: 'recipe'; readonly title: string; readonly assignment: MenuAssignment }
    | { readonly kind: 'shopping'; readonly itemId: string };
}

export interface TransferGroup {
  readonly key: string;
  readonly name: string;
  readonly contributions: readonly TransferContribution[];
  readonly items: readonly ShoppingItem[];
}

export interface TransferChoice {
  readonly target?: UnitId | null;
  readonly manual?: QuantityDraft;
}

export type TransferQuantityError =
  'choose-unit' | 'manual-required' | 'unit-mismatch' | QuantityError;

const nameKey = (name: string) => name.trim().toLowerCase();
const compareText = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
const quantityOf = (quantity: Quantity): Quantity => ({
  ...(quantity.amount === undefined ? {} : { amount: quantity.amount }),
  ...(quantity.unit === undefined ? {} : { unit: quantity.unit }),
});

function compareItems(a: ShoppingItem, b: ShoppingItem): number {
  return a.createdAt.getTime() - b.createdAt.getTime() || compareText(a.id, b.id);
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
    for (const ingredient of recipe.ingredients) {
      const key = nameKey(ingredient.name);
      let group = groups.get(key);
      if (!group) {
        group = { name: ingredient.name, contributions: [] };
        groups.set(key, group);
      }
      group.contributions.push({
        quantity: quantityOf(ingredient),
        source: { kind: 'recipe', title: recipe.title, assignment },
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
      items,
      contributions: [
        ...group.contributions,
        ...items.map((item): TransferContribution => ({
          quantity: quantityOf(item),
          source: { kind: 'shopping', itemId: item.id },
        })),
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

function factor(unit: UnitId, target: UnitId): [bigint, bigint] | undefined {
  if (unit === target) return [1n, 1n];
  const massSource = mass[unit];
  const massTarget = mass[target];
  if (massSource !== undefined && massTarget !== undefined) return [massSource, massTarget];
  const volumeSource = volume[unit];
  const volumeTarget = volume[target];
  if (volumeSource !== undefined && volumeTarget !== undefined) return [volumeSource, volumeTarget];
  return undefined;
}

function gcd(a: bigint, b: bigint): bigint {
  while (b !== 0n) {
    [a, b] = [b, a % b];
  }
  return a;
}

export function transferUnits(group: TransferGroup): UnitId[] {
  return [
    ...new Set(
      group.contributions.flatMap(({ quantity }) => (quantity.unit ? [quantity.unit] : [])),
    ),
  ];
}

export function resolveTransferQuantity(
  group: TransferGroup,
  choice: TransferChoice,
): Result<Quantity, TransferQuantityError> {
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
  for (const { quantity } of group.contributions) {
    if (quantity.amount === undefined || quantity.unit === undefined)
      return fail('manual-required');
    const ratio = factor(quantity.unit, target);
    if (!ratio) return fail('manual-required');
    const cents = BigInt(Math.round(quantity.amount * 100));
    numerator = numerator * ratio[1] + cents * ratio[0] * denominator;
    denominator *= ratio[1];
    const divisor = gcd(numerator, denominator);
    numerator /= divisor;
    denominator /= divisor;
  }
  if (numerator % denominator !== 0n) return fail('manual-required');
  const total = numerator / denominator;
  if (total <= 0n || total > BigInt(Math.round(MAX_AMOUNT * 100))) return fail('manual-required');
  return ok({ amount: Number(total) / 100, unit: target });
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
