## ADDED Requirements

### Requirement: Optional recipe course category

The system SHALL offer exactly these ten primary course categories: Breakfast & Brunch, Appetizers & Snacks, Soups & Stews, Salads, Main Courses, Side Dishes, Breads & Baked Goods, Desserts, Sauces & Condiments, and Beverages. A recipe SHALL have at most one category and MAY be uncategorized. The import review and saved-recipe edit forms SHALL provide an accessible single-selection control to select, change, or clear the category. Imported recipes SHALL initially be uncategorized. The system MUST reject an invalid category value without saving it.

#### Scenario: Categorize an imported recipe

- **WHEN** the user selects Desserts while reviewing a valid imported recipe and saves it
- **THEN** the saved recipe has Desserts as its category

#### Scenario: Save without a category

- **WHEN** the user saves a valid imported recipe without selecting a category
- **THEN** the recipe is saved as uncategorized

#### Scenario: Change or clear a category

- **WHEN** the user edits a saved recipe and changes its category or selects uncategorized, then saves
- **THEN** the saved recipe has the newly chosen category or no category respectively

#### Scenario: Cancel an edit

- **WHEN** a category edit is canceled
- **THEN** the saved category remains unchanged

#### Scenario: Invalid category

- **WHEN** a recipe draft contains a category outside the supported choices and the user attempts to save it
- **THEN** the category is identified as invalid and the recipe is not saved

### Requirement: Browse recipes by course category

The recipes page SHALL provide an accessible single-selection filter for all recipes, each of the ten categories, and uncategorized recipes. All recipes SHALL be selected initially. A category filter MUST show only recipes assigned to that category, and the uncategorized filter MUST show only recipes with no category. Filtering MUST preserve the order and existing actions of matching entries. The current filter SHALL remain selected when returning from a recipe or refreshing the list after a recipe operation. If the library is nonempty but the selected filter has no matches, the system SHALL show a distinct no-matches message; an empty library SHALL continue to show its existing empty state.

#### Scenario: Filter by category

- **WHEN** the user selects Soups & Stews
- **THEN** only recipes assigned to Soups & Stews are shown in their existing order

#### Scenario: Browse uncategorized recipes

- **WHEN** the user selects uncategorized
- **THEN** only recipes without a category are shown

#### Scenario: Return to all recipes

- **WHEN** the user selects all recipes after applying a category filter
- **THEN** every saved recipe is shown

#### Scenario: No matching recipes

- **WHEN** the library contains recipes but none match the chosen filter
- **THEN** a no-matches message is shown and the user can choose another filter

#### Scenario: Navigate and update while filtered

- **WHEN** the user opens a matching recipe, changes its category, saves, and returns to the list
- **THEN** the original filter remains selected and the list reflects the updated category

### Requirement: Persist and display recipe categories

The system SHALL persist the selected category locally with the recipe and display its category or uncategorized state in recipe details. Existing recipes saved before categories were introduced MUST remain available with all their existing details and menu assignments intact and SHALL be treated as uncategorized. A category change MUST survive reload. A failed category save MUST be reported without presenting the change as saved.

#### Scenario: Upgrade existing recipes

- **WHEN** an installation with previously saved recipes and menu assignments is upgraded
- **THEN** those recipes and assignments remain intact and the recipes are uncategorized until edited

#### Scenario: Reload a categorized recipe

- **WHEN** the user saves a category and reloads the app
- **THEN** the recipe detail and category filter reflect the saved category

#### Scenario: Category update fails

- **WHEN** local storage fails while saving a category change
- **THEN** an error is shown and the last successfully saved category remains in effect

### Requirement: Localized recipe category controls

Category labels, the uncategorized and all-recipes choices, the filter label, no-matches message, and category validation messages SHALL be available in English, Spanish, and Catalan. Changing the UI language MUST update visible category labels without changing the saved category, current filter, or unsaved form selection.

#### Scenario: Switch language

- **WHEN** the user switches the UI language while a category filter or form selection is active
- **THEN** the labels change to the selected language and the filter, form selection, and stored category remain unchanged
