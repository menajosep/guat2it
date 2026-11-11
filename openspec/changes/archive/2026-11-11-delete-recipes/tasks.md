## 1. Deletion behavior

- [x] 1.1 Add recipe deletion to the application service and storage port, including explicit handling of a recipe that no longer exists.
- [x] 1.2 Implement deletion in the local persistence adapter and wrap storage failures using the existing persistence error pattern.
- [x] 1.3 Add localized delete, confirmation, cancel, and failure messages in English, Spanish, and Catalan.
- [x] 1.4 Add a confirmed delete action to recipe detail; cancel leaves data untouched, success returns to the updated list, and failure keeps the recipe visible with an accessible error.

## 2. Tests

- [x] 2.1 Test service and storage behavior for successful deletion, missing recipes, and persistence failures.
- [x] 2.2 Test the user flow: confirmation cancel preserves the recipe; confirming deletes it from the list; a deletion failure is announced without falsely removing it.

## 3. Verification

- [x] 3.1 Run targeted recipe unit, component, and browser tests.
- [x] 3.2 Run `npm run check` and `npm run build`.
- [x] 3.3 Run `npm run test:e2e` for the recipe deletion UI flow and report any skipped checks.
