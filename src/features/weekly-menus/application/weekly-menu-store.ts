import type { WeeklyMenu } from '../domain/weekly-menu';

export interface WeeklyMenuStore {
  list(): Promise<WeeklyMenu[]>;
  save(menu: WeeklyMenu): Promise<void>;
  updateServings(id: string, servings: number): Promise<WeeklyMenu | undefined>;
  remove(id: string): Promise<boolean>;
}
