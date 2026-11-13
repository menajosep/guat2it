# menu-ingredients-to-shopping-list Specification

## Purpose
TBD - created by archiving change add-menu-ingredients-to-shopping-list. Update Purpose after archive.
## Requirements
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

### Requirement: Group matching ingredients and active shopping items

The system SHALL group ingredient names by trimmed, Unicode-lowercased text, without synonym, singular/plural or internal-whitespace normalization. Each matching active shopping-list record MUST contribute once even when displayed in multiple categories. Matching completed items and unrelated list records MUST remain unchanged. After confirmation, each ingredient group MUST produce one active shopping item. When multiple matching active items exist, the system MUST retain the earliest-created record, breaking equal-time ties by ID, preserve its name, ID and creation time, and retain the union of their categories. A group without an active match MUST create an active uncategorized item using the first ingredient's saved name in deterministic assignment and ingredient order.

#### Scenario: Combine menu recipes and an active item

- **WHEN** two assigned recipes contain 2 and 3 units of tomato and one active list item named `Tomato` contains 1 unit
- **THEN** the review proposes one active item containing 6 units and confirmation saves it

#### Scenario: Duplicate active entries with categories

- **WHEN** two matching active items have different categories and the user confirms a transfer containing that ingredient
- **THEN** one active item retains the earliest record's identity and the union of both category assignments
- **AND** an item shown in two category groups is counted only once

#### Scenario: Completed item is not merged

- **WHEN** the only matching shopping item is completed and the transfer is confirmed
- **THEN** the completed item is unchanged and a separate active item is created for the ingredient

#### Scenario: Distinct ingredient names

- **WHEN** names differ beyond case or surrounding whitespace, such as `tomato` and `tomatoes`
- **THEN** they are treated as different groups

### Requirement: Resolve quantity and unit conflicts

The system SHALL require the user to select a target unit when a group contains differing unit IDs, including differences from existing active items. It MUST combine same-unit numeric quantities and convert compatible mass units (grams, kilograms and pounds) or compatible metric volume units (milliliters and liters) using exact conversion factors. A calculated total MUST be positive, no greater than 9999.99 and exactly representable to at most two decimal places. For incompatible units, missing or vague quantities, or a total that cannot meet those limits, the system MUST show the source quantities and require the user to explicitly enter and confirm a valid final quantity. It MUST NOT silently round, discard a contribution, assume an unknown amount is zero or guess a conversion. A final quantity MUST satisfy the existing shopping-list quantity rules.

#### Scenario: Same units

- **WHEN** matching ingredients have 1.25 and 2.50 kilograms
- **THEN** the proposed total is exactly 3.75 kilograms

#### Scenario: Compatible units

- **WHEN** matching ingredients contain 1 kilogram and 500 grams and the user selects grams
- **THEN** the proposed total is 1500 grams

#### Scenario: Incompatible units

- **WHEN** matching ingredients include grams and individual units
- **THEN** the system shows the contributions and requires the user to choose a unit and explicitly provide a valid final quantity

#### Scenario: Missing or vague quantity

- **WHEN** a matching ingredient or active list item has no amount or uses a vague unit
- **THEN** the review requires explicit final-quantity input rather than treating it as zero

#### Scenario: Precision or limit exceeded

- **WHEN** a calculated total would exceed 9999.99 or require more than two decimal places
- **THEN** the system requires a valid explicit final quantity or another target unit and does not silently round or truncate

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

### Requirement: Commit transfers atomically and protect reviews

The system MUST save the confirmed transfer as one all-or-nothing operation. It MUST preserve saved recipes, menu assignments, the selected menu, completed items and unrelated shopping-list entries. If the menu, assignments, referenced ingredients, relevant shopping records or categories change after review, the system MUST reject the stale transfer without writes, explain the change and require a fresh review. A shopping-item edit or completion change started before a transfer MUST NOT silently overwrite the transfer or recreate a merged-away item; if it cannot be applied safely, the system MUST report the conflict. Missing menus or referenced recipes and storage errors MUST be reported without claiming success. A storage failure MUST leave all shopping items unchanged and permit retry. Successful confirmation MUST report success, and the persisted list MUST be visible when revisiting or reloading the shopping list. The system MUST prevent duplicate writes from repeated confirmation of the same review.

#### Scenario: Successful transfer survives reload

- **WHEN** the user confirms a valid review and reloads the application
- **THEN** all resulting shopping items are present and saved recipes and assignments are unchanged

#### Scenario: Concurrent change invalidates review

- **WHEN** a matching shopping item or a menu ingredient changes after review but before confirmation
- **THEN** no transfer is written and the user is asked to review the current data again

#### Scenario: Failure partway through saving

- **WHEN** storage fails during any transfer write
- **THEN** no transfer changes are persisted, an accessible error is shown and the user can retry

#### Scenario: An earlier shopping edit finishes after a transfer

- **WHEN** an edit to a matching active shopping item begins before a transfer and attempts to save after the transfer changes or merges that item
- **THEN** the edit does not silently overwrite the transferred quantity or recreate a removed duplicate
- **AND** an edit that cannot be safely applied is reported as a conflict

#### Scenario: Repeated confirmation

- **WHEN** the user activates confirmation repeatedly while one transfer is in progress
- **THEN** the reviewed ingredients are applied at most once

### Requirement: Accessible localized transfer

The system SHALL provide accessible transfer controls, review fields, conflict explanations and operation feedback in English, Spanish and Catalan. Errors MUST be announced accessibly. Changing language during review MUST preserve the target menu and entered resolutions while updating interface text; user-provided ingredient names MUST remain unchanged.

#### Scenario: Change language during review

- **WHEN** the user changes language while resolving a quantity conflict
- **THEN** the review, actions and errors use the selected language and the selected unit and entered quantity remain unchanged
