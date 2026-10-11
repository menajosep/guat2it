## 1. Tooling

- [x] 1.1 Configure Vite, strict TypeScript, ESLint, Prettier, Vitest and Playwright
- [x] 1.2 Configure Capacitor (`capacitor.config.ts`) with a placeholder app ID
- [x] 1.3 Add npm scripts and a GitHub Actions workflow that call them

## 2. Shopping-list slice

- [x] 2.1 Implement domain rules (name validation, creation, completion, ordering)
- [x] 2.2 Implement the storage port and `ShoppingListService`
- [x] 2.3 Implement the Dexie database and `DexieShoppingItemStore` with `PersistenceError` wrapping
- [x] 2.4 Implement the page, form, list, hook and app shell

## 3. Tests

- [x] 3.1 Domain and service unit tests
- [x] 3.2 Dexie store tests against fake-indexeddb
- [x] 3.3 UI flow tests (add, complete, remove, validation, reload, load failure)
- [x] 3.4 Playwright smoke test

## 4. Documentation and agent setup

- [x] 4.1 Write README, docs/architecture.md and docs/development.md
- [x] 4.2 Write `.github/copilot-instructions.md` and scoped instruction files
- [x] 4.3 Configure `openspec/config.yaml`

## 5. Verification

- [x] 5.1 Run `npm run check`, `npm run build` and `npm run test:e2e`
- [x] 5.2 Validate and archive this change
