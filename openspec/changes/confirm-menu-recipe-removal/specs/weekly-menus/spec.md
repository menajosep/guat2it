## MODIFIED Requirements

### Requirement: Remove a recipe assignment

The system SHALL let the user remove an assigned recipe from a selected menu's day and meal. Before removing it, the system MUST show an accessible confirmation identifying the recipe, day and meal, and MUST require explicit confirmation. Canceling or dismissing the prompt MUST NOT initiate removal. The prompt and its actions MUST be available in English, Spanish and Catalan. Removing one assignment MUST NOT remove the recipe itself or its assignments in other slots or menus. A failed removal MUST retain the assignment and show an accessible error.

#### Scenario: Remove one assignment

- **WHEN** the user requests removal of a recipe from a day and meal and confirms the prompt
- **THEN** that slot no longer contains it, while the saved recipe and other assignments remain

#### Scenario: Cancel or dismiss removal

- **WHEN** the user requests removal and cancels or dismisses the prompt
- **THEN** the system does not remove the assignment

#### Scenario: Identify the selected assignment

- **WHEN** the same recipe appears in more than one day or meal and the user requests removal from one slot
- **THEN** the prompt identifies that recipe, the selected day and meal, and confirmation removes only that assignment

#### Scenario: Change menu or leave while confirmation is pending

- **WHEN** the user switches the selected menu or leaves the view before confirming
- **THEN** the pending confirmation is dismissed without initiating removal

#### Scenario: Removal fails

- **WHEN** storage fails while removing a confirmed assignment
- **THEN** the assignment remains visible and the user is informed

#### Scenario: Assignment no longer exists

- **WHEN** the assignment no longer exists when the user confirms its removal
- **THEN** the system reports that removal could not be completed and does not claim success

#### Scenario: Localized confirmation

- **WHEN** the user changes the interface language while a removal prompt is open
- **THEN** the prompt and its actions use the selected language without changing the targeted assignment
