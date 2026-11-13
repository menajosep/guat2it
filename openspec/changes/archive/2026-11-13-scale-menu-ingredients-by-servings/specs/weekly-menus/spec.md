## MODIFIED Requirements

### Requirement: Create a weekly menu

The system SHALL provide a form to create a named weekly menu with a valid calendar start date and a positive whole-number serving count no greater than 9007199254740991. The serving count MUST initially be blank and MUST be entered explicitly. The date MUST initially be the user's current local calendar date and MAY be any valid date. The default name MUST be a localized equivalent of `Weekly menu (YYYY-MM-DD)` using the selected date. Whenever the date changes, the default name MUST replace the current name, including a custom name, without changing the serving count. The user MUST be able to edit the name before saving. A language change alone MUST NOT discard typed values.

#### Scenario: Create using the default name

- **WHEN** the user selects `2026-11-16`, enters 2 servings and creates a menu in English without changing the generated name
- **THEN** a menu named `Weekly menu (2026-11-16)` with that start date and 2 servings is saved

#### Scenario: Create with a custom name

- **WHEN** the user selects a start date, enters a custom name and a valid serving count, and creates the menu
- **THEN** the saved menu has the custom name, selected date and serving count

#### Scenario: Changing the date resets the name

- **WHEN** the user changes the start date after typing a custom name and serving count
- **THEN** the name becomes the localized default for the newly selected date and the serving count is unchanged

#### Scenario: Preserve draft across language changes

- **WHEN** the user changes the interface language without changing the start date
- **THEN** the typed menu name, start date and serving count remain unchanged

#### Scenario: Invalid fields

- **WHEN** the user submits a blank name, a name longer than 100 characters, a missing or invalid calendar date, or a blank, non-integer, nonpositive or out-of-range serving count
- **THEN** no menu is created and an accessible error identifies each invalid field

## ADDED Requirements

### Requirement: Manage saved menu serving counts

The system SHALL display each saved menu's serving count and allow the user to edit it to a valid positive whole number no greater than 9007199254740991. The saved value MUST persist across reloads and apply to subsequent transfers of that menu. Editing MUST preserve the menu's identity, name, start date and assignments. A failed or invalid edit MUST leave the saved menu unchanged, preserve the entered draft, and show an accessible error without claiming success. The controls and feedback MUST be available in English, Spanish and Catalan. A language change alone MUST NOT discard an edit draft. If the menu no longer exists, saving MUST report the missing menu and MUST NOT recreate it.

#### Scenario: Edit a serving count

- **WHEN** a user changes a saved menu from 2 to 4 servings and reloads the application
- **THEN** that menu shows 4 servings and keeps its other details and assignments

#### Scenario: Invalid or failed edit

- **WHEN** the user submits an invalid serving count or storage fails while saving a valid edit
- **THEN** the previously saved count remains unchanged and the draft and an accessible error are shown

#### Scenario: Deleted menu during editing

- **WHEN** a menu is deleted before its serving-count edit is saved
- **THEN** the edit reports that the menu is missing and does not recreate it

### Requirement: Preserve existing menus without inventing serving counts

The system SHALL preserve menus created before serving counts were introduced, along with their assignments and all other local data. A menu whose serving count is unknown MUST be identified as needing a count, remain usable for other menu operations, and require the user to save a valid count before transferring its assigned ingredients. The system MUST NOT infer a count from a recipe yield or silently assign a default. An empty menu MUST retain the existing no-ingredients transfer behavior.

#### Scenario: Upgrade an existing menu

- **WHEN** an existing installation is upgraded and opens a previously saved menu
- **THEN** the menu and its assignments remain available and its serving count is identified as needing a value

#### Scenario: Transfer an existing menu

- **WHEN** a user requests transfer of a menu with assignments but no saved serving count
- **THEN** the system requests a valid serving count and does not write shopping items until that count is saved and a transfer is reviewed and confirmed

#### Scenario: Empty existing menu

- **WHEN** a menu without a serving count has no assignments and the user requests a transfer
- **THEN** the system reports that there are no ingredients to transfer and makes no shopping-list changes
