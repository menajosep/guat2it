## MODIFIED Requirements

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
