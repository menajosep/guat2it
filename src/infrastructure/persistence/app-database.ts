import Dexie, { type EntityTable } from 'dexie';
import type { ShoppingItem } from '../../features/shopping-list/domain/shopping-item';
import type { Category } from '../../features/shopping-list/domain/category';
import type { Recipe } from '../../features/recipes/domain/recipe';

export const DATABASE_NAME = 'guat2it';

export class AppDatabase extends Dexie {
  shoppingItems!: EntityTable<ShoppingItem, 'id'>;
  categories!: EntityTable<Category, 'id'>;
  recipes!: EntityTable<Recipe, 'id'>;

  constructor(name: string = DATABASE_NAME) {
    super(name);
    this.version(1).stores({
      shoppingItems: 'id, createdAt',
    });
    this.version(2).stores({
      shoppingItems: 'id, createdAt',
      categories: 'id',
    });
    this.version(3).stores({
      shoppingItems: 'id, createdAt',
      categories: 'id',
      recipes: 'id',
    });
  }
}
