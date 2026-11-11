import { parseItemName } from '../../shopping-list/domain/shopping-item';
import { parseQuantity } from '../../shopping-list/domain/quantity';
import type { UnitId } from '../../shopping-list/domain/units';
import type { IngredientDraft } from './recipe';

const units: Readonly<Record<string, UnitId>> = {
  g: 'gram',
  gramo: 'gram',
  gramos: 'gram',
  kg: 'kilogram',
  kilogramo: 'kilogram',
  kilogramos: 'kilogram',
  ml: 'milliliter',
  mililitro: 'milliliter',
  mililitros: 'milliliter',
  l: 'liter',
  litro: 'liter',
  litros: 'liter',
  cucharada: 'tablespoon',
  cucharadas: 'tablespoon',
  cucharadita: 'teaspoon',
  cucharaditas: 'teaspoon',
  diente: 'clove',
  dientes: 'clove',
  count: 'whole',
  unidad: 'whole',
  unidades: 'whole',
};

const amountPattern = '\\d+(?:[.,]\\d{1,2})?';
const unitPattern = Object.keys(units).join('|');
const prefix = new RegExp(`^(${amountPattern})\\s*(${unitPattern})\\s+(?:de\\s+)?(.+)$`, 'iu');
const suffix = new RegExp(`^(.+?)\\s+(${amountPattern})\\s*(${unitPattern})$`, 'iu');

export function parseIngredient(source: string): IngredientDraft {
  const text = source.trim();
  const first = prefix.exec(text);
  const last = first ? null : suffix.exec(text);
  const name = first?.[3] ?? last?.[1];
  const amount = first?.[1] ?? last?.[2];
  const rawUnit = first?.[2] ?? last?.[3];
  const unit = rawUnit ? units[rawUnit.toLocaleLowerCase('es')] : undefined;
  if (name !== undefined && amount !== undefined && unit !== undefined) {
    const quantity = { amount, unit };
    if (parseItemName(name).ok && parseQuantity(quantity).ok) {
      return { source, name: name.trim(), quantity, confirmed: true };
    }
  }
  return {
    source,
    name: text,
    quantity: { amount: '', unit: undefined },
    confirmed: false,
  };
}
