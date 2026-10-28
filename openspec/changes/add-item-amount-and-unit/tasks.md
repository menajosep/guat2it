## 1. Domain

- [ ] 1.1 Add `domain/units.ts` with the unit catalogue from design.md (stable id, singular and plural label, `takesAmount`) and a unit test that every unit has labels and that only `to-taste` and `a-bit` take no amount
- [ ] 1.2 Add optional `amount` and `unit` to `ShoppingItem`; add `parseQuantity` (amount parsing with `.`/`,`, positive, max 9999.99, two decimals; unit/amount dependency rules) and `formatQuantity` (singular for 1, plural otherwise) with unit tests for every rule and error
- [ ] 1.3 Extend item creation and `withName` into item construction/update that takes raw name, amount and unit, returns name errors and quantity errors separately, and omits cleared amount/unit; unit tests

## 2. Application and persistence

- [ ] 2.1 Make `ShoppingListService.addItem` accept amount and unit and replace `renameItem` by `updateItem` (returns `{ previous, item }` or `undefined` when nothing changed); update service tests, including no-op, unknown id and persistence failure
- [ ] 2.2 Confirm the Dexie adapter and schema need no change; add an adapter test that amount and unit round-trip, that clearing removes them, and that records stored without them load unchanged

## 3. Hook and messages

- [ ] 3.1 Add quantity validation messages (`Choose a unit for the amount.`, `Enter an amount for this unit.`, invalid/too-large amount) and the `Updated <name>` feedback builder to `messages.ts` with unit tests
- [ ] 3.2 Extend `useShoppingList` `addItem` and rename/update to pass amount and unit, return quantity errors as validation outcomes (no feedback) and choose `Renamed … to …` vs `Updated …`

## 4. UI

- [ ] 4.1 Add the "Amount" input and "Unit" select to `AddItemForm` (disable and clear the amount for units that take none; announce errors with `role="alert"`; clear fields after success)
- [ ] 4.2 Add the same fields, pre-filled, to `EditItemForm`; keep the editor open on validation or storage errors; Escape and Cancel discard changes
- [ ] 4.3 Show the formatted quantity next to the name in `ShoppingItemList`, including for completed items; row control names keep using the item name only
- [ ] 4.4 UI tests in `src/test/` for every scenario in the delta spec (add, display, edit, errors, feedback, persistence across reload with a uniquely named fake-indexeddb database)
- [ ] 4.5 Add a Playwright flow in `e2e/`: add an item with amount and unit, edit it, reload and see it persisted

## 5. Docs and verification

- [ ] 5.1 Update `README.md` (feature list and any limitation notes) for amount and unit
- [ ] 5.2 Run `openspec validate add-item-amount-and-unit` and `npm run spec:validate`
- [ ] 5.3 Run `npm run check` and `npm run build`
- [ ] 5.4 Run `npm run test:e2e`
