## Why

Issue #24 asks for ingredients to be measured in individual units, but the available
choices do not include a unit labelled "unit", "unidad" or "unitat". Users need a
clear count-based choice when reviewing or editing ingredients.

## What Changes

- Add a countable unit with localized singular and plural labels in English, Spanish
  and Catalan.
- Make the choice available wherever the shared quantity fields are used, including
  recipe ingredients and shopping-list items.
- Preserve existing quantities and the current interpretation of imported ingredient
  text; do not rename or migrate the existing "whole" unit.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `shopping-list`: Add the new countable unit to the supported quantity choices.
- `recipe-import`: Allow the new unit when reviewing, saving and editing ingredients.

## Impact

The shared unit definitions, localized messages, quantity presentation, recipe and
shopping-list tests are affected. Existing local data and supported recipe-import
mappings remain compatible; no new dependencies or storage migration are expected.
