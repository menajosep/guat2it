## Why

A typo in an item name can only be fixed today by removing the item and adding it again, which also loses its position in the list. In addition, the app gives no confirmation when an operation succeeds, and storage failures show up as a persistent banner that is easy to miss. Users should be able to correct names in place and always know whether an action worked.

## What Changes

- Add inline renaming: each item gets an "Edit" control; activating it turns the row into a text field with Save and Cancel. The item keeps its id, completion state and position in the list; the old name is replaced (no history).
- Renaming reuses the existing name rules (trimmed, 1–100 characters); validation errors are shown inline next to the field and the editor stays open.
- Add operation feedback: every operation (add, complete, reactivate, remove, rename) shows a success message when it finishes, and an error message when it fails because of a storage problem.
- Success messages disappear on their own; error messages stay until dismissed. Messages are announced to assistive technology.
- Failed storage operations no longer use the persistent page banner; the initial load failure keeps its message and "Try again" button.
- Update the README (remove the "items cannot be renamed" limitation and the "next recommended step" note).

No breaking changes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `shopping-list`: adds a "Rename an item" requirement and an "Operation feedback" requirement. Existing requirements are unchanged.

## Impact

- `src/features/shopping-list/domain/`: new rename rule (`withName`) reusing `parseItemName`.
- `src/features/shopping-list/application/`: `ShoppingListService.renameItem`; the store port and the Dexie adapter are unchanged (`save` already upserts), so no new Dexie schema version.
- `src/features/shopping-list/hooks/`: `renameItem` plus feedback state (message kind, text, dismiss).
- `src/features/shopping-list/components/` and `pages/`: inline edit row, toast for feedback, removal of the mutation error banner; shared name-error messages move out of `AddItemForm`.
- Tests: domain, service, UI (`src/test/`) and an e2e rename flow.
- Docs: `README.md`. No new dependencies.
