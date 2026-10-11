## ADDED Requirements

### Requirement: Add an item

The system SHALL let the user add an item to the shopping list by entering a name and submitting the form. Names are trimmed of surrounding whitespace and MUST contain between 1 and 100 characters after trimming.

#### Scenario: Adding a valid item

- **WHEN** the user enters "Milk" and submits the form
- **THEN** "Milk" appears in the list as active and the name field is cleared

#### Scenario: Surrounding whitespace

- **WHEN** the user enters " Eggs " and submits the form
- **THEN** the item is added with the name "Eggs"

#### Scenario: Blank name

- **WHEN** the user submits the form with an empty or whitespace-only name
- **THEN** no item is added and the message "Enter an item name." is announced to the user

#### Scenario: Name too long

- **WHEN** the user submits a name longer than 100 characters
- **THEN** no item is added and a message states that names can have at most 100 characters

#### Scenario: Feedback is cleared

- **WHEN** the user submits a valid name after a validation message was shown
- **THEN** the validation message is no longer displayed

### Requirement: View the list

The system SHALL show every item with its name and completion state, in the order the items were created.

#### Scenario: Empty list

- **WHEN** the list contains no items
- **THEN** a message explains that the list is empty and invites the user to add an item

#### Scenario: Items in creation order

- **WHEN** the user adds "Milk" and then "Bread"
- **THEN** "Milk" is listed before "Bread"

### Requirement: Complete and reactivate an item

The system SHALL let the user mark an item as completed and mark a completed item as active again. Completed items MUST be visually distinguishable from active items.

#### Scenario: Completing an item

- **WHEN** the user checks the checkbox of an active item
- **THEN** the item is shown as completed

#### Scenario: Reactivating an item

- **WHEN** the user unchecks the checkbox of a completed item
- **THEN** the item is shown as active

### Requirement: Remove an item

The system SHALL let the user remove any item from the list through a control labelled with the item name.

#### Scenario: Removing an item

- **WHEN** the user activates "Remove Milk"
- **THEN** "Milk" is no longer in the list

#### Scenario: Removing the last item

- **WHEN** the user removes the only item
- **THEN** the empty-list message is shown
