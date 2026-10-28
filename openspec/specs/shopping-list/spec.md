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

The system SHALL tell the user the outcome of every operation that changes the list: adding, completing, reactivating, removing and renaming an item, changing its amount or unit, and clearing completed items. When an operation succeeds, the system MUST show a message that names the item and the action (or, when clearing completed items, the number of items cleared), and the message MUST disappear on its own after a few seconds. When an operation fails because the data could not be stored, the system MUST show an error message that describes the problem, and the message MUST stay visible until the user dismisses it. Messages MUST be announced to assistive technology without moving focus. Only one message is shown at a time; a new message replaces the previous one. Input validation messages remain next to their text field and are not repeated as operation messages.

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

#### Scenario: Amount or unit changed

- **WHEN** the user changes only the amount or unit of "Flour" and saves
- **THEN** the message "Updated Flour" is shown and disappears on its own

#### Scenario: Storage failure

- **WHEN** an add, complete, reactivate, remove, rename, amount/unit change or clear-completed operation fails because the data cannot be stored
- **THEN** an error message describing the problem is shown, the list keeps showing the last stored data, and the message stays until the user dismisses it

#### Scenario: Failed rename keeps the edit

- **WHEN** a rename or amount/unit change fails because the data cannot be stored
- **THEN** the row stays editable with the text the user entered

#### Scenario: Newer message replaces older

- **WHEN** a message is visible and the user performs another operation
- **THEN** only the message for the newer operation is shown

#### Scenario: Validation errors are not repeated

- **WHEN** the user submits a blank name, or an invalid amount or unit, when adding or editing an item
- **THEN** the validation message is shown next to the fields and no operation message is shown

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

### Requirement: Item amount and unit

The system SHALL let the user give an item an optional amount and an optional unit when adding it. The amount is a positive decimal number of at most 9999.99 with at most two decimal places; both "." and "," are accepted as decimal separator. The unit MUST be chosen from this list: to taste, a bit, stick, jar, bottle, dash, small glass, square, tablespoon, teaspoon, dozen, clove, whole, flake, ear, wedge, drop, gram, leaf, kilogram, can, pound, liter, bunch, half, milliliter, pinch, inch, handful, strip, sprig, slice, piece, sachet, small cup, stalk, cup, shaving, glass. If an amount is entered, a unit MUST be chosen. The units "to taste" and "a bit" take no amount; every other unit MUST be given an amount. An item without amount and unit remains valid.

#### Scenario: Adding an item with amount and unit

- **WHEN** the user enters "Flour", the amount "500" and the unit "gram", and submits the form
- **THEN** "Flour" appears in the list with the quantity "500 grams" and the name, amount and unit fields are cleared

#### Scenario: Adding an item without amount and unit

- **WHEN** the user enters "Milk" and leaves the amount empty and no unit selected
- **THEN** "Milk" is added without a quantity

#### Scenario: Decimal amount with comma

- **WHEN** the user enters the amount "0,5" with the unit "teaspoon"
- **THEN** the item is added with the quantity "0.5 teaspoons"

#### Scenario: Amount without unit

- **WHEN** the user enters an amount and selects no unit and submits the form
- **THEN** no item is added and the message "Choose a unit for the amount." is announced next to the fields

#### Scenario: Unit that needs an amount

- **WHEN** the user selects the unit "cup" and leaves the amount empty and submits the form
- **THEN** no item is added and the message "Enter an amount for this unit." is announced next to the fields

#### Scenario: Unit that takes no amount

- **WHEN** the user selects the unit "to taste"
- **THEN** the amount field is disabled and empty, and submitting adds the item with the quantity "to taste"

#### Scenario: Invalid amount

- **WHEN** the user enters an amount that is not a positive number, is zero, has more than two decimal places or is greater than 9999.99
- **THEN** no item is added and a message states that the amount must be a positive number up to 9999.99 with at most two decimals

#### Scenario: Singular and plural unit

- **WHEN** the user adds items with the amount "1" and the unit "cup", and with the amount "2" and the unit "cup"
- **THEN** the quantities are shown as "1 cup" and "2 cups"

#### Scenario: Name rules still apply

- **WHEN** the user submits a blank name with a valid amount and unit
- **THEN** no item is added and the message "Enter an item name." is announced

### Requirement: Show amount and unit

The system SHALL show the amount and unit of an item next to its name in the list. Items without amount and unit MUST show only their name. The quantity MUST remain visible after the item is completed or reactivated and after the page is reloaded.

#### Scenario: Quantity next to the name

- **WHEN** the list contains "Flour" with 500 grams and "Milk" without a quantity
- **THEN** "Flour" is listed with "500 grams" and "Milk" is listed with no quantity

#### Scenario: Quantity kept when completing

- **WHEN** the user completes "Flour" with 500 grams
- **THEN** "Flour" is shown as completed and still shows "500 grams"

#### Scenario: Quantity survives a reload

- **WHEN** the user adds "Flour" with 500 grams and reloads the page
- **THEN** "Flour" is listed with "500 grams"

#### Scenario: Items stored before amounts existed

- **WHEN** the list contains items that were stored without amount and unit
- **THEN** they are listed with their names only and can be edited to add an amount and unit

### Requirement: Change amount and unit of an item

The system SHALL let the user change or clear the amount and unit of an item in the same inline editor used for renaming. The editor MUST be pre-filled with the current amount and unit, and the amount and unit follow the same rules as when adding an item. Saving MUST keep the item's completion state and its position in the list.

#### Scenario: Editor shows the current quantity

- **WHEN** the user activates "Edit Flour" for an item with 500 grams
- **THEN** the editor shows the amount "500" and the unit "gram"

#### Scenario: Changing amount and unit

- **WHEN** the user changes the amount to "2" and the unit to "kilogram" and saves
- **THEN** the item shows "2 kilograms" in the same position and the row is no longer editable

#### Scenario: Adding a quantity to an item

- **WHEN** the user edits "Milk", enters the amount "1" with the unit "liter" and saves
- **THEN** "Milk" is listed with "1 liter"

#### Scenario: Clearing the quantity

- **WHEN** the user empties the amount and selects no unit and saves
- **THEN** the item is listed with its name only

#### Scenario: Invalid quantity keeps the editor open

- **WHEN** the user saves an amount without a unit, or a unit that needs an amount without an amount
- **THEN** the item is unchanged, the row stays editable and the validation message is announced next to the fields

#### Scenario: Cancelling an edit

- **WHEN** the user changes the amount or unit and activates cancel, or presses Escape
- **THEN** the item keeps its previous amount and unit and no operation message is shown

