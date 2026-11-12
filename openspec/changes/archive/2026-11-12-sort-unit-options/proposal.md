## Why

The unit selector currently follows a fixed catalog order, making a unit difficult
to find by its displayed name. Issue #26 requests an alphabetical list.

## What Changes

- Sort unit choices alphabetically by their names in the currently selected language.
- Keep the "No unit" choice first and preserve the selected unit when changing language.
- Apply the same behavior to shopping-item and recipe-ingredient quantity fields.
- Keep stable unit identifiers, stored quantities and validation unchanged.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `ui-language`: Replace the same-order-across-languages requirement with
  alphabetic order based on localized unit names.

## Impact

The shared quantity selector, related tests and user documentation are affected.
No storage migration or dependency is needed.
