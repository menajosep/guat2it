import { fail, ok, type Result } from '../../../shared/types/result';
import {
  groupTransfer,
  resolveTransferQuantity,
  transferItem,
  type TransferChoice,
  type TransferQuantityError,
  type TransferSnapshot,
} from '../domain/menu-transfer';
import type {
  MenuTransferStore,
  TransferCommitError,
  TransferReadError,
} from './menu-transfer-store';

export type TransferError =
  TransferCommitError | { readonly group: string; readonly error: TransferQuantityError };

export class MenuTransferService {
  constructor(
    private readonly store: MenuTransferStore,
    private readonly generateId: () => string,
    private readonly now: () => Date,
  ) {}

  review(menuId: string): Promise<Result<TransferSnapshot, TransferReadError>> {
    return this.store.read(menuId);
  }

  async commit(
    snapshot: TransferSnapshot,
    choices: ReadonlyMap<string, TransferChoice>,
  ): Promise<Result<number, TransferError>> {
    const groups = groupTransfer(snapshot);
    const items = [];
    const removeIds: string[] = [];
    for (const group of groups) {
      const quantity = resolveTransferQuantity(group, choices.get(group.key) ?? {});
      if (!quantity.ok) return fail({ group: group.key, error: quantity.error });
      items.push(transferItem(group, quantity.value, this.generateId(), this.now()));
      removeIds.push(...group.items.slice(1).map((item) => item.id));
    }
    if (groups.length === 0) return ok(0);
    const result = await this.store.commit(snapshot, { items, removeIds });
    return result.ok ? ok(groups.length) : result;
  }
}
