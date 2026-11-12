## 1. Domain and persistence

- [x] 1.1 Add weekly-menu domain validation for names and real calendar dates, plus tests including local-date and leap-year boundaries.
- [x] 1.2 Add the weekly-menu service and storage port, with duplicate-date and failure tests.
- [x] 1.3 Add the Dexie adapter and a new database version, with tests for persistence, failures and preservation of existing version-3 data.

## 2. User interface

- [x] 2.1 Wire the service, page and localized navigation into the application.
- [x] 2.2 Implement localized creation and list views, date-driven default names, validation, retries and save failures.
- [x] 2.3 Add UI tests for default and custom names, date and language changes, validation, duplicate dates, reload and failures.
- [x] 2.4 Add Playwright coverage of creation, navigation and reload.
- [x] 2.5 Update affected user and architecture documentation.

## 3. Verification

- [x] 3.1 Run `npm run check` and `npm run build`.
- [x] 3.2 Run `npm run test:e2e`.
