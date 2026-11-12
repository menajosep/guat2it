## Context

The app currently stores shopping items, categories and recipes locally. Weekly
menus are a new feature with their own lifecycle and need a navigation entry,
language-specific labels and a schema upgrade.

## Goals / Non-Goals

**Goals:**

- Create and list local weekly menu records with a name and a calendar start date.
- Preserve existing data and show validation and storage failures explicitly.
- Make the creation flow available in English, Spanish and Catalan.

**Non-Goals:**

- Assigning meals or recipes, editing or deleting menus, sharing, or synchronization.
- Restricting the start date to a particular weekday or disallowing duplicates.

## Decisions

1. Add a dedicated weekly-menus feature with pure validation, a service and a
   storage port, wired to a Dexie adapter in the composition root. This follows
   the existing architecture; embedding new records in shopping items or recipes
   would couple unrelated lifecycles.
2. Store the start as an ISO calendar date (`YYYY-MM-DD`), not a timestamp. Derive
   the initial date from local calendar fields and validate actual calendar dates
   without timezone conversion. A timestamp could shift dates between time zones.
3. Generate the default name in the UI for the selected language. A date change
   always replaces the current name, including a custom name, as explicitly chosen.
   A language change alone preserves typed text. Persist the final name as entered,
   not a translation key, so user-provided names remain unchanged.
4. Add a new database version with a separate table, retaining existing stores.
   Each creation receives its own stable ID, allowing multiple records per date.
   The UI lists persisted records and uses accessible field and storage errors.

## Risks / Trade-offs

- [Accidental custom-name replacement] Date changes intentionally reset the name;
  communicate this near the form and test the behavior.
- [Data upgrade] Test an upgrade from the existing schema with all existing data
  and verify it remains readable.
- [Rollback] Older code may not open a database upgraded to a later version;
  rolling back requires a deliberate data compatibility plan.
