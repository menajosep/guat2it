---
applyTo: '**/*.test.{ts,tsx},e2e/**/*.ts'
---

- Test observable behavior (what the user or caller sees), not implementation details; avoid snapshot tests.
- Give every test its own uniquely named Dexie database (fake-indexeddb is loaded in `src/test/setup.ts`); never depend on existing data.
- Use fixed ids and dates for deterministic data.
- Use `userEvent` and `waitFor`/`findBy*` for asynchronous UI; do not use arbitrary sleeps.
- Playwright tests run against the production build (`npm run test:e2e`) and use accessible locators.
