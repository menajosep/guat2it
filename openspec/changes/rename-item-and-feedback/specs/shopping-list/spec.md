## ADDED Requirements

### Requirement: Rename an item

The system SHALL let the user rename any item in place through a control labelled with the item name. Activating the control MUST turn the item's row into a text field pre-filled with the current name, with controls to save and to cancel. The new name follows the same rules as adding an item: it is trimmed of surrounding whitespace and MUST contain between 1 and 100 characters after trimming. Renaming MUST replace the old name, and MUST keep the item's completion state and its position in the list.

#### Scenario: Starting an edit

- **WHEN** the user activates "Edit Milk"
- **THEN** the row of "Milk" shows a text field containing "Milk" with save and cancel controls, and the text field has focus

#### Scenario: Saving a valid name

- **WHEN** the user changes the name to "Oat milk" and saves
- **THEN** the item is listed as "Oat milk" in the same position, the row is no longer editable, and the old name is not listed

#### Scenario: Saving with the keyboard

- **WHEN** the user changes the name and presses Enter in the text field
- **THEN** the name is saved as if the save control had been activated

#### Scenario: Completion state is kept

- **WHEN** the user renames a completed item
- **THEN** the renamed item is still shown as completed

#### Scenario: Surrounding whitespace

- **WHEN** the user saves the name " Bread "
- **THEN** the item is renamed to "Bread"

#### Scenario: Blank name

- **WHEN** the user saves an empty or whitespace-only name
- **THEN** the item keeps its previous name, the row stays editable, and the message "Enter an item name." is announced next to the text field

#### Scenario: Name too long

- **WHEN** the user saves a name longer than 100 characters
- **THEN** the item keeps its previous name, the row stays editable, and a message states that names can have at most 100 characters

#### Scenario: Cancelling an edit

- **WHEN** the user edits the name and activates the cancel control, or presses Escape
- **THEN** the item keeps its previous name, the row is no longer editable, and no operation message is shown

#### Scenario: Saving an unchanged name

- **WHEN** the user saves without changing the name
- **THEN** the row is no longer editable and no operation message is shown

#### Scenario: Duplicate names

- **WHEN** the user renames an item to the name of another item
- **THEN** the rename succeeds and both items are listed

#### Scenario: Only one row is edited at a time

- **WHEN** a row is being edited and the user activates the edit control of another item
- **THEN** the first row returns to its normal state without saving and the second row becomes editable

### Requirement: Operation feedback

The system SHALL tell the user the outcome of every operation that changes the list: adding, completing, reactivating, removing and renaming an item. When an operation succeeds, the system MUST show a message that names the item and the action, and the message MUST disappear on its own after a few seconds. When an operation fails because the data could not be stored, the system MUST show an error message that describes the problem, and the message MUST stay visible until the user dismisses it. Messages MUST be announced to assistive technology without moving focus. Only one message is shown at a time; a new message replaces the previous one. Input validation messages remain next to their text field and are not repeated as operation messages.

#### Scenario: Item added

- **WHEN** the user adds "Milk"
- **THEN** the message "Added Milk" is shown and disappears on its own

#### Scenario: Item completed

- **WHEN** the user checks the checkbox of "Milk"
- **THEN** the message "Marked Milk as completed" is shown and disappears on its own

#### Scenario: Item reactivated

- **WHEN** the user unchecks the checkbox of the completed item "Milk"
- **THEN** the message "Marked Milk as active" is shown and disappears on its own

#### Scenario: Item removed

- **WHEN** the user activates "Remove Milk"
- **THEN** the message "Removed Milk" is shown and disappears on its own

#### Scenario: Item renamed

- **WHEN** the user renames "Milk" to "Oat milk" and saves
- **THEN** the message "Renamed Milk to Oat milk" is shown and disappears on its own

#### Scenario: Storage failure

- **WHEN** an add, complete, reactivate, remove or rename operation fails because the data cannot be stored
- **THEN** an error message describing the problem is shown, the list keeps showing the last stored data, and the message stays until the user dismisses it

#### Scenario: Failed rename keeps the edit

- **WHEN** a rename fails because the data cannot be stored
- **THEN** the row stays editable with the text the user entered

#### Scenario: Newer message replaces older

- **WHEN** a message is visible and the user performs another operation
- **THEN** only the message for the newer operation is shown

#### Scenario: Validation errors are not repeated

- **WHEN** the user submits a blank name when adding or renaming an item
- **THEN** the validation message is shown next to the text field and no operation message is shown

#### Scenario: Operation that changes nothing

- **WHEN** an operation has no effect because the item is already in the requested state or no longer exists
- **THEN** no success message is shown
