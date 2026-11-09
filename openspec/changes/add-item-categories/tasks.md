## 1. Domain and application

- [ ] 1.1 Model categories, category-name validation and optional distinct item assignments; preserve assignments when editing other item details.
- [ ] 1.2 Define application operations and storage ports for category management and assignment, including duplicate, in-use and missing-category outcomes.
- [ ] 1.3 Add domain and service tests for validation, category management, assignment, no-ops and preservation of existing item details.

## 2. Persistence

- [ ] 2.1 Add a versioned category schema and preserve existing version 1 items as uncategorized.
- [ ] 2.2 Implement atomic category deletion and item assignment checks, duplicate-name handling and persistence error reporting; wire services at the composition root.
- [ ] 2.3 Test migration, reload, storage failures and concurrent deletion and assignment using isolated databases.

## 3. User interface

- [ ] 3.1 Add accessible category create, rename and delete controls with validation and in-use feedback.
- [ ] 3.2 Add multiple-category selection to item creation and editing, including cancellation and save-error handling.
- [ ] 3.3 Group items by category and uncategorized status; synchronize repeated appearances and count unique completed items.
- [ ] 3.4 Localize category controls, validation and feedback in English, Spanish and Catalan.
- [ ] 3.5 Add component tests for category management, assignment, grouping, repeated-item actions, errors and language changes.

## 4. Documentation and verification

- [ ] 4.1 Update README and architecture documentation for categories, grouping, persistence and migration.
- [ ] 4.2 Add Playwright coverage for category management, multiple assignment, grouped actions and reload persistence.
- [ ] 4.3 Run `npm run check`, `npm run build` and `npm run test:e2e`; resolve failures and report any unavailable checks.
