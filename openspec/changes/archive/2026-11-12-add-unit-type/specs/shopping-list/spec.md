## MODIFIED Requirements

### Requirement: Item amount and unit

The system SHALL let the user give an item an optional amount and an optional unit when adding it. The amount is a positive decimal number of at most 9999.99 with at most two decimal places; both "." and "," are accepted as decimal separator. The unit MUST be chosen from this list: to taste, a bit, stick, jar, bottle, dash, small glass, square, tablespoon, teaspoon, dozen, clove, whole, flake, ear, wedge, drop, gram, leaf, kilogram, can, pound, liter, bunch, half, milliliter, pinch, inch, handful, strip, sprig, slice, piece, sachet, small cup, stalk, cup, shaving, glass, unit. If an amount is entered, a unit MUST be chosen. The units "to taste" and "a bit" take no amount; every other unit MUST be given an amount. An item without amount and unit remains valid.

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

#### Scenario: Countable unit labels

- **WHEN** the user selects the countable unit and adds items with amounts 1 and 2
- **THEN** the quantities are shown as "1 unit" and "2 units" in English, "1 unidad" and "2 unidades" in Spanish, or "1 unitat" and "2 unitats" in Catalan

#### Scenario: Countable unit requires an amount

- **WHEN** the user selects the countable unit without entering an amount and submits
- **THEN** no item is added and the amount-required error is announced

#### Scenario: Countable unit persists

- **WHEN** the user adds or edits an item with the countable unit and reloads the app
- **THEN** the saved amount and unit remain visible and editable

#### Scenario: Existing whole quantities

- **WHEN** an item already has a whole-unit quantity
- **THEN** its unit and displayed meaning remain unchanged
