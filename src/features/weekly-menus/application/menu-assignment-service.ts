import { fail, type Result } from '../../../shared/types/result';
import {
  validateSlot,
  type AssignedRecipe,
  type AssignmentError,
  type MenuAssignment,
} from '../domain/menu-assignment';
import type { MenuAssignmentStore } from './menu-assignment-store';

export class MenuAssignmentService {
  constructor(private readonly store: MenuAssignmentStore) {}

  add(
    menuId: string,
    recipeId: string,
    dayOffset: number,
    meal: string,
  ): Promise<Result<AssignedRecipe[], AssignmentError>> {
    const validated = validateSlot(dayOffset, meal);
    if (!validated.ok) return Promise.resolve(fail(validated.error));
    return this.store.add({ menuId, recipeId, dayOffset, meal: validated.value });
  }

  list(menuId: string): Promise<Result<AssignedRecipe[], 'menu-not-found'>> {
    return this.store.list(menuId);
  }

  remove(assignment: MenuAssignment): Promise<Result<void, 'not-found'>> {
    return this.store.remove(assignment);
  }
}
