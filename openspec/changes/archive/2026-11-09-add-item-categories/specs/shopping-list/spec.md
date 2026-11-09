## MODIFIED Requirements

### Requirement: View the list

The system SHALL show every item with its name and completion state, grouped by assigned category. An item assigned to multiple categories MUST appear in each of those groups; an item with no category MUST appear in an uncategorized group. Category groups SHALL be ordered by name and items within each group SHALL be in creation order. The uncategorized group SHALL follow category groups.

#### Scenario: Empty list

- **WHEN** the list contains no items
- **THEN** a message explains that the list is empty and invites the user to add an item

#### Scenario: Items in creation order

- **WHEN** the user adds "Milk" and then "Bread" to the same category
- **THEN** "Milk" is listed before "Bread" in that group

#### Scenario: Multiple categories

- **WHEN** an item is assigned to two categories
- **THEN** it appears once in each corresponding category group

#### Scenario: Uncategorized item

- **WHEN** an item has no category
- **THEN** it appears in the uncategorized group

#### Scenario: Interact with a repeated item

- **WHEN** the user completes, edits or removes an item in one category group
- **THEN** all appearances reflect the same saved item or its removal

#### Scenario: Clear completed repeated items

- **WHEN** the user clears completed items
- **THEN** the confirmation count and removal count each item once even if it appears in multiple groups
