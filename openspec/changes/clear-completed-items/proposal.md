## Why

After a shopping trip the list fills up with completed items, and the only way to tidy it is to remove them one by one. A single "clear completed" action fixes that, but it permanently deletes several items at once, so it needs an explicit confirmation. This is tracked in issue #1 and comes before recipes and categories are introduced.

## What Changes

- Add a "Clear completed" control to the shopping list. It is shown only while at least one item is completed.
- Activating it asks for confirmation in a dialog that states how many items will be removed, with "Cancel" and "Clear" choices. Nothing is removed until the user confirms; cancelling leaves the list untouched.
- Confirming removes all completed items in one storage operation and keeps active items and their order unchanged. If storage fails, no completed item is lost and an error message is shown.
- Operation feedback covers the new action: a success message names how many items were cleared and disappears on its own.
- Update the README feature list.

No breaking changes. Undo is out of scope; the confirmation dialog is the safeguard.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `shopping-list`: adds a "Clear completed items" requirement and extends "Operation feedback" to cover it. Existing behavior is otherwise unchanged.

## Impact

- `src/features/shopping-list/application/`: `ShoppingItemStore` port gains a bulk removal method; `ShoppingListService.clearCompleted`.
- `src/features/shopping-list/infrastructure/`: Dexie adapter implements bulk removal. No schema change, so no new Dexie `version()`.
- `src/features/shopping-list/hooks/`, `components/`, `pages/`: `clearCompleted` in the hook, a clear-completed control with a confirmation dialog, feedback message text.
- Tests: service, Dexie store, UI (`src/test/`) and an e2e flow.
- Docs: `README.md`. No new dependencies.
