## 1. Update behavior

- [ ] 1.1 Convert saved recipes to editable drafts, preserving quantities and order and avoiding invented import source text.
- [ ] 1.2 Add a validated update use case and storage port that preserve recipe identity and stored source URL and explicitly report missing recipes.
- [ ] 1.3 Implement atomic update-if-present in the local persistence adapter and wrap storage failures using the existing persistence error pattern.

## 2. Editing interface

- [ ] 2.1 Add localized edit, ingredient removal, and update failure messages in English, Spanish, and Catalan.
- [ ] 2.2 Add an edit action to recipe detail and reuse the review form for prefilled edits, including ingredient addition and removal and unchanged cancel behavior.
- [ ] 2.3 On successful update show the saved detail and refreshed list; on validation, missing-recipe, or persistence failure retain the draft and show accessible errors.
- [ ] 2.4 Update relevant user-facing recipe documentation.

## 3. Tests

- [ ] 3.1 Test draft conversion and validation, successful update with preserved identity and source, missing records, atomic update behavior, and persistence failures.
- [ ] 3.2 Test editing all fields, ingredient addition and removal, cancel, invalid data, missing records, storage errors, language changes, and unchanged import and deletion flows.
- [ ] 3.3 Add browser coverage for editing, cancellation, and persistence after reload.

## 4. Verification

- [ ] 4.1 Run targeted recipe unit, component, and browser tests.
- [ ] 4.2 Run `npm run check` and `npm run build`.
- [ ] 4.3 Run `npm run test:e2e` for the recipe editing UI flow and report any skipped checks.
