## Why

A shopping-list item only has a name, so "Flour" cannot say how much to buy. Issue #2 asks for an optional amount and unit per item, using a fixed list of cooking units, so that the list is useful for shopping and later for recipes and meal planning.

## What Changes

- Each item can have an optional **amount** (positive decimal number) and **unit** (chosen from a fixed list of cooking units, in English).
- If an amount is given, a unit is required. Two units that mean "at the cook's discretion" (`to taste`, `a bit`) take no amount; every other unit needs an amount.
- The add form gets an amount field and a unit selector; the inline edit row gets the same fields, so amount and unit can be changed or cleared later.
- The list shows the amount and unit next to the item name (for example "Flour · 500 grams").
- Saving an edit that only changes amount or unit shows an "Updated …" operation message; renames keep "Renamed … to …".
- Existing items stay valid without amount or unit. No data is lost and no Dexie schema version is needed (the new fields are not indexed).
- Update the README to describe amount and unit.

No breaking changes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `shopping-list`: adds the requirements "Item amount and unit", "Show amount and unit" and "Change amount and unit of an item", and extends "Operation feedback" with the "Updated" message.

## Impact

- `src/features/shopping-list/domain/`: optional `amount` and `unit` on `ShoppingItem`, the unit catalogue, amount/unit validation, and formatting of the quantity.
- `src/features/shopping-list/application/`: `ShoppingListService.addItem` and `renameItem` accept amount and unit (rename becomes a general item update); the store port and Dexie adapter are unchanged.
- `src/features/shopping-list/hooks/`, `components/`, `messages.ts`: amount and unit inputs in `AddItemForm` and `EditItemForm`, quantity shown in `ShoppingItemList`, new validation and "Updated" messages.
- Tests: domain, service, Dexie persistence, UI (`src/test/`) and an e2e flow.
- Docs: `README.md`. No new dependencies.
