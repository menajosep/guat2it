## 1. Recipe domain and import

- [x] 1.1 Define recipe and review-draft types, validation and shared shopping-item-compatible ingredient rules, with unit tests.
- [x] 1.2 Implement safe Recipe JSON-LD extraction and instruction text conversion with synthetic fixtures for both example page structures and invalid or hostile input.
- [x] 1.3 Implement and test conservative ingredient parsing, retaining unresolved source lines and requiring review.
- [x] 1.4 Define storage ports and implement the import/review use cases, including URL validation and explicit error results.
- [x] 1.5 Enforce and test a pasted page-source size limit before parsing on every platform.
- [x] 1.6 Implement a local Android and iOS streaming plugin with bounded responses, timeouts, disabled automatic redirects and native target validation.
- [x] 1.7 Implement and test a native acquisition adapter that validates every redirect target and reports network, HTTP, redirect and size errors.

## 2. Local persistence

- [x] 2.1 Add a versioned recipe table and a Dexie storage adapter that wraps failures in `PersistenceError`.
- [x] 2.2 Test atomic save, reload, load/save failures and migration from a populated shopping-list and category database.

## 3. User interface

- [x] 3.1 Wire services and the Recipes route and side-menu entry without changing existing navigation behavior.
- [x] 3.2 Implement the localized recipe list and detail views, including empty, load-error, retry and image-unavailable states.
- [x] 3.3 Implement URL-only native import and web URL/page-source paste input, with accessible feedback and instructions.
- [x] 3.4 Implement review, correction, validation, cancel and atomic save for recipe fields and ingredient rows, retaining draft values after a failed save.
- [x] 3.5 Add English, Spanish and Catalan text and accessible names; verify language switching preserves imported content and in-progress drafts.
- [x] 3.6 Use native URL-only import and retain the web paste flow, with localized progress and error feedback and tests.

## 4. Verification and documentation

- [x] 4.1 Add deterministic component and integration tests for paste input, both representative recipe structures, review, errors, persistence, accessibility and navigation.
- [x] 4.2 Add a Playwright web flow covering page-source import, review, save, reload and recipe detail without live network access.
- [x] 4.3 Exercise native URL import on Android (verified by the user); iOS device verification was unavailable and remains unverified.
- [x] 4.4 Update README and architecture/development documentation with recipe scope, platform workflows, local storage and image/network limitations.
- [x] 4.5 Run `npm run check`, `npm run build`, `npm run test:e2e` and `openspec validate import-directoalpaladar-recipes --strict`.
