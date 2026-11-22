## 1. Recipe model and services

- [ ] 1.1 Model manual recipes without a source URL and optional pictures, preserving existing website records and draft conversion.
- [ ] 1.2 Add source-aware creation and update validation: manual recipes use the common field and ingredient rules, optional HTTPS picture; website imports retain supported source and required HTTPS picture checks.
- [ ] 1.3 Add domain and service tests for valid and invalid manual fields, optional pictures, unchanged source on edit, and website-import validation regressions.
- [ ] 1.4 Test persistence and reload of manual recipes alongside existing website recipes without a schema migration.

## 2. Manual entry and existing views

- [ ] 2.1 Add a manual-entry action and blank draft using the shared review form, with ingredient add/remove, cancellation and save-error handling.
- [ ] 2.2 Adapt editing and accessible list/detail image fallbacks for recipes without source or picture, and preserve filtering and weekly-menu use.
- [ ] 2.3 Localize new controls and messages in English, Spanish and Catalan and update user documentation.
- [ ] 2.4 Add component and integration tests for creation, invalid input, cancellation, save failure, language changes, reload, editing, picture fallbacks and menu assignment; cover existing import behavior.
- [ ] 2.5 Add a browser test for manual creation, reload and editing without a picture.

## 3. Verification

- [ ] 3.1 Run `npm run check` and `npm run build`.
- [ ] 3.2 Run `npm run test:e2e` for the changed UI flow and report any platform checks that could not be performed.
