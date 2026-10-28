## 1. Spike

- [ ] 1.1 Render an Ionic toast in the app and record the role/aria-live attributes it exposes in jsdom and Chromium; decide whether it satisfies "announced without moving focus" (errors as `role="alert"`) or needs extra attributes or a live region, and note the outcome in design.md

## 2. Domain and application

- [ ] 2.1 Add `withName` to `domain/shopping-item.ts` (reuses `parseItemName`; keeps id, completion state and `createdAt`) with unit tests for trimming, empty, too long and preserved fields
- [ ] 2.2 Add `ShoppingListService.renameItem` and make `setCompleted`, `removeItem` and `renameItem` return what changed (or `undefined` for no-ops/unknown ids); update service tests, including no-op, unknown id and persistence failure cases
- [ ] 2.3 Confirm the Dexie adapter needs no change (upsert via `save`) and that renamed items persist across reloads in its tests

## 3. Hook and feedback

- [ ] 3.1 Move the name-error messages out of `AddItemForm` into a shared module used by the add form and the edit row
- [ ] 3.2 Add feedback message builders (`Added`, `Marked … as completed/active`, `Removed`, `Renamed … to …`) with unit tests
- [ ] 3.3 Extend `useShoppingList` with `renameItem` (returning renamed/unchanged/invalid/failed), `feedback` and `dismissFeedback`; success feedback only when something changed, error feedback from storage failures, newer feedback replaces older, validation errors create no feedback

## 4. UI

- [ ] 4.1 Add the inline edit row to `ShoppingItemList`: "Edit <name>" button, input pre-filled and focused, Save/Cancel, Enter to save, Escape to cancel, inline `role="alert"` error, one row editable at a time, focus returned to the edit button afterwards
- [ ] 4.2 Add the feedback toast to `ShoppingListPage` (auto-dismiss for success, dismissible and persistent for errors) and remove the mutation error banner while keeping the load-failure message and "Try again"
- [ ] 4.3 Keep accessible names consistent (`Edit <name>`, `Remove <name>`, `Save`, `Cancel`) and style the edit row for small screens

## 5. Tests

- [ ] 5.1 Extend `src/test/shopping-list.test.tsx` (unique fake-indexeddb database) for each rename and feedback scenario in the delta spec, including failed storage with the editor staying open
- [ ] 5.2 Add an e2e rename flow and a success-message check to `e2e/shopping-list.spec.ts` using `getByLabel`/`getByRole`

## 6. Docs and verification

- [ ] 6.1 Update `README.md`: remove the "Items cannot be edited" limitation, replace the "Next recommended step" note, and mention rename and feedback in the feature list; update docs touched by the change
- [ ] 6.2 Run `npm run check`, `npm run build` and `npm run test:e2e`; report any failed or skipped checks
- [ ] 6.3 Verify with `openspec validate rename-item-and-feedback`, then archive with `openspec archive rename-item-and-feedback`
