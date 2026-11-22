## ADDED Requirements

### Requirement: Create a recipe manually

The system SHALL offer manual recipe creation on Android, iOS and web independently of website import. The user MUST be able to enter a title, positive yield, ordered ingredients and instructions, select an optional category and labels, and add or remove ingredients before saving. Each ingredient MUST follow the existing shopping-list name and quantity rules. A manual recipe MUST NOT require a website source or picture; a supplied picture URL MUST be a valid HTTPS URL. The user MUST be able to cancel without saving. Saving MUST validate the complete draft and atomically create the recipe locally.

#### Scenario: Create without a website or picture

- **WHEN** a user enters a title, positive yield, at least one valid ingredient and instructions, leaves the optional picture empty and saves
- **THEN** the recipe is saved without a website source or picture and appears in the recipe list

#### Scenario: Manage manual ingredients

- **WHEN** a user adds ingredients, removes an ingredient and saves the valid draft
- **THEN** the remaining ingredients are saved in their displayed order with their entered names and quantities

#### Scenario: Reject invalid details

- **WHEN** the user submits a draft with a missing title, nonpositive or invalid yield, no ingredients, invalid ingredient, missing instructions or a supplied invalid picture URL
- **THEN** the affected fields are identified, the draft remains available for correction and no recipe is created

#### Scenario: Cancel manual creation

- **WHEN** the user cancels manual entry
- **THEN** no recipe is saved

#### Scenario: Manual save fails

- **WHEN** local storage fails while saving a manual recipe
- **THEN** an accessible error is shown, the draft remains available for retry and the app does not claim that it was saved

#### Scenario: Use a saved manual recipe

- **WHEN** the user reloads the app and opens a manually created recipe without a picture
- **THEN** its saved details remain available with an accessible picture fallback and it can be assigned to a weekly menu

#### Scenario: Localized manual entry

- **WHEN** the interface language changes while the user is entering a manual recipe
- **THEN** controls and validation messages follow the selected language without changing draft content

## MODIFIED Requirements

### Requirement: Edit a saved recipe

The system SHALL allow a user to edit a saved recipe from its detail view. The edit form MUST be prefilled with its saved title, yield, ordered ingredients, instructions, and picture URL when present. The user MUST be able to modify those fields and add or remove ingredients. Saving MUST apply the existing recipe and ingredient validation rules, including a nonempty title, positive yield, at least one valid ingredient and nonempty instructions. A website-imported recipe MUST retain a valid HTTPS picture URL; a manually created recipe MAY omit its picture URL but MUST use a valid HTTPS URL if one is supplied. A successful update MUST atomically replace the saved values without changing the recipe identity or source URL, and the updated recipe MUST remain available after reload or restart. Canceling MUST leave the saved recipe unchanged.

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

#### Scenario: Edit a manual recipe without a picture

- **WHEN** a user edits and saves a valid manually created recipe with an empty picture URL
- **THEN** the updated recipe remains available after reload without a source or picture URL

#### Scenario: Picture validation remains source-aware

- **WHEN** a user saves an edit with an invalid supplied picture URL, or removes the picture URL from a website-imported recipe
- **THEN** the picture field is identified as invalid and the stored recipe remains unchanged
