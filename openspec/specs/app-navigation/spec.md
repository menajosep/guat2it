# app-navigation Specification

## Purpose
TBD - created by archiving change add-app-menu. Update Purpose after archive.
## Requirements
### Requirement: Navigate with a side menu

The system SHALL provide a toolbar control that opens a side menu with Shopping List, Recipes, Weekly menus and Admin destinations. The menu and its controls MUST have accessible names and work on narrow mobile screens and wide screens. Selecting a destination MUST show that screen and close the menu.

#### Scenario: Open and navigate to Admin

- **WHEN** the user opens the menu and selects Admin
- **THEN** the Admin screen is shown and the menu closes

#### Scenario: Return to shopping list

- **WHEN** the user opens the menu on Admin and selects Shopping List
- **THEN** the shopping-list screen is shown and the menu closes

#### Scenario: Navigate to Recipes

- **WHEN** the user opens the menu and selects Recipes
- **THEN** the recipe list is shown and the menu closes

#### Scenario: Navigate to Weekly menus

- **WHEN** the user opens the menu and selects Weekly menus
- **THEN** the weekly-menu creation form and saved menu list are shown and the menu closes

#### Scenario: Dismiss without navigation

- **WHEN** the user dismisses the open menu without selecting a destination
- **THEN** the current screen remains displayed

### Requirement: Administer categories

The Admin screen SHALL make the existing category creation, renaming and deletion controls available without a login or password. Those management controls MUST NOT be shown on the shopping-list screen; item category selection and grouped display MUST remain available there.

#### Scenario: Create a category in Admin

- **WHEN** the user creates a category in Admin and returns to the shopping list
- **THEN** the category is available when adding and editing items

#### Scenario: Rename a category in Admin

- **WHEN** the user renames a category in Admin and returns to the shopping list
- **THEN** its new name is shown while existing item assignments remain intact

#### Scenario: Delete an in-use category

- **WHEN** the user attempts to delete a category assigned to an item
- **THEN** the category remains and the existing in-use error is shown

#### Scenario: Category loading failure

- **WHEN** categories cannot be loaded on Admin
- **THEN** the user sees an error and can retry

### Requirement: Localized navigation

The system SHALL provide menu labels, accessible names and the Admin, Recipes and Weekly menus screens in English, Spanish and Catalan. The language selector SHALL be available on all four screens and a language change MUST immediately update visible navigation and page text.

#### Scenario: Change language in Admin

- **WHEN** the user changes language on Admin and opens the menu
- **THEN** the Admin screen and menu use the selected language without translating category names

#### Scenario: Change language in Recipes

- **WHEN** the user changes language on Recipes and opens the menu
- **THEN** the Recipes screen and menu use the selected language without translating recipe content

#### Scenario: Change language in Weekly menus

- **WHEN** the user changes language on Weekly menus and opens the menu
- **THEN** the page and menu use the selected language without translating saved menu names

