import type { ShoppingItem } from '../../shopping-list/domain/shopping-item';
import type { TransferSnapshot } from '../domain/menu-transfer';
import type { Result } from '../../../shared/types/result';

export type TransferReadError =
  'menu-not-found' | 'recipe-not-found' | 'servings-required' | 'invalid-recipe-yield';
export type TransferCommitError = TransferReadError | 'stale';

export interface TransferWrite {
  readonly items: readonly ShoppingItem[];
  readonly removeIds: readonly string[];
}

export interface MenuTransferStore {
  read(menuId: string): Promise<Result<TransferSnapshot, TransferReadError>>;
  commit(
    snapshot: TransferSnapshot,
    write: TransferWrite,
  ): Promise<Result<void, TransferCommitError>>;
}
