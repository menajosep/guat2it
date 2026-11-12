## ADDED Requirements

### Requirement: Add a saved recipe to a selected menu

The system SHALL let a user start adding a saved recipe from Recipes to the active weekly menu and select a day and meal as specified by weekly-menu planning. If no menu is active, the system MUST explain how to select one and MUST NOT save an assignment.

#### Scenario: Add from Recipes

- **WHEN** a user selects a weekly menu, opens a saved recipe and chooses to add it
- **THEN** the user can choose one of the selected menu's seven days and lunch or dinner

#### Scenario: Recipe has no active menu

- **WHEN** the user tries to add a recipe without selecting a weekly menu
- **THEN** the user is informed that a menu must first be selected and nothing is saved

## MODIFIED Requirements

### Requirement: View and persist recipes locally

The system SHALL list saved recipes and let the user open a recipe to view its title, yield, ingredients, instructions and picture. Recipes MUST survive reload or restart and remain local to the installation. Unavailable pictures MUST have an accessible fallback without hiding the rest of the recipe. A database upgrade MUST preserve existing shopping items and categories. The user MUST be able to request deletion of a saved recipe from its detail view, and the system MUST require explicit confirmation before deleting it. Canceling confirmation MUST leave the recipe unchanged. After confirmed deletion succeeds, the recipe MUST no longer appear in the saved recipe list. If deletion fails, the system MUST announce an accessible error and MUST NOT claim that the recipe was deleted. A recipe assigned to any weekly menu MUST NOT be deleted until all its assignments are removed; the system MUST explain the reason.

#### Scenario: Reopen a recipe

- **WHEN** a user saves a recipe and reloads the app
- **THEN** the recipe is listed and its saved details can be opened

#### Scenario: Picture unavailable

- **WHEN** the saved picture cannot be loaded
- **THEN** an accessible fallback is shown and the recipe's other details remain available

#### Scenario: Upgrade with existing data

- **WHEN** an installation with shopping items and categories upgrades
- **THEN** its existing data remains unchanged and recipes can be saved

#### Scenario: Confirm recipe deletion

- **WHEN** a user requests deletion of a saved recipe with no menu assignments and confirms the action
- **THEN** that recipe is removed from local storage and no longer appears in the recipe list

#### Scenario: Cancel recipe deletion

- **WHEN** a user requests deletion of a saved recipe and cancels confirmation
- **THEN** the recipe remains saved and available in its detail view

#### Scenario: Recipe deletion fails

- **WHEN** local storage fails while deleting a confirmed recipe
- **THEN** an accessible error is shown, the recipe remains available in the detail view, and the app does not report it as deleted

#### Scenario: Assigned recipe cannot be deleted

- **WHEN** the user confirms deletion of a recipe that is assigned to at least one menu
- **THEN** the recipe and all assignments remain unchanged and an accessible message explains that its assignments must be removed first

#### Scenario: Delete after removing all assignments

- **WHEN** the user removes every assignment of a recipe and confirms its deletion
- **THEN** the recipe is deleted and no longer appears in the recipe list

#### Scenario: Concurrent assignment and deletion

- **WHEN** adding a recipe to a menu and deleting the same recipe are attempted concurrently
- **THEN** the final state contains no assignment to a deleted recipe, and the unsuccessful operation reports the reason
