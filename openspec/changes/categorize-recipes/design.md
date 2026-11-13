## Context

Recipes are imported into a review draft, validated and saved locally. The same form edits saved recipes, and the recipes page loads all saved recipes for its graphical list. Existing records have no recipe category. Shopping-list categories are user-defined and serve a different purpose.

## Goals / Non-Goals

**Goals:**

- Support one optional course category on import and edit, including existing recipes.
- Browse all, a single category, or uncategorized recipes while preserving existing recipe workflows.
- Preserve existing data and show category labels in the selected UI language.

**Non-Goals:**

- Manual recipe creation, custom or multiple recipe categories, and automatic category inference from imported pages.
- Changes to shopping-list categories, menu assignment, synchronization, or remote services.

## Decisions

### Fixed category identifiers in the recipe domain

Define ten stable language-independent identifiers and validate the optional category in the domain. Map identifiers to translated labels at the UI boundary. An omitted category means uncategorized; an unrecognized supplied identifier is a validation error, not another category. This avoids persisting translated labels and keeps shopping-list categories independent. A user-managed category table was considered but adds management and migration complexity outside the requested fixed taxonomy.

### Extend the existing recipe and draft

Add the optional category to recipe drafts and saved recipes, preserving it through import, validation, draft conversion, save, update, and reads. Imported drafts start uncategorized rather than guessing from source metadata. Legacy records without the field are treated as uncategorized; existing recipe fields and menu references remain intact. No index or Dexie schema change is needed for an unindexed optional property; if implementation changes the indexed schema, add a new Dexie version and test its upgrade. A mandatory category and bulk classification were rejected to avoid blocking existing recipes and imports.

### Filter the already loaded list

Use an accessible single-select filter on the recipes page with all, each category, and uncategorized choices. Filter the loaded recipe list without changing storage or ordering. Default to all when the page is initialized, retain the current filter when navigating to a recipe and back or reloading the list after an operation, and show a distinct no-matches message when a filter excludes all recipes. Keep the existing empty-library, loading, and error states distinct. This avoids a new storage query or index for a small local collection.

### Reuse existing review and detail flows

Add the same labeled selector to import review and editing, and display the selected category or uncategorized state on the detail view. Keep the filter and selection separate from save state; existing persistence error handling remains responsible for reporting failed saves and updates without claiming success.

## Risks / Trade-offs

- [Legacy records have no category field] → Test a database populated before this change and exercise list, detail, edit, and reload without changing unrelated data.
- [A filter hides a recently saved or edited recipe] → Preserve the selected filter and show a clear no-matches state; the all-recipes option restores visibility.
- [Labels drift from identifiers across languages] → Cover every identifier in typed translation maps and test language switches without changing the saved category.
- [Client-side filtering scales with collection size] → The current app already loads all recipes; defer indexing until justified by real usage.

## Migration Plan

Deploy with backward-compatible reads of records lacking the optional field; no bulk rewrite is required. New and edited records persist the chosen identifier. Test upgrade and reload with legacy data. Rolling back to an older app leaves the extra unindexed field readable by IndexedDB, but an older app that rewrites a recipe can discard its category; users should not rely on category preservation after rollback.

## Open Questions

None.
