## ADDED Requirements

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

## MODIFIED Requirements

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
