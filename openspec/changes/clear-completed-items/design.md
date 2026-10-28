## Context

The shopping list supports add, complete/reactivate, remove and rename, with success and error feedback for each operation. `ShoppingListService` talks to a `ShoppingItemStore` port (`getAll`, `get`, `save` as upsert, `remove`). `useShoppingList` runs each mutation through `mutate`, which re-reads the list and reports storage failures as error feedback; success messages are built in `messages.ts` and shown by `FeedbackToast`.

## Goals / Non-Goals

**Goals:**

- Remove all completed items with one action, protected by a confirmation.
- Never remove a partial set of items: either every completed item is removed or none is.
- Report the outcome through the existing feedback mechanism.

**Non-Goals:**

- Undo or a trash/archive of removed items.
- Selecting a subset of items to clear, or clearing active items.
- Any schema change.

## Decisions

### The rule "which items are cleared" lives in the service

`ShoppingListService.clearCompleted()` reads the stored items, selects those with `completed === true`, removes them through the store and returns the removed items (an empty array when there were none). Selecting by the stored state, not by what the UI currently shows, means an item reactivated in the meantime is never deleted. A small pure helper `completedItems(items)` in `domain/shopping-item.ts` expresses the rule and is unit tested.

Alternative: the hook passes the ids it displays. Rejected: it duplicates the rule in the UI and can be stale.

### Bulk removal is one port method, executed in one transaction

Add `removeMany(ids: string[]): Promise<void>` to `ShoppingItemStore`. The Dexie adapter implements it with `bulkDelete` inside a single read-write transaction, wrapped by the existing `guard` so failures become `PersistenceError`. IndexedDB transactions are atomic, so a failure leaves every item in place. Calling `remove` in a loop was rejected: a failure midway would leave a partial deletion. No schema change, so no new Dexie `version()`.

### Confirmation is a modal dialog owned by the UI

The page shows a "Clear completed" button only when `items.some(i => i.completed)`. Activating it opens a confirmation dialog with the title "Clear completed items?", a message such as "This removes 3 completed items from the list.", and "Cancel" and "Clear" buttons. The count shown comes from the items on screen when the dialog opens; the service removes whatever is completed at confirmation time and the feedback reports the number actually removed. Cancel, Escape or tapping the backdrop closes the dialog and changes nothing. The dialog text uses the singular for one item.

The first task is a short spike to check that Ionic's `IonAlert` exposes dialog semantics (role, accessible name, focus handling) and can be driven from RTL and Playwright. If it cannot, the dialog is rendered in-page with `role="alertdialog"` like `FeedbackToast` was; the decision is then recorded here.

### Hook API and feedback

`useShoppingList` exposes `clearCompleted: () => Promise<void>`. It runs through `mutate`, announces `Cleared N completed item(s)` as success only when N > 0, and reports storage errors as error feedback like every other operation. Message text is added to `feedbackMessages` (`cleared(count)`): "Cleared 1 completed item" / "Cleared 3 completed items".

## Risks / Trade-offs

- [Accidental destruction of several items] → Mitigated by the confirmation dialog; undo is deliberately out of scope.
- [The list changes while the dialog is open (for example, another tab)] → The service clears by stored state and the message reports the real count; documented in the spec as "only completed items are removed".
- [Ionic overlays are awkward in jsdom] → Spike first; fall back to an in-page dialog if needed. Tests assert by role and text.
- [A new port method affects every store implementation] → There is one adapter (Dexie) and the in-memory fakes in tests; both are updated.
