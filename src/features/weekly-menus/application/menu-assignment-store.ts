import type { Result } from '../../../shared/types/result';
import type { AssignedRecipe, AssignmentError, MenuAssignment } from '../domain/menu-assignment';

export interface MenuAssignmentStore {
  add(assignment: MenuAssignment): Promise<Result<AssignedRecipe[], AssignmentError>>;
  list(menuId: string): Promise<Result<AssignedRecipe[], 'menu-not-found'>>;
  remove(assignment: MenuAssignment): Promise<Result<void, 'not-found'>>;
}
