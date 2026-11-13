import { fail, ok, type Result } from '../../../shared/types/result';
import {
  createWeeklyMenu,
  parseServings,
  type WeeklyMenu,
  type WeeklyMenuDraft,
  type WeeklyMenuErrors,
} from '../domain/weekly-menu';
import type { WeeklyMenuStore } from './weekly-menu-store';
import type { MenuAssignmentService } from './menu-assignment-service';
import type { MenuTransferService } from './menu-transfer-service';

export class WeeklyMenuService {
  constructor(
    private readonly store: WeeklyMenuStore,
    private readonly generateId: () => string,
    readonly assignments: MenuAssignmentService,
    readonly transfer: MenuTransferService,
  ) {}

  list(): Promise<WeeklyMenu[]> {
    return this.store.list();
  }

  async remove(id: string): Promise<Result<void, 'not-found'>> {
    return (await this.store.remove(id)) ? ok(undefined) : fail('not-found');
  }

  async create(draft: WeeklyMenuDraft): Promise<Result<WeeklyMenu, WeeklyMenuErrors>> {
    const menu = createWeeklyMenu(draft, this.generateId());
    if (!menu.ok) return menu;
    await this.store.save(menu.value);
    return menu;
  }

  async updateServings(
    id: string,
    draft: string,
  ): Promise<Result<WeeklyMenu, 'not-found' | 'invalid'>> {
    const servings = parseServings(draft);
    if (!servings.ok) return servings;
    const menu = await this.store.updateServings(id, servings.value);
    return menu ? ok(menu) : fail('not-found');
  }
}
