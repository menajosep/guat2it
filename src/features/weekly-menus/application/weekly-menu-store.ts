import type { WeeklyMenu } from '../domain/weekly-menu';

export interface WeeklyMenuStore {
  list(): Promise<WeeklyMenu[]>;
  save(menu: WeeklyMenu): Promise<void>;
}
