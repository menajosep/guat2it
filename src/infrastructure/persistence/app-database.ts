import Dexie, { type EntityTable } from 'dexie';
import type { ShoppingItem } from '../../features/shopping-list/domain/shopping-item';

export const DATABASE_NAME = 'guat2it';

export class AppDatabase extends Dexie {
  shoppingItems!: EntityTable<ShoppingItem, 'id'>;

  constructor(name: string = DATABASE_NAME) {
    super(name);
    this.version(1).stores({
      shoppingItems: 'id, createdAt',
    });
  }
}
