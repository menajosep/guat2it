## ADDED Requirements

### Requirement: Manage categories

The system SHALL let the user create, rename and delete categories. Category names SHALL be trimmed, contain 1–100 characters and be unique ignoring case. Invalid or duplicate names MUST leave stored categories unchanged and show an accessible validation message.

#### Scenario: Create a category

- **WHEN** the user creates the category " Butchery "
- **THEN** a category named "Butchery" is available for assignment

#### Scenario: Invalid category name

- **WHEN** the user submits a blank name or a name longer than 100 characters
- **THEN** no category is created or renamed and an explanation is shown

#### Scenario: Duplicate category name

- **WHEN** the user creates or renames a category to a name already used by another category, ignoring case
- **THEN** the change is rejected with an explanation

#### Scenario: Rename a category

- **WHEN** the user renames a category that is assigned to items
- **THEN** the new name is shown for that category and its item assignments remain intact

#### Scenario: Delete an unused category

- **WHEN** the user deletes a category that is not assigned to any item
- **THEN** the category is removed and is no longer available for assignment

#### Scenario: Delete a category in use

- **WHEN** the user attempts to delete a category assigned to an active or completed item
- **THEN** the category and items remain unchanged and the user is told to remove the assignments first

### Requirement: Assign categories to items

The system SHALL allow zero or more distinct categories to be selected when adding or editing an item. Editing the item's other details MUST retain its category assignments unless the user changes them. Assignment changes MUST retain the item's other details.

#### Scenario: Add an item to multiple categories

- **WHEN** the user adds an item with two categories selected
- **THEN** the item is assigned to both categories

#### Scenario: Edit assignments

- **WHEN** the user changes the categories on an existing item and saves
- **THEN** the saved assignments match the selection and the item's name, quantity, completion state and creation time are preserved

#### Scenario: Remove all assignments

- **WHEN** the user clears all categories from an item and saves
- **THEN** the item is uncategorized

#### Scenario: Cancel editing

- **WHEN** the user changes the selection and cancels editing
- **THEN** the stored assignments remain unchanged

#### Scenario: Category no longer exists

- **WHEN** a selected category is deleted before the item is saved
- **THEN** the save is rejected with an explanation and no invalid assignment is stored

### Requirement: Accessible localized category controls

The system SHALL provide accessible names for category management and assignment controls, accessible validation errors, and localized interface text in English, Spanish and Catalan. User-entered category names MUST NOT be translated.

#### Scenario: Change interface language

- **WHEN** the user changes interface language
- **THEN** category controls and messages use that language while category names remain unchanged
