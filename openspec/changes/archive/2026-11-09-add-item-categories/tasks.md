## 1. Domain and application

- [x] 1.1 Model categories, category-name validation and optional distinct item assignments; preserve assignments when editing other item details.
- [x] 1.2 Define application operations and storage ports for category management and assignment, including duplicate, in-use and missing-category outcomes.
- [x] 1.3 Add domain and service tests for validation, category management, assignment, no-ops and preservation of existing item details.

## 2. Persistence

- [x] 2.1 Add a versioned category schema and preserve existing version 1 items as uncategorized.
- [x] 2.2 Implement atomic category deletion and item assignment checks, duplicate-name handling and persistence error reporting; wire services at the composition root.
- [x] 2.3 Test migration, reload, storage failures and concurrent deletion and assignment using isolated databases.

## 3. User interface

- [x] 3.1 Add accessible category create, rename and delete controls with validation and in-use feedback.
- [x] 3.2 Add multiple-category selection to item creation and editing, including cancellation and save-error handling.
- [x] 3.3 Group items by category and uncategorized status; synchronize repeated appearances and count unique completed items.
- [x] 3.4 Localize category controls, validation and feedback in English, Spanish and Catalan.
- [x] 3.5 Add component tests for category management, assignment, grouping, repeated-item actions, errors and language changes.

## 4. Documentation and verification

- [x] 4.1 Update README and architecture documentation for categories, grouping, persistence and migration.
- [x] 4.2 Add Playwright coverage for category management, multiple assignment, grouped actions and reload persistence.
- [x] 4.3 Run `npm run check`, `npm run build` and `npm run test:e2e`; resolve failures and report any unavailable checks.
