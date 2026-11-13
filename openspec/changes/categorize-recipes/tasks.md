## 1. Recipe category model

- [ ] 1.1 Define the ten stable recipe course identifiers and optional-category validation in the recipe domain, separate from shopping-list categories.
- [ ] 1.2 Carry the category through imported drafts, recipe validation, saved recipes, and conversion back to an edit draft; default imports and legacy records to uncategorized.
- [ ] 1.3 Add domain and service tests for all supported categories, absent and invalid values, import, save, update, and draft conversion.

## 2. Persistence compatibility

- [ ] 2.1 Preserve recipe categories through local store save, update, list, and get; use a new Dexie version only if an indexed schema change is needed.
- [ ] 2.2 Test category persistence and reload, a pre-change database with recipes and menu assignments, editing legacy records, and failed saves without data loss.

## 3. Recipe interface

- [ ] 3.1 Add localized category names, all-recipes and uncategorized choices, filter and form labels, no-matches text, and validation messages in English, Spanish, and Catalan.
- [ ] 3.2 Add an accessible optional category selector to import review and editing, and display the category or uncategorized state in recipe details.
- [ ] 3.3 Add the accessible recipe-list filter, preserve it across recipe navigation and list refreshes, and distinguish an empty library from no matches.
- [ ] 3.4 Add component tests for selection, clearing, cancellation, failures, category filtering, no matches, preserved navigation and actions, and language switching without losing selections.

## 4. Documentation and verification

- [ ] 4.1 Update user documentation to describe recipe categories, filtering, and uncategorized existing recipes.
- [ ] 4.2 Add browser coverage for importing, categorizing, filtering, editing, and reloading a recipe, including uncategorized browsing.
- [ ] 4.3 Run `npm run check`, `npm run build`, and `npm run test:e2e`; resolve failures without weakening tests.
