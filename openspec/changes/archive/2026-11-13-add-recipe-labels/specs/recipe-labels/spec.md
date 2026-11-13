## ADDED Requirements

### Requirement: Fixed recipe label taxonomy

The system SHALL offer exactly the following user-selectable recipe labels, grouped by facet:

- Main Ingredient: Beef, Pork, Poultry, Fish, Seafood, Eggs, Tofu/Tempeh, Legumes, Pasta/Noodles, Rice/Grains, Vegetables.
- Cooking Method: Stovetop, Oven/Roast, Grill/BBQ, Slow Cooker, Pressure Cooker / Instant Pot, Air Fryer, No-Cook, Sous Vide.
- Dietary & Allergens: Vegetarian, Vegan, Gluten-Free, Dairy-Free, Nut-Free, Low-Carb/Keto, High-Protein.
- Cuisine / Region: Mediterranean, Italian, Mexican, Japanese, Chinese, Indian, Thai, French, Middle Eastern, American.
- Meal Occasion / Effort: Weeknight / Quick (less than 30 min), Meal Prep / Freezable, One-Pot, Entertaining / Holiday, Kid-Friendly.

A recipe SHALL support any number of distinct labels across and within facets, including none. Labels SHALL be separate from the recipe's course category and shopping-list categories. The system MUST reject unsupported or duplicate label identifiers when saving a draft and identify the error without saving the invalid draft.

#### Scenario: Select multiple values

- **WHEN** a user selects Poultry and Vegetables from Main Ingredient and Oven/Roast from Cooking Method for a valid recipe
- **THEN** all three distinct labels are saved with the recipe

#### Scenario: Invalid label values

- **WHEN** a draft contains an unsupported or duplicate label identifier and the user attempts to save it
- **THEN** the system identifies the labels as invalid and does not save the draft

### Requirement: Assign and view recipe labels

The import review and saved-recipe edit forms SHALL provide accessible controls grouped by facet to select and remove labels. Imported drafts SHALL initially have no labels, regardless of source metadata. Recipe details SHALL show selected labels grouped by facet, or an unlabeled state when none are selected. The interface MUST communicate that dietary and allergen labels are user-assigned and not verified safety claims.

#### Scenario: Label an imported recipe

- **WHEN** a user selects labels in import review and saves a valid recipe
- **THEN** the saved recipe details show those labels

#### Scenario: Change labels on a saved recipe

- **WHEN** a user adds and removes labels in a saved recipe's edit form and saves
- **THEN** its details show the resulting labels and its other fields remain unchanged

#### Scenario: Cancel label editing

- **WHEN** a user changes labels and cancels editing
- **THEN** the previously saved labels remain unchanged

#### Scenario: Unlabeled import

- **WHEN** a user reviews an imported recipe before selecting labels
- **THEN** no labels are selected, even if the source contains classification metadata

### Requirement: Filter recipes by labels

The recipes page SHALL let users select multiple label values in each facet and clear all label selections. With no values selected in a facet, that facet MUST impose no restriction. With values selected within a facet, a recipe MUST match at least one of those values. A recipe MUST match every active facet and the existing course-category filter to appear. With no label values selected, the label filter MUST include every recipe, including unlabeled ones. Filtering MUST preserve the order and existing actions of matching recipes.

#### Scenario: Combine labels within and across facets

- **WHEN** the user selects Beef and Poultry in Main Ingredient and Oven/Roast in Cooking Method
- **THEN** only recipes labeled Oven/Roast and at least one of Beef or Poultry appear

#### Scenario: Combine course category and label filters

- **WHEN** the user selects the Main Courses course category and the Vegetarian label
- **THEN** only Main Courses recipes labeled Vegetarian appear

#### Scenario: Clear label filters

- **WHEN** the user clears all label selections
- **THEN** all recipes matching the current course-category filter appear, including unlabeled recipes

#### Scenario: No combined matches

- **WHEN** the library is nonempty but no recipe matches the selected category and label filters
- **THEN** a distinct no-matches message is shown and the user can change or clear filters

#### Scenario: Return after editing

- **WHEN** a user opens a matching recipe, changes its labels, saves, and returns to the list
- **THEN** the selected filters remain active and the list reflects the updated labels

#### Scenario: Initialize and reload

- **WHEN** the recipes page is initialized, or its list is reloaded after a recipe operation
- **THEN** label filters start empty on initialization and remain selected across the operation's reload

### Requirement: Persist labels without losing existing data

The system SHALL persist selected labels locally using language-independent identifiers and preserve them across reload or restart. Existing recipes without labels SHALL remain available as unlabeled, with their other fields, course categories, and menu assignments intact. Failed label saves or updates MUST show an accessible error, retain the draft for retry, and MUST NOT report success.

#### Scenario: Existing recipe without labels

- **WHEN** an installation containing recipes and menu assignments from before this change is opened
- **THEN** the recipes and assignments remain intact and those recipes have no labels

#### Scenario: Reload selected labels

- **WHEN** a user saves labels and reloads the app
- **THEN** recipe details and filters reflect the saved labels

#### Scenario: Save fails

- **WHEN** local storage fails while saving a recipe label change
- **THEN** an accessible error is shown, the draft remains available, and the last saved recipe remains unchanged

### Requirement: Localized accessible label controls

All label facet names, values, controls, safety guidance, validation messages, and empty states SHALL be available in English, Spanish, and Catalan. Changing the interface language MUST change their displayed language without changing stored labels, unsaved selections, or active filters. Label controls MUST have accessible names, support keyboard and touch interaction, and remain usable without horizontal scrolling on narrow screens. Each facet's label controls in recipe forms and browsing filters SHALL be individually collapsible using an accessible disclosure control. Facets SHALL start collapsed, and a collapsed facet MUST indicate how many of its labels are selected. The recipes page SHALL provide an accessible disclosure for the entire filter section, including the course-category and label filters. The complete filter section SHALL start collapsed and its summary MUST indicate the number of active filters. Collapsing and expanding this section MUST preserve all filter selections.

#### Scenario: Change language with selections

- **WHEN** a user changes the interface language while a label filter or draft selection is active
- **THEN** labels and controls appear in the selected language and all selections and stored labels remain unchanged

#### Scenario: Use label controls on a narrow screen

- **WHEN** a user selects labels or filters using keyboard or touch on a narrow screen
- **THEN** every facet and option is accessible and usable without horizontal scrolling

#### Scenario: Expand and collapse a label facet

- **WHEN** a user opens a recipe form or the label filters
- **THEN** each facet is initially collapsed and its summary shows its localized name and selected-label count

#### Scenario: Change a collapsed facet selection

- **WHEN** a user expands a facet, changes one or more labels, and collapses it
- **THEN** the selections remain unchanged and the collapsed summary displays the updated count

#### Scenario: Collapse the complete filter section

- **WHEN** a user opens the recipes page
- **THEN** the complete filter section is collapsed and its summary shows that no filters are active

#### Scenario: Reopen active filters

- **WHEN** a user selects a course category and recipe labels, collapses the filter section, and opens it again
- **THEN** all selections remain active and the collapsed summary shows the active-filter count

#### Scenario: Complete translation coverage

- **WHEN** any supported label or facet lacks a translation in a supported language
- **THEN** automated checks fail
