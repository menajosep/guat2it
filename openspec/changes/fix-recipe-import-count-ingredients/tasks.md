## 1. Ingredient parsing

- [ ] 1.1 Add exact `count` unit recognition mapped to the existing `whole` unit, retaining the existing name and quantity validation and unresolved fallback.
- [ ] 1.2 Add parser tests for the issue examples, spaced and suffix forms, original source preservation, invalid amounts and names, and partial-token or unsupported inputs; retain existing-unit regression coverage.

## 2. Import and review

- [ ] 2.1 Add a synthetic structured-data import test covering both issue examples and an existing recognized non-count unit.
- [ ] 2.2 Test the review and save flow: original lines remain visible, parsed names and whole-unit amounts are initially confirmed, and saved ingredients contain the reviewed values; verify unresolved input still requires correction or confirmation.

## 3. Verification

- [ ] 3.1 Run the targeted recipe parsing and import/review tests.
- [ ] 3.2 Run `npm run check` and `npm run build`.
- [ ] 3.3 Run `npm run test:e2e` if the UI flow is changed, and report any skipped checks.
