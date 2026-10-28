import type { QuantityError } from '../domain/quantity';
import type { ItemNameError } from '../domain/shopping-item';
import type { UnitId } from '../domain/units';
import type { PersistenceAction } from '../../../shared/errors/persistence-error';

export interface UnitLabel {
  readonly singular: string;
  readonly plural: string;
}

export interface ShoppingListMessages {
  readonly pageTitle: string;
  readonly loadingList: string;
  readonly tryAgain: string;
  readonly itemName: string;
  readonly addItem: string;
  readonly newNameFor: (name: string) => string;
  readonly save: string;
  readonly cancel: string;
  readonly editItem: (name: string) => string;
  readonly removeItem: (name: string) => string;
  readonly emptyList: string;
  readonly listLabel: string;
  readonly amount: (itemName?: string) => string;
  readonly unit: (itemName?: string) => string;
  readonly noUnit: string;
  readonly units: Readonly<Record<UnitId, UnitLabel>>;
  readonly itemNameErrors: Readonly<Record<ItemNameError, string>>;
  readonly quantityErrors: Readonly<Record<QuantityError, string>>;
  readonly storageFailures: Readonly<Record<PersistenceAction, string>>;
  readonly fallbackError: string;
  readonly dismissMessage: string;
  readonly clearCompleted: string;
  readonly clearCompletedDialog: {
    readonly title: string;
    readonly message: (count: number) => string;
    readonly cancel: string;
    readonly confirm: string;
  };
  readonly feedback: {
    readonly added: (name: string) => string;
    readonly completed: (name: string) => string;
    readonly reactivated: (name: string) => string;
    readonly removed: (name: string) => string;
    readonly updated: (name: string) => string;
    readonly renamed: (previousName: string, name: string) => string;
    readonly cleared: (count: number) => string;
  };
}
