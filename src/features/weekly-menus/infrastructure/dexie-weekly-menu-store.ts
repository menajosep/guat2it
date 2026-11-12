import type { AppDatabase } from '../../../infrastructure/persistence/app-database';
import { PersistenceError, type PersistenceAction } from '../../../shared/errors/persistence-error';
import type { WeeklyMenuStore } from '../application/weekly-menu-store';
import type { WeeklyMenu } from '../domain/weekly-menu';

async function guard<T>(action: PersistenceAction, operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    throw new PersistenceError('Could not access weekly menus because local storage failed.', {
      cause: error,
      action,
    });
  }
}

export class DexieWeeklyMenuStore implements WeeklyMenuStore {
  constructor(private readonly db: AppDatabase) {}

  list(): Promise<WeeklyMenu[]> {
    return guard('load-weekly-menus', () => this.db.weeklyMenus.toArray());
  }

  save(menu: WeeklyMenu): Promise<void> {
    return guard('save-weekly-menu', async () => {
      await this.db.weeklyMenus.add(menu);
    });
  }
}
