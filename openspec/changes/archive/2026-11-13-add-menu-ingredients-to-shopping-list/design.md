## Context

The selected weekly menu is app-session state. Assignments reference saved recipes and can place the same recipe in multiple slots. Shopping items can have duplicate names, optional quantities, categories and completion state. Both recipes and shopping items use the same validated quantity model: positive amounts up to 9999.99 with at most two decimal places, counted units, vague units and no quantity.

The existing shopping-list service writes one item at a time. Calling it repeatedly would permit partial transfers and would not protect a review from concurrent edits.

## Goals / Non-Goals

**Goals:**

- Review and atomically transfer all ingredients from one selected menu, once per assignment.
- Aggregate matching active list items without losing quantities, categories or concurrent changes.
- Request a unit choice for mixed units and explicit final quantities where the data cannot be combined safely.
- Keep the feature local, accessible and localized.

**Non-Goals:**

- Changing recipe yields or scaling servings, ingredient synonym matching, inventory tracking, undo, synchronization, or automatically updating the list when menus change.
- Silently estimating density, container sizes, ingredient counts or other conversions dependent on context.

## Decisions

1. **Explicit review and confirmation.** Offer the action for the currently selected menu on Weekly menus. Build a review from its assignments, recipe ingredients and current shopping items. Display each contribution, proposed total, mixed-unit choices and required manual resolutions before the user confirms. An empty menu yields an informative no-op; canceling or leaving the view performs no write. A subsequent confirmed transfer adds the menu again, rather than trying to infer whether it was sent previously. This avoids surprising repeated additions without introducing transfer history or automatic synchronization.
2. **Identity and retained data.** Match names after trimming and Unicode lowercase conversion; do not infer synonyms, singular/plural forms or collapse internal whitespace. Group only ingredients present in the menu with matching active list records. Completed items and unrelated active items are untouched. For several matching active records, retain the earliest `createdAt` record (break ties by ID), its ID, creation time and spelling, union all their category IDs, and remove the other matching active records as part of the transfer. With no existing match, use the first ingredient's saved spelling and create an active, uncategorized item. Use a deterministic assignment order (day, meal, recipe ID) and recipe ingredient order to identify that first occurrence. An item rendered in multiple categories is still one record and is counted once.
3. **Amounts and units.** Count every assignment independently, with recipe amounts as stored. Sum same-unit numeric amounts exactly in hundredths, not floating-point increments. When a group has different unit IDs, require the user to select a target unit. Support exact conversions within mass (`gram`, `kilogram`, `pound`) and within metric volume (`milliliter`, `liter`); treat other differing unit IDs as incompatible, including `whole` and `unit`. Use exact conversion factors and only propose a numeric total if the result is positive, representable with at most two decimals and no greater than the existing 9999.99 limit. Missing or vague quantities, incompatible units, unrepresentable precision or overflow require the user to enter and confirm a valid final quantity, with the original contributions visible. The final quantity follows existing shopping-list validation; no quantity is silently dropped, rounded, relabeled or converted using guessed densities. The user can choose another unit or explicitly supply the final quantity. This is safer than adding numeric values with different units or pretending a vague quantity is zero.
4. **Snapshot and atomic commit.** Add a dedicated application use case and storage port in the relevant feature, wired at the composition root. Keep aggregation and validation pure and storage-independent; a Dexie adapter obtains a consistent read snapshot of the menu, assignments, referenced recipes, shopping items and categories. At confirmation, one write transaction spanning these tables rechecks the reviewed source snapshot and applies all shopping-item updates, additions and removals, or none. A changed menu, assignment, recipe ingredient, relevant shopping item or category invalidates the review; report the change and require a fresh review rather than silently recalculating the user's choices. A missing referenced recipe is an explicit error. Overlap transactions with assignment, recipe, menu, shopping and category writes so checks and writes cannot race. Existing shopping-item edits and completion changes currently read and write separately: protect their writes against a changed or removed original record (or make their read-modify-write atomic) so an operation started before a transfer cannot overwrite or recreate a merged item afterward. Report conflicts rather than silently dropping an edit. Do not hold a transaction open while awaiting user interaction. A schema upgrade is not needed.
5. **Feedback and page lifecycle.** Use existing localized catalogs and accessible controls; show exact conflicts and field errors, a success summary only after commit, and specific missing/stale/storage errors without success-shaped fallbacks. Guard duplicate confirmations. Keep the target menu ID captured for the review, close the unconfirmed review on view leave or selection change, and ensure the shopping-list page reloads on entry so the persisted result is visible. A language change alone preserves review input and localizes the interface without changing saved names.

## Risks / Trade-offs

- **Existing duplicate entries** → Deterministically retain one active record, union categories and test that completed/unrelated records are unchanged.
- **Unclear or nonrepresentable quantities** → Require an explicit final quantity and show every source; do not guess or silently discard data.
- **Concurrent edits while reviewing** → Recheck the snapshot inside an overlapping write transaction; reject stale reviews without partial writes.
- **Storage failure during a bulk update** → Exercise rollback at multiple write stages and report the failure while keeping the review available for retry.
- **Large ingredient collections or many conflicts** → Present a review with clearly identified groups and accessible controls; do not persist a partial selection.

## Migration Plan

No persisted schema changes or migration are planned. Existing menus, recipes, categories and shopping items remain valid. Rolling back removes the transfer action but leaves already transferred shopping items as ordinary local items.

## Open Questions

None.
