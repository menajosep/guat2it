## MODIFIED Requirements

### Requirement: Review a weekly menu transfer

The system SHALL offer an action for the selected weekly menu to review its recipe ingredients for transfer to the local shopping list. The review MUST identify the menu and display its ingredient contributions, including repeated assignments and matching active shopping-list entries, before any write. Every assignment of a recipe MUST contribute its ingredients once, with each numeric recipe amount multiplied by the menu's saved serving count divided by that recipe's saved yield. The review MUST show the menu serving count, each recipe's yield, original quantity and scaled contribution; shopping-list quantities MUST NOT be scaled. The user MUST explicitly confirm the transfer. Canceling, dismissing or leaving the view before confirmation MUST leave the shopping list unchanged. A menu with no assignments MUST report that there are no ingredients to transfer and MUST NOT write to the list.

#### Scenario: The same recipe appears in multiple meals

- **WHEN** a recipe yielding 4 servings with 2 units of tomato is assigned to two meals in a menu serving 2 people and the user opens the review
- **THEN** the review includes both assignments, shows their original and scaled amounts, and proposes 2 units of tomato

#### Scenario: Scale different recipe yields

- **WHEN** a menu serving 4 people contains one recipe yielding 2 with 100 grams of flour and another yielding 8 with 400 grams of flour
- **THEN** the review shows each scaled contribution as 200 grams and proposes a total of 400 grams

#### Scenario: Existing shopping quantity is not scaled

- **WHEN** a menu serving 2 people contains a recipe yielding 4 with 4 units of tomato and the active list contains 3 units of tomato
- **THEN** the review proposes 5 units of tomato

#### Scenario: Cancel a review

- **WHEN** the user cancels or dismisses an unconfirmed review or leaves the view
- **THEN** no ingredients are added or changed

#### Scenario: Empty menu

- **WHEN** the selected menu has no recipe assignments and the user requests a transfer
- **THEN** the system explains that there are no ingredients to transfer and makes no shopping-list changes

#### Scenario: Transfer again

- **WHEN** the user confirms another transfer from the same menu after a successful transfer
- **THEN** the scaled ingredients are added again to the current active shopping-list quantities

## ADDED Requirements

### Requirement: Scale quantities without losing precision

The system SHALL calculate scaling and compatible unit conversion without intermediate rounding or truncation, including for positive decimal recipe yields. It MUST combine exact scaled contributions with matching shopping quantities before checking whether the final result meets the existing quantity rules. If the final result cannot be represented exactly with at most two decimal places, is nonpositive or exceeds 9999.99, the system MUST require a valid explicit final quantity or another target unit. Missing or vague amounts and incompatible units MUST continue to require explicit resolution, with original sources visible. The system MUST NOT silently round, discard a contribution or guess a quantity. A missing, nonpositive or invalid saved recipe yield MUST be reported as an error and MUST NOT produce a transfer.

#### Scenario: Fractional contributions produce an exact total

- **WHEN** two assignments each contribute 1 unit from a recipe yielding 3 to a menu serving 1
- **AND** a third assignment contributes the same amount
- **THEN** the review proposes exactly 1 unit without rounding the individual contributions

#### Scenario: Unrepresentable final amount

- **WHEN** one recipe contributes 1 unit for a yield of 3 to a menu serving 1 and no other quantities match
- **THEN** the review shows the source and scaled contribution and requires an explicit valid final quantity

#### Scenario: Decimal recipe yield

- **WHEN** a recipe yielding 1.5 has 3 kilograms of an ingredient and the menu serves 1
- **THEN** the review proposes exactly 2 kilograms

#### Scenario: Scaled quantity exceeds supported precision

- **WHEN** a recipe yielding 400 has 1 gram of an ingredient, the menu serves 1, and there are no other matching quantities
- **THEN** the review does not round 0.0025 grams and requires an exact supported target unit or explicit resolution

#### Scenario: Invalid saved recipe yield

- **WHEN** an assigned recipe has a missing, zero, negative or otherwise invalid yield
- **THEN** the system reports the recipe yield problem and makes no shopping-list changes

### Requirement: Invalidate reviews when scaling inputs change

The system MUST reject a transfer without writes if the menu serving count or any assigned recipe yield changes after the review was built, and MUST require a fresh review. The rejection MUST use the existing stale-review feedback and all-or-nothing behavior.

#### Scenario: Serving count changes before confirmation

- **WHEN** a menu's serving count changes after review but before confirmation
- **THEN** the transfer is rejected without writes and the user is asked to review the current data again

#### Scenario: Recipe yield changes before confirmation

- **WHEN** an assigned recipe's yield changes after review but before confirmation
- **THEN** the transfer is rejected without writes and the user is asked to review the current data again
