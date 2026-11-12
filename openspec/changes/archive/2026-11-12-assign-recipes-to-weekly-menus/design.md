## Context

Weekly menus store an ID, name and start date; recipes have independent IDs and
can currently be edited or deleted. Assignments link both features and must remain
consistent even if multiple app instances write to the same local database.

## Goals / Non-Goals

**Goals:**

- Support selecting a menu, assigning saved recipes to seven days and two meals,
  showing each slot, and removing an assignment.
- Preserve existing data, recipe edits and local-only operation.
- Prevent duplicate assignments and prevent deletion of a referenced recipe.

**Non-Goals:**

- Persisting the active menu selection, editing menu names or dates, assigning
  unsaved recipes, generating shopping lists, or synchronizing across devices.

## Decisions

1. Keep the active menu ID in app-level in-memory state, shared across the menu
   and Recipes screens. Switching screens keeps the selection; reloading or
   restarting requires a new selection. Persistent selection was rejected because
   the user explicitly chose session-only selection.
2. Store assignments separately using stable menu and recipe IDs, a day offset
   from the menu start (0–6), and a `lunch`/`dinner` identifier. Use a unique
   compound key or index for menu, day, meal and recipe. This allows different
   recipes in a slot and one recipe in other slots, without duplicating recipe
   data or modifying pre-existing menu records.
3. Perform assignment creation and recipe deletion in overlapping database
   transactions covering assignments and recipes; creation also checks the menu.
   Return expected duplicate, missing and in-use results explicitly. A UI-only
   check would race another tab and could produce dangling references. The
   confirmed slot contents should be obtained within the successful write
   transaction so an independent post-save read failure cannot disguise a
   successful write as a failure.
4. Resolve recipe titles from current recipe records, so editing a recipe updates
   its displayed name in menus. Show storage and missing-reference errors instead
   of silently hiding data. Block deletion with a specific explanation and let
   users remove assignments from the menu; snapshots or cascading deletion were
   rejected based on the user's choice.
5. Derive seven chronological calendar days from the menu's start date using
   calendar arithmetic independent of the local timezone. Display localized day
   and meal labels, including across month, leap-year and year boundaries. The
   day offset avoids requiring dates beyond the existing start-date range to be
   stored as new start dates.

## Risks / Trade-offs

- [Concurrent changes] IndexedDB transactions and a unique key enforce the
  reference and duplicate invariants; tests must exercise competing writes.
- [Accidental removal] Use a clearly named accessible remove action and update
  the displayed slot only after storage succeeds.
- [Upgrade and rollback] Add a new schema version without altering existing
  data; test version-4 upgrades. Older releases may not open the upgraded
  database, so rollback needs an explicit compatibility plan.
- [Calendar boundaries] Test seven-day derivation for non-Monday starts, leap
  days, years below 100 and the existing start-date range's upper boundary.
