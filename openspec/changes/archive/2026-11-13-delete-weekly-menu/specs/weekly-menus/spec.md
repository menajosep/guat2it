## ADDED Requirements

### Requirement: Delete a weekly menu

The system SHALL provide a delete control for each saved weekly menu. Before deletion it MUST show an accessible confirmation identifying the menu and explaining that its assignments will be removed while saved recipes remain. The system MUST require explicit confirmation; canceling or dismissing the prompt MUST NOT initiate deletion. Confirmation controls, messages and errors MUST be available in English, Spanish and Catalan.

After confirmation, the system MUST remove the identified menu and all of its assignments atomically. Saved recipes, other menus and their assignments MUST remain unchanged. A deleted menu MUST no longer appear in the list or reappear after reload. If the deleted menu is still active when deletion succeeds, the active selection MUST be cleared; a different active menu MUST remain selected. Storage failure MUST leave the menu and its assignments unchanged and be reported without claiming success. An already-missing menu MUST be reported without claiming a successful deletion.

#### Scenario: Confirm deletion of a populated menu

- **WHEN** the user confirms deletion of a menu containing recipe assignments
- **THEN** the menu and its assignments are removed, while saved recipes and assignments in other menus remain
- **AND** the deleted menu is absent after reload

#### Scenario: Cancel or dismiss deletion

- **WHEN** the user requests deletion and cancels or dismisses the confirmation
- **THEN** the menu, its assignments and the active selection remain unchanged

#### Scenario: Delete one of two identical menus

- **WHEN** two saved menus have the same name and start date and the user confirms deletion of one list entry
- **THEN** only that specific menu and its assignments are removed

#### Scenario: Delete the active menu

- **WHEN** the active menu is deleted successfully
- **THEN** no menu is active and Recipes requires the user to select a menu before adding another assignment

#### Scenario: Delete an inactive menu

- **WHEN** a menu is deleted successfully and a different menu is active when deletion completes
- **THEN** the different menu remains active

#### Scenario: Recipe deletion after menu deletion

- **WHEN** deleting a menu removes the last assignment of a recipe
- **THEN** that saved recipe is available for deletion under the existing recipe deletion rules

#### Scenario: Other assignments still protect a recipe

- **WHEN** a recipe remains assigned to a different menu after a menu is deleted
- **THEN** deleting the recipe remains blocked until its remaining assignments are removed

#### Scenario: Storage failure during deletion

- **WHEN** storage fails while deleting a confirmed menu or its assignments
- **THEN** the menu and its assignments remain intact, the active selection is not cleared, and an accessible error is shown

#### Scenario: Menu already missing

- **WHEN** the confirmed menu no longer exists when deletion is attempted
- **THEN** the user is informed that the menu is missing and no success is reported

#### Scenario: Assignment and deletion occur concurrently

- **WHEN** an assignment is added while its menu is being deleted
- **THEN** no assignment remains for a deleted menu, and an assignment attempted after deletion is reported as targeting a missing menu

#### Scenario: Localized confirmation

- **WHEN** the user changes the interface language while a deletion confirmation is open
- **THEN** the prompt and actions use the selected language without changing which menu is targeted
