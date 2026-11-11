## Context

Recipes are stored locally and exposed through the recipe service and storage port. The recipe detail view currently has no destructive action. The existing shopping-list feature uses an accessible, localized Ionic confirmation dialog before clearing completed items; recipe deletion can follow that established interaction pattern.

## Goals / Non-Goals

**Goals:**

- Let the user delete the currently viewed saved recipe.
- Require confirmation, with cancellation leaving the recipe untouched.
- Remove the recipe through the existing service and persistence layers.
- Report a failed deletion accessibly and keep the recipe available in the view.
- Keep confirmation and error text localized with the existing recipe messages.

**Non-Goals:**

- Bulk deletion, undo, recipe synchronization, or changes to database schema.
- Deleting a recipe merely by opening or navigating away from its detail view.

## Decisions

1. Put the delete action on the recipe detail view and require a confirmation dialog. This keeps deletion tied to an explicitly selected recipe and follows the existing clear-completed confirmation pattern; deleting directly from a list row would offer less context for a destructive action.
2. Extend the recipe service/store contract with deletion by recipe ID, and implement it in the local persistence adapter. This keeps UI components independent of storage and ensures failures use the established persistence error path; direct Dexie access from the page is not appropriate.
3. After successful deletion, clear the selected recipe and show the refreshed list. If persistence fails, retain the detail view and show an accessible error instead of presenting a success-shaped state.
4. Add localized confirmation, cancel, delete, and error messages to all supported languages. A single-language confirmation would conflict with existing localized controls.

## Risks / Trade-offs

- [A confirmed deletion has no undo] → Require explicit confirmation before modifying persistent data.
- [Storage can fail after confirmation] → Keep the recipe visible and announce a specific accessible failure; do not claim it was deleted.
- [The recipe may already be missing] → Handle missing records explicitly rather than treating a failed lookup as successful deletion.
