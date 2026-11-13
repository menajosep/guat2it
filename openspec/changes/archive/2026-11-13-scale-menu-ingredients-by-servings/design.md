## Context

Weekly menus currently store only an ID, name and start date. Recipes already store a positive numeric yield, including decimal values. Menu transfer groups every assignment's saved ingredients with matching active shopping items; its exact rational unit conversion requires a final positive quantity of at most 9999.99 with at most two decimals, or explicit user resolution. Review and commit use a snapshot and an overlapping database transaction to detect changes and prevent partial writes.

## Goals / Non-Goals

**Goals:**

- Capture and edit a menu's serving count, including an explicit path for existing menus.
- Scale every assignment against its recipe yield, retaining exact arithmetic and the existing review, conflict and atomicity guarantees.
- Preserve existing data, localization and accessibility.

**Non-Goals:**

- Changing recipe yields, ingredient records, shopping-list quantity limits or conversion factors.
- Guessing missing amounts or yields, rounding automatically, tracking transfer history, or syncing devices.

## Decisions

1. **Explicit serving count and legacy state.** Store a positive safe integer on new menus, with a blank required creation input. Represent pre-existing records without a count as an explicit unknown state rather than treating absence as a value; identify it in the UI and require a saved value before reviewing a nonempty transfer. Permit editing the count on any saved menu. Restricting counts to safe integers avoids imprecise JavaScript values. Automatically assigning 1 or 2 was rejected because neither reflects the user's intent.
2. **Schema and update safety.** Add a new Dexie version and migrate existing menus to a documented unknown representation without changing IDs, dates, names or assignments; never replace an existing valid count during upgrade. Keep legacy state in the storage/domain types rather than using an unchecked cast. A dedicated update operation validates the draft and updates only the serving count in an atomic transaction that checks the menu still exists; it must not use an upsert that recreates a deleted menu. Refresh both the menu list and active-menu session state after a successful edit. Handle failed updates and concurrent deletion explicitly.
3. **Exact rational scaling.** Extend the pure transfer calculation to multiply each recipe contribution by menu servings / recipe yield; shopping contributions use factor 1. Convert stored numeric values to exact decimal rationals, including exponential notation from finite JavaScript number serialization, and reuse or extend the existing bigint rational unit conversion and summation. Never round individual contributions; apply precision and size validation only to the final target-unit total. Preserve original values and scaling metadata for review, displaying an exact fraction or other unambiguous exact representation if the scaled contribution has a repeating decimal. An invalid saved yield is an explicit review error. Floating-point multiplication with per-contribution rounding was rejected because it can change totals.
4. **Review and conflict handling.** Show menu servings, recipe yield, original and scaled contribution per assignment, and unscaled existing list quantities. Keep manual final-quantity entry and compatible unit choice for missing, vague, incompatible, overflow or nonrepresentable totals. Include the serving count and full recipe yield in the snapshot signature; validate them again inside the existing commit transaction. A count edit must overlap that transaction so a review made before the edit either commits before it or is rejected as stale. Preserve all existing cancellation, duplicate-confirmation, failure and retry semantics.
5. **UI lifecycle.** Place count entry in creation and an accessible saved-menu edit control, making the legacy prerequisite clear from transfer. Retain drafts on language changes and save failures, and handle selection changes or navigation consistently with existing review behavior. Show localized, specific errors; do not silently substitute a yield or count.

## Risks / Trade-offs

- **Legacy menus lack a known count** → preserve an explicit unknown state and require user input before a nonempty transfer.
- **Repeating fractions or large intermediate values** → use exact rational arithmetic; validate the final quantity and ask for an explicit result when necessary.
- **Menu editing races with transfer or deletion** → use overlapping transactional checks and test stale reviews and missing-menu edits.
- **Older data may contain invalid recipe yields** → report the affected recipe and refuse transfer rather than divide by an invalid value.

## Migration Plan

Upgrade local databases using the next schema version while preserving existing records and assignments. Existing menus acquire an unknown count until the user supplies one. No existing shopping list or recipe data is rewritten. Rolling back application code must not be assumed to downgrade an IndexedDB schema; preserve a backup and test the project's supported downgrade/recovery procedure before deployment.

## Open Questions

None.
