## 1. Spike

- [ ] 1.1 Render an Ionic `IonAlert` confirmation in the app and record the role, accessible name, focus behavior and how it can be driven from RTL (jsdom) and Playwright (Chromium); if it cannot meet the accessibility and testing rules, render an in-page `role="alertdialog"` instead, and note the outcome in design.md

## 2. Domain and application

- [ ] 2.1 Add `completedItems(items)` to `domain/shopping-item.ts` with unit tests
- [ ] 2.2 Add `removeMany(ids)` to the `ShoppingItemStore` port and implement it in the Dexie adapter with one `bulkDelete` transaction wrapped by `guard`; test it (removes only the given ids, empty input is a no-op, storage failure becomes `PersistenceError` and removes nothing)
- [ ] 2.3 Add `ShoppingListService.clearCompleted()` returning the removed items (empty when none); service tests for several completed items, none completed, active items and order untouched, and persistence failure leaving everything in place; update in-memory store fakes for the new port method

## 3. Hook and feedback

- [ ] 3.1 Add `feedbackMessages.cleared(count)` ("Cleared 1 completed item" / "Cleared N completed items") with unit tests
- [ ] 3.2 Add `clearCompleted` to `useShoppingList` via `mutate`: success feedback only when at least one item was removed, error feedback on storage failure

## 4. UI

- [ ] 4.1 Add the "Clear completed" control to `ShoppingListPage`, shown only while at least one item is completed, with the confirmation dialog (title, item count in singular/plural, "Cancel" and "Clear"; Cancel, Escape or backdrop closes it without changes)
- [ ] 4.2 Keep accessible names and styling consistent for small screens; return focus sensibly after the dialog closes

## 5. Tests

- [ ] 5.1 Extend `src/test/shopping-list.test.tsx` (unique fake-indexeddb database) for each scenario in the delta spec: visibility, confirmation wording, confirm, cancel, empty result, active items kept, persistence, reactivated-before-confirm, failed storage
- [ ] 5.2 Add an e2e clear-completed flow to `e2e/shopping-list.spec.ts` using `getByLabel`/`getByRole`

## 6. Docs and verification

- [ ] 6.1 Update `README.md` (feature list and any "not built" notes) and docs touched by the change
- [ ] 6.2 Run `npm run check`, `npm run build` and `npm run test:e2e`; report any failed or skipped checks
- [ ] 6.3 Verify with `openspec validate clear-completed-items`, then archive with `openspec archive clear-completed-items`
