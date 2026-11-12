## 1. Shared quantity support

- [ ] 1.1 Add the stable countable `unit` identifier to the shared catalog and require an amount using the existing quantity rules.
- [ ] 1.2 Add singular and plural unit labels to the English, Spanish and Catalan message catalogs.
- [ ] 1.3 Add domain and formatting tests for valid and invalid amounts, identifier recognition, all three languages and unchanged `whole` quantities.

## 2. Shopping and recipe flows

- [ ] 2.1 Test adding and editing shopping items with the new unit, including validation, display and persistence after reload.
- [ ] 2.2 Test selecting the unit during recipe review and editing, saving, reopening, localized display and missing-amount validation.
- [ ] 2.3 Test that supported `count`, `unidad` and `unidades` imports still map to `whole` and that existing saved quantities remain unchanged.
- [ ] 2.4 Add a browser test covering selection, saving and reload of the new unit in the relevant UI flow.
- [ ] 2.5 Update directly affected user documentation, if needed, to describe the new unit.

## 3. Verification

- [ ] 3.1 Run `npm run check` and `npm run build`.
- [ ] 3.2 Run `npm run test:e2e` for the changed UI flow and report any environment limitations.
