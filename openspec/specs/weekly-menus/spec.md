# weekly-menus Specification

## Purpose
TBD - created by archiving change create-weekly-menu. Update Purpose after archive.
## Requirements
### Requirement: Create a weekly menu

The system SHALL provide a form to create a named weekly menu with a valid calendar start date. The date MUST initially be the user's current local calendar date and MAY be any valid date. The default name MUST be a localized equivalent of `Weekly menu (YYYY-MM-DD)` using the selected date. Whenever the date changes, the default name MUST replace the current name, including a custom name. The user MUST be able to edit the name before saving. A language change alone MUST NOT discard typed values.

#### Scenario: Create using the default name

- **WHEN** the user selects `2026-11-16` and creates a menu in English without changing the generated name
- **THEN** a menu named `Weekly menu (2026-11-16)` with that start date is saved

#### Scenario: Create with a custom name

- **WHEN** the user selects a start date, enters a custom name and creates the menu
- **THEN** the saved menu has the custom name and selected date

#### Scenario: Changing the date resets the name

- **WHEN** the user changes the start date after typing a custom name
- **THEN** the name becomes the localized default for the newly selected date

#### Scenario: Preserve draft across language changes

- **WHEN** the user changes the interface language without changing the start date
- **THEN** the typed menu name and start date remain unchanged

#### Scenario: Invalid fields

- **WHEN** the user submits a blank name, a name longer than 100 characters, or a missing or invalid calendar date
- **THEN** no menu is created and an accessible error identifies each invalid field

### Requirement: List and persist weekly menus

The system SHALL list saved menu names and their start dates and retain them on the local installation after reload or restart. The system MUST allow multiple menus with the same start date. Upgrading an existing installation MUST preserve shopping items, categories and recipes. Menus MUST NOT be synchronized to other devices.

#### Scenario: Reopen saved menus

- **WHEN** a user creates a menu and reloads the app
- **THEN** the menu name and start date are still listed

#### Scenario: Duplicate start dates

- **WHEN** the user creates two valid menus with the same start date
- **THEN** both menus are saved and listed separately

#### Scenario: Upgrade preserves prior data

- **WHEN** an existing installation upgrades to support weekly menus
- **THEN** its shopping items, categories and recipes remain unchanged

### Requirement: Accessible localized menu controls and failures

The system SHALL provide weekly-menu controls, validation and storage errors in English, Spanish and Catalan. Failures to load or save MUST be reported without claiming unsaved data was saved. A load failure MUST offer a retry, and a save failure MUST retain the user's draft.

#### Scenario: Load fails

- **WHEN** loading menus fails
- **THEN** an accessible error and a retry action are shown

#### Scenario: Save fails

- **WHEN** saving a valid menu fails
- **THEN** an accessible error is shown, the entered values remain available and no success is reported

#### Scenario: Localized controls

- **WHEN** the user selects Spanish or Catalan
- **THEN** the page, controls and validation messages use the selected language without translating saved names

