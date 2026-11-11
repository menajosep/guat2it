## Why

Issue #13 asks users to be able to remove saved recipes. Recipes are currently kept locally with no way to delete a recipe that is no longer wanted.

## What Changes

- Add a delete action for a saved recipe.
- Require explicit confirmation before deleting, and leave the recipe unchanged if deletion is canceled.
- On successful deletion, remove the recipe from local storage and return the user to the updated recipe list.
- Report deletion failures accessibly without implying that the recipe was removed.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `recipe-import`: Allow users to delete locally saved recipes with confirmation and clear success or failure behavior.

## Impact

- Recipe detail/list UI, recipe application service and storage port, Dexie adapter, and recipe tests.
- No new dependencies, backend, or database schema changes.
