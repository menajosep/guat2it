## 1. Taxonomy and recipe lifecycle

- [x] 1.1 Define the five-facet fixed taxonomy and stable label identifiers in the recipe domain, and validate uniqueness and supported values.
- [x] 1.2 Extend recipe and draft types, draft conversion, import initialization, validation, save, and update to carry labels without changing course categories or unrelated fields.
- [x] 1.3 Add domain and service tests for all taxonomy values, multiple selections, empty and legacy labels, invalid and duplicate identifiers, import initialization, and edit/save/cancel behavior.
- [x] 1.4 Add persistence tests for old unlabeled recipes, labeled save/update/reload, existing course categories and menu assignments, and storage failures; add a schema version and upgrade tests only if indexed schema changes.

## 2. Presentation and localization

- [x] 2.1 Add exhaustive English, Spanish, and Catalan translations for facets, values, controls, empty states, errors, and user-assigned dietary/allergen safety guidance, with translation coverage tests.
- [x] 2.2 Add accessible grouped label selection to import review and editing, including validation and retained drafts on errors; display grouped labels or the unlabeled state in recipe details.
- [x] 2.3 Add tests for selecting and removing labels, editing and canceling, persistence errors, safety guidance, and switching language without losing selections or saved values.

## 3. Browsing and filtering

- [x] 3.1 Implement grouped multi-select label filter state and matching: OR within a facet, AND across facets, combined with the existing course-category filter.
- [x] 3.2 Add accessible, responsive filter controls and clear-all action; preserve filters across navigation and operation reloads, retain existing order and actions, and distinguish no matches from empty, loading, and error states.
- [x] 3.3 Test matching, clearing, category composition, unlabeled recipes, no matches, return after edits, reloads, language changes, and keyboard and narrow-screen usability.
- [x] 3.4 Add a Playwright flow covering import or edit, filtering across facets and category, filter clearing, and persistence after reload.

## 4. Documentation and verification

- [x] 4.1 Update affected user and developer documentation to describe label assignment, filter semantics, and user-assigned dietary/allergen labels.
- [x] 4.2 Run `npm run check`, `npm run build`, and `npm run test:e2e`; address regressions and report any unavailable checks.
- [x] 4.3 Make each label facet individually collapsible in recipe forms and filters, initially collapsed, with localized selected counts; test expand/collapse, retained selections, responsive layout, and keyboard access.
- [x] 4.4 Make the entire recipe filter section collapsible and initially collapsed, with a localized count of active category and label filters; verify selections survive collapse and expansion.
