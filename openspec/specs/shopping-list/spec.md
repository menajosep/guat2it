# shopping-list Specification

## Purpose
TBD - created by archiving change initialize-foundation. Update Purpose after archive.
## Requirements
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

The system SHALL tell the user the outcome of every operation that changes the list: adding, completing, reactivating, removing, renaming an item and clearing completed items. When an operation succeeds, the system MUST show a message that names the item and the action (or, when clearing completed items, the number of items cleared), and the message MUST disappear on its own after a few seconds. When an operation fails because the data could not be stored, the system MUST show an error message that describes the problem, and the message MUST stay visible until the user dismisses it. Messages MUST be announced to assistive technology without moving focus. Only one message is shown at a time; a new message replaces the previous one. Input validation messages remain next to their text field and are not repeated as operation messages.

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

#### Scenario: Completed items cleared

- **WHEN** the user confirms clearing three completed items
- **THEN** the message "Cleared 3 completed items" is shown and disappears on its own

#### Scenario: One completed item cleared

- **WHEN** the user confirms clearing a single completed item
- **THEN** the message "Cleared 1 completed item" is shown and disappears on its own

#### Scenario: Storage failure

- **WHEN** an add, complete, reactivate, remove, rename or clear-completed operation fails because the data cannot be stored
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

- **WHEN** an operation has no effect because the item is already in the requested state or no longer exists, or because no completed items remain to clear
- **THEN** no success message is shown

### Requirement: Clear completed items

The system SHALL let the user remove all completed items from the list at once through a control labelled "Clear completed". The control MUST be shown only while at least one item is completed. Activating it MUST open a confirmation dialog that states how many items will be removed and offers "Cancel" and "Clear". No item MUST be removed until the user chooses "Clear". Confirming MUST remove every completed item and MUST keep all active items, their names and their order. Removal is all-or-nothing: if it fails, every item remains in the list.

#### Scenario: Control visible only with completed items

- **WHEN** the list has at least one completed item
- **THEN** the "Clear completed" control is shown

#### Scenario: No completed items

- **WHEN** the list has no completed items, including when it is empty
- **THEN** the "Clear completed" control is not shown

#### Scenario: Asking for confirmation

- **WHEN** the list has two completed items and the user activates "Clear completed"
- **THEN** a confirmation dialog states that 2 completed items will be removed and offers "Cancel" and "Clear", and no item has been removed yet

#### Scenario: Singular wording

- **WHEN** the list has exactly one completed item and the user activates "Clear completed"
- **THEN** the dialog states that 1 completed item will be removed

#### Scenario: Confirming

- **WHEN** the list has the completed items "Milk" and "Eggs" and the active item "Bread", and the user activates "Clear completed" and then "Clear"
- **THEN** only "Bread" remains in the list, the dialog is closed, and "Clear completed" is no longer shown

#### Scenario: Cancelling

- **WHEN** the user activates "Clear completed" and then "Cancel", or presses Escape
- **THEN** the dialog is closed, every item is still in the list, and no operation message is shown

#### Scenario: Clearing leaves the list empty

- **WHEN** every item in the list is completed and the user confirms clearing
- **THEN** the empty-list message is shown

#### Scenario: Active items are untouched

- **WHEN** the user clears completed items
- **THEN** the remaining active items keep their names and their relative order

#### Scenario: Cleared items stay cleared

- **WHEN** the user clears completed items and reloads the app
- **THEN** the cleared items are not listed

#### Scenario: Only completed items are removed

- **WHEN** an item that was completed when the dialog opened has been reactivated before the user confirms
- **THEN** that item is kept and the message reports only the items actually removed

#### Scenario: Removal fails

- **WHEN** clearing fails because the data cannot be stored
- **THEN** every item is still in the list and an error message describing the problem is shown until the user dismisses it

