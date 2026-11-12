import type { Result } from '../../../shared/types/result';
import {
  createWeeklyMenu,
  type WeeklyMenu,
  type WeeklyMenuDraft,
  type WeeklyMenuErrors,
} from '../domain/weekly-menu';
import type { WeeklyMenuStore } from './weekly-menu-store';
import type { MenuAssignmentService } from './menu-assignment-service';

export class WeeklyMenuService {
  constructor(
    private readonly store: WeeklyMenuStore,
    private readonly generateId: () => string,
    readonly assignments: MenuAssignmentService,
  ) {}

  list(): Promise<WeeklyMenu[]> {
    return this.store.list();
  }

  async create(draft: WeeklyMenuDraft): Promise<Result<WeeklyMenu, WeeklyMenuErrors>> {
    const menu = createWeeklyMenu(draft, this.generateId());
    if (!menu.ok) return menu;
    await this.store.save(menu.value);
    return menu;
  }
}
