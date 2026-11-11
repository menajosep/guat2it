## Context

Imported recipes are stored locally with a stable ID and source URL. The detail view supports deletion, while `RecipeReview` edits an import draft and `RecipeService.save` always creates a new record. The existing domain validator and shopping-list quantity rules already define valid recipe data.

## Goals / Non-Goals

**Goals:**

- Edit saved recipe fields through the existing feature layers without creating a duplicate.
- Preserve the recipe ID, source URL, ingredient order, and all unchanged values.
- Keep invalid or failed edits available for correction or retry.
- Maintain accessible, localized controls and existing import and deletion behavior.

**Non-Goals:**

- Editing the source URL, reimporting, synchronization, version history, or ingredient reordering.
- A new database schema or a generic repository abstraction.

## Decisions

1. Open a prefilled edit draft from recipe detail, reusing the review form and domain validation. Convert stored quantities using the existing amount-to-text helper and treat saved ingredients as confirmed; their original import lines are not stored, so do not present invented source text. Add ingredient removal without changing import review behavior except where explicitly supported. A separate form would duplicate validation and controls.
2. Provide an update use case distinct from create. Validate the draft with the existing rules, preserve the saved ID and source URL, and return a specific missing-recipe result. Use a storage-port update operation that checks existence and writes the complete record in one local transaction, so an absent or concurrently deleted recipe is not recreated. An unconditional `put` or delete-and-create could silently resurrect or duplicate a recipe.
3. Keep the edit draft separate from the selected saved recipe. Cancel returns to unchanged detail; a successful update replaces the displayed selection and refreshes the list. Validation, missing-record, and storage failures retain the draft and expose an accessible localized error. Unlike optimistic mutation, this does not present an unsaved edit as persisted.
4. Preserve source URL from the current stored record rather than accepting an editable draft source. This maintains import provenance; exposing source editing would broaden the import contract beyond the issue.

## Risks / Trade-offs

- [The recipe is deleted while the edit form is open] → Check existence in the update transaction, report it as missing, and retain the draft without recreating the record.
- [Two editors update the same recipe] → The latest successful local update wins; conflict detection is outside this local-only change.
- [A failed write or validation leaves users uncertain] → Keep their draft, identify field errors or announce the relevant failure, and do not claim success.
- [Reuse of import review changes its behavior] → Keep import-specific source and confirmation handling intact and cover both flows with regression tests.

## Migration Plan

No schema migration is required: existing records already contain all editable fields. Deploy the updated application normally; rollback leaves saved recipes readable in the existing format.
