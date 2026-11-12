## 1. Localized unit ordering

- [x] 1.1 Sort a copy of the unit IDs by localized labels in the shared quantity selector; keep the no-unit option first and preserve unit values.
- [x] 1.2 Update any catalog documentation that incorrectly describes display order and update user documentation as needed.

## 2. Tests

- [x] 2.1 Test all unit choices are alphabetically ordered in English, Spanish and Catalan, including accented labels and the no-unit option.
- [x] 2.2 Test that changing language preserves selected unit and typed amount in shopping and recipe forms, and test persistence after saving.
- [x] 2.3 Add browser coverage for sorting and language changes in the relevant UI flow.

## 3. Verification

- [x] 3.1 Run `npm run check` and `npm run build`.
- [x] 3.2 Run `npm run test:e2e` for the changed UI flow.
