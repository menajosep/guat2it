## ADDED Requirements

### Requirement: Edit a saved recipe

The system SHALL allow a user to edit a saved recipe from its detail view. The edit form MUST be prefilled with its saved title, yield, ordered ingredients, instructions, and picture URL. The user MUST be able to modify those fields and add or remove ingredients. Saving MUST apply the existing recipe and ingredient validation rules, including a nonempty title, positive yield, at least one valid ingredient, nonempty instructions, and a valid HTTPS picture URL. A successful update MUST atomically replace the saved values without changing the recipe identity or source URL, and the updated recipe MUST remain available after reload or restart. Canceling MUST leave the saved recipe unchanged.

#### Scenario: Edit and save

- **WHEN** a user opens a saved recipe, changes its title, yield, ingredients, instructions, and picture URL, and saves valid values
- **THEN** the detail and recipe list show the updated recipe, its identity and source URL are unchanged, and the updated values persist after reload

#### Scenario: Add and remove ingredients

- **WHEN** a user adds an ingredient and removes another before saving a valid edit
- **THEN** the saved recipe contains the resulting ingredients in their displayed order

#### Scenario: Cancel editing

- **WHEN** a user changes recipe fields and cancels editing
- **THEN** the detail view shows the original saved values and they remain unchanged after reload

#### Scenario: Invalid edit

- **WHEN** a user attempts to save an edit with invalid required fields or ingredient details, including no ingredients
- **THEN** the affected fields are identified, the draft remains available for correction, and the stored recipe remains unchanged

### Requirement: Explicit and localized recipe update failures

Edit controls, accessible names, validation, and error messages SHALL be available in English, Spanish, and Catalan and follow the selected language without changing draft content. A failed update MUST announce an accessible error, retain the draft, and MUST NOT claim that the recipe was saved. If the recipe no longer exists when an update is attempted, the system MUST report that it is missing and MUST NOT create it again.

#### Scenario: Storage failure during update

- **WHEN** local storage fails while saving an edit
- **THEN** an accessible error is shown, the draft remains available for retry, and the app does not report the edit as saved

#### Scenario: Recipe missing during update

- **WHEN** the saved recipe has been removed before an edit is saved
- **THEN** an accessible missing-recipe error is shown, the draft remains available, and no recipe is recreated

#### Scenario: Change language while editing

- **WHEN** the user changes the interface language while editing a recipe
- **THEN** controls and messages change language without changing the edit draft
