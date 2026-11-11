## 1. Recipe domain and import

- [ ] 1.1 Define recipe and review-draft types, validation and shared shopping-item-compatible ingredient rules, with unit tests.
- [ ] 1.2 Implement safe Recipe JSON-LD extraction and instruction text conversion with synthetic fixtures for both example page structures and invalid or hostile input.
- [ ] 1.3 Implement and test conservative ingredient parsing, retaining unresolved source lines and requiring review.
- [ ] 1.4 Define acquisition and storage ports and implement the import/review use cases, including URL validation and explicit error results.
- [ ] 1.5 Implement and test native HTTP acquisition with timeout, response-size limits and validation before every redirect; verify the platform API can enforce these requirements.

## 2. Local persistence

- [ ] 2.1 Add a versioned recipe table and a Dexie storage adapter that wraps failures in `PersistenceError`.
- [ ] 2.2 Test atomic save, reload, load/save failures and migration from a populated shopping-list and category database.

## 3. User interface

- [ ] 3.1 Wire services and the Recipes route and side-menu entry without changing existing navigation behavior.
- [ ] 3.2 Implement the localized recipe list and detail views, including empty, load-error, retry and image-unavailable states.
- [ ] 3.3 Implement platform-specific import input, including URL entry on native and URL plus page-source paste on web, with accessible feedback.
- [ ] 3.4 Implement review, correction, validation, cancel and atomic save for recipe fields and ingredient rows, retaining draft values after a failed save.
- [ ] 3.5 Add English, Spanish and Catalan text and accessible names; verify language switching preserves imported content and in-progress drafts.

## 4. Verification and documentation

- [ ] 4.1 Add deterministic component and integration tests for native and web input, both representative recipe structures, review, errors, persistence, accessibility and navigation.
- [ ] 4.2 Add a Playwright web flow covering page-source import, review, save, reload and recipe detail without live network access.
- [ ] 4.3 Exercise native URL import on Android and iOS, including redirects and failure handling; report any unavailable device verification explicitly.
- [ ] 4.4 Update README and architecture/development documentation with recipe scope, platform workflows, local storage and image/network limitations.
- [ ] 4.5 Run `npm run check`, `npm run build`, `npm run test:e2e` and `openspec validate import-directoalpaladar-recipes --strict`.
