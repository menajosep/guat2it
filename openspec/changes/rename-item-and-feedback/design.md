## Context

The shopping list supports add, complete/reactivate and remove. Items have an id, name, completion state and creation time; the list is sorted by creation time. `ShoppingListService` talks to a `ShoppingItemStore` port whose `save` is an upsert, and `useShoppingList` runs each mutation, re-reads the list and keeps a single `errorMessage` that the page shows as a persistent `role="alert"` banner. No operation currently reports success. Name validation (`parseItemName`) lives in `domain/` and its user-facing messages in `AddItemForm`.

## Goals / Non-Goals

**Goals:**

- Rename an item in place, inline, reusing the existing name rules.
- Give consistent success and error feedback for every list operation, announced to assistive technology.
- Keep business rules in `domain/` and storage details out of components.

**Non-Goals:**

- Bulk actions such as "clear completed" (separate change).
- Undo, name history or duplicate-name prevention.
- Categories, quantities or any schema change.

## Decisions

### Rename is a domain function plus a service method

Add `withName(item, rawName): Result<ShoppingItem, ItemNameError>` to `domain/shopping-item.ts`, built on `parseItemName`, and `ShoppingListService.renameItem(id, rawName)`. The store port and Dexie adapter stay unchanged because `save` already upserts; no new Dexie `version()`.

Alternative: a dedicated `rename` method on the store port. Rejected: it adds a port method for no behavior the upsert does not already cover.

### Services report what actually changed

`setCompleted`, `removeItem` and `renameItem` currently return nothing (or only validation results), so the hook cannot tell a real change from a no-op and has no item name for messages. They will return the affected item, or `undefined` when nothing changed (unknown id, already in the requested state, unchanged name). `renameItem` returns `Result<{ previous: ShoppingItem; item: ShoppingItem } | undefined, ItemNameError>`.

Alternative: derive names and no-ops from the hook's `items` state. Rejected: it duplicates the "already in that state" rule outside the service and can be stale.

### Feedback state lives in the hook; the message text lives with the UI

`useShoppingList` exposes `feedback: { id: number; kind: 'success' | 'error'; message: string } | null` and `dismissFeedback()`. The `mutate` helper sets success feedback from the service outcome and error feedback from the caught error (`PersistenceError` messages are already user-readable). A new feedback replaces the previous one; `id` lets the UI restart the auto-dismiss timer. Message wording is built in one place (a small `feedback-messages.ts` in the feature) so it is easy to test and keep consistent with the spec.

Validation errors (`invalid` outcomes) never create feedback; they are shown inline next to the field.

The persistent page banner is removed for mutations. The initial load failure keeps its inline message and "Try again" button, because it is tied to that button.

### Feedback is shown in a toast that is announced politely

Use Ionic's toast: success messages auto-dismiss (about 3 seconds); error messages have no timeout and a dismiss button. It is rendered once on the page, driven by `feedback`. The shared name-error messages move from `AddItemForm` to a small module reused by the add form and the edit row.

Alternative: an inline status line on the page. Rejected by the user in favour of a toast, but it is the fallback if the toast cannot be made accessible (see risks).

### Inline editing state is local to the list

`ShoppingItemList` holds `editingId` (one row at a time). The row renders an `IonInput`, Save and Cancel buttons and an inline `role="alert"` error region. Enter saves, Escape cancels, focus moves to the input when editing starts and back to the edit button afterwards. The hook's `renameItem(id, name)` returns a `RenameOutcome` (`renamed | unchanged | invalid | failed`) so the row knows whether to close (renamed, unchanged) or stay open (invalid, failed). Deleting or completing other rows while editing does not affect the draft except that removing the edited row discards it.

## Risks / Trade-offs

- [Ionic's toast may not be announced as the project requires (`role="alert"` for errors)] → Spike first (task 1.1): inspect the rendered toast attributes in the installed Ionic version. If it falls short, add `htmlAttributes`/a separate visually hidden live region, or fall back to the inline status line.
- [Overlay and timers make tests flaky] → Make the success duration injectable/overridable in tests, assert on the message text and use fake timers for auto-dismiss; in Playwright assert right after the action.
- [A toast on every checkbox toggle can feel noisy] → Accepted by design; revisit if it proves annoying in daily use.
- [Changing service return types touches existing tests] → Update tests to assert the new outcomes; behavior of persisted data is unchanged.
- [Focus handling in the inline editor is easy to get wrong on mobile] → Cover start, save and cancel in UI tests and an e2e flow; verify manually on a device when native builds are available.
