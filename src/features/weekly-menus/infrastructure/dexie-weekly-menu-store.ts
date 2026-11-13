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

  updateServings(id: string, servings: number): Promise<WeeklyMenu | undefined> {
    return guard('save-weekly-menu', () =>
      this.db.transaction('rw', this.db.weeklyMenus, async () => {
        const menu = await this.db.weeklyMenus.get(id);
        if (!menu) return undefined;
        const updated = { ...menu, servings };
        await this.db.weeklyMenus.put(updated);
        return updated;
      }),
    );
  }

  remove(id: string): Promise<boolean> {
    return guard('remove-weekly-menu', () =>
      this.db.transaction('rw', this.db.weeklyMenus, this.db.menuAssignments, async () => {
        if (!(await this.db.weeklyMenus.get(id))) return false;
        await this.db.menuAssignments.where('menuId').equals(id).delete();
        await this.db.weeklyMenus.delete(id);
        return true;
      }),
    );
  }
}
