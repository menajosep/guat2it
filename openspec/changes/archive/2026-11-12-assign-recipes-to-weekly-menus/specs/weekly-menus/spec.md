## ADDED Requirements

### Requirement: Select a weekly menu for planning

The system SHALL let the user select any saved weekly menu as the active menu for the current app session. The selected menu MUST remain selected while navigating between Weekly menus and Recipes, MUST be identifiable by name and start date, and MUST be replaceable by selecting another saved menu. Reloading or restarting the app MUST clear the selection without deleting saved menus or assignments.

#### Scenario: Select and change the active menu

- **WHEN** the user selects a saved menu, navigates to Recipes and later selects a different saved menu
- **THEN** Recipes identifies the currently selected menu and subsequent assignments target that menu

#### Scenario: Reload clears only the selection

- **WHEN** the user reloads after selecting a menu and saving an assignment
- **THEN** no menu is active until selected again, while the saved menu and assignment remain available

#### Scenario: Menus have identical names and dates

- **WHEN** the user selects one of multiple saved menus with the same name and start date
- **THEN** the selected list entry is indicated and assignments target that specific menu

### Requirement: Assign and view recipes by day and meal

The system SHALL let a user add a saved recipe to the active weekly menu by selecting one of the seven consecutive calendar days starting with the menu's start date and either lunch or dinner. A slot MAY contain multiple different recipes. The same recipe MUST NOT be added twice to the same menu, day and meal, but MAY be assigned to other slots or menus. The system MUST reject invalid days and meals without changing stored assignments. The system MUST retain assignments locally across reloads, preserve existing data on upgrade, and show each selected menu's saved recipes grouped by day and meal using their current saved titles. A failed slot load MUST be reported with a retry action rather than shown as an empty slot.

#### Scenario: Add a recipe

- **WHEN** the user selects a menu, chooses a saved recipe, selects a day in that menu's week and lunch or dinner, and saves
- **THEN** the recipe appears in that menu's selected day and meal and remains there after reload and reselection
- **AND** an accessible confirmation identifies the day and meal and shows the current recipes for that slot

#### Scenario: Several recipes in one slot

- **WHEN** the user adds two different recipes to the same day and meal
- **THEN** both recipes are shown in that slot

#### Scenario: Duplicate assignment

- **WHEN** the user attempts to add a recipe already present in the same menu, day and meal
- **THEN** the slot remains unchanged and an accessible message explains the duplicate

#### Scenario: Same recipe in another slot

- **WHEN** the user adds a recipe already assigned to a different day, meal or menu
- **THEN** the new assignment is saved without changing the existing one

#### Scenario: Concurrent duplicate attempts

- **WHEN** two attempts to add the same recipe to the same menu, day and meal occur concurrently
- **THEN** exactly one assignment exists and the unsuccessful attempt reports the duplicate

#### Scenario: Edited recipe

- **WHEN** the user changes the title of a recipe already assigned to a menu
- **THEN** its assignments remain and the menu displays its updated title

#### Scenario: Seven days follow the start date

- **WHEN** a menu starts on a Wednesday, including at a month or year boundary
- **THEN** its selectable days are the seven consecutive calendar days starting on that Wednesday

#### Scenario: No selected menu

- **WHEN** the user attempts to add a recipe without an active menu
- **THEN** no assignment is saved and the user is directed to select a menu

#### Scenario: Missing menu or recipe

- **WHEN** the selected menu or recipe no longer exists when an assignment is saved
- **THEN** no assignment is created and an accessible error identifies the missing item

#### Scenario: Invalid day or meal

- **WHEN** an assignment is submitted with a day outside the selected menu's week or an unsupported meal
- **THEN** no assignment is created and an accessible validation error is shown

#### Scenario: Failed assignment

- **WHEN** storage fails while adding a recipe
- **THEN** the slot remains unchanged, the selection remains available for retry, and no success is reported

#### Scenario: Failed slot load

- **WHEN** the system cannot load a menu's assignments or their recipes
- **THEN** it shows an accessible error and a retry action instead of presenting the slot as empty

#### Scenario: Confirmation after saving

- **WHEN** an assignment succeeds
- **THEN** its confirmation shows the recipes in the slot as of the successful save and does not depend on a later read that could misreport the saved assignment as failed

#### Scenario: Existing data survives the upgrade

- **WHEN** an installation with menus, recipes, categories and shopping items upgrades
- **THEN** all existing records remain unchanged and menus initially have no assigned recipes

### Requirement: Remove a recipe assignment

The system SHALL let the user remove an assigned recipe from a selected menu's day and meal. Removing one assignment MUST NOT remove the recipe itself or its assignments in other slots or menus. A failed removal MUST retain the assignment and show an accessible error.

#### Scenario: Remove one assignment

- **WHEN** the user removes a recipe from a day and meal
- **THEN** that slot no longer contains it, while the saved recipe and other assignments remain

#### Scenario: Removal fails

- **WHEN** storage fails while removing an assignment
- **THEN** the assignment remains visible and the user is informed

### Requirement: Localized planning controls

The system SHALL provide planning controls, day and meal labels, confirmations and errors in English, Spanish and Catalan. Changing the interface language MUST NOT translate saved menu names or recipe titles or discard the current assignment draft.

#### Scenario: Change language while planning

- **WHEN** the user changes language while selecting a day and meal
- **THEN** controls and messages use the new language while the selected menu, recipe, day and meal remain unchanged
