## Why

Removing a recipe assignment from a weekly menu currently takes effect immediately.
Issue #21 asks for a confirmation prompt so users can avoid accidental removals.

## What Changes

- Ask for explicit confirmation before removing a recipe from a specific menu
  day and meal, and identify the target in the prompt.
- Leave the assignment untouched when the prompt is canceled or dismissed.
- Preserve the existing single-slot removal, persistence, error handling and
  protection against deleting recipes that remain assigned elsewhere.
- Localize the accessible prompt and its actions in English, Spanish and Catalan.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `weekly-menus`: Require confirmation before removing a recipe assignment.

## Impact

The weekly-menu UI, planning messages, component and browser tests, and user
documentation are affected. The assignment service and local database schema
do not need to change.
