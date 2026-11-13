## Why

The existing course category helps organize recipes by course, but it does not help users find recipes by ingredient, cooking method, dietary preference, cuisine, or occasion. Issue #34 requests labels and filtering along these facets so a growing recipe library is easier to browse.

## What Changes

- Offer the fixed label values from issue #34 in five independent facets, allowing any number of labels per recipe.
- Let users select and remove labels in import review and saved-recipe editing, and display saved labels in recipe details.
- Add multi-select label filters to recipe browsing: selected values within a facet match any, and selected facets must all match. Combine these filters with the existing course-category filter.
- Store language-independent identifiers locally, translate the controls and labels into all supported languages, and preserve existing recipes and menu assignments.
- Keep labels user-assigned; do not infer dietary or allergen safety, create custom labels, or change shopping-list categories.

## Capabilities

### New Capabilities

- `recipe-labels`: Assign, display, persist, localize, and filter recipes by fixed labels across five facets.

### Modified Capabilities

None.

## Impact

- Recipe domain validation, import drafts, editing, local persistence, detail and list views, filtering, translations, and associated tests.
- Existing recipes without labels remain valid and the separate course-category and menu workflows remain intact.
- No backend, synchronization, or new dependency is anticipated.
