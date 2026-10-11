## Context

Greenfield repository. Two users on Android and iOS, plus a web build. The product will grow into recipes, a weekly planner, and eventually multi-device sync, so the foundation must not block those, but none of them are built now.

## Goals / Non-Goals

**Goals:**

- One TypeScript/React code base for web, Android and iOS.
- Clear separation of domain rules, application logic, persistence and UI so domain behavior is testable without a browser.
- Local-only persistence that survives reloads.

**Non-Goals:**

- Backend, authentication, synchronization, recipes, meal planning, categories.
- Verified native builds (requires Android SDK / macOS + Xcode).

## Decisions

- **Feature-oriented modular monolith.** `src/features/shopping-list/{domain,application,infrastructure,hooks,components,pages}`. Alternative: layer-first folders; rejected because features will grow independently.
- **Storage port + Dexie adapter.** `application/ShoppingItemStore` is the only persistence contract the service sees; `DexieShoppingItemStore` implements it and wraps every failure in `PersistenceError`. No generic repository framework.
- **Composition root in `src/app/create-services.ts`.** The UI receives a `ShoppingListService` through a React context; no DI framework or global state library. Components read state through `useShoppingList`, which re-reads from storage after each mutation so the UI reflects persisted data.
- **Ionic 9 with React Router 6.** `@ionic/react-router` 9 requires `react-router(-dom)` 6, so React Router 7 is not used.
- **TypeScript 6.0.** `typescript-eslint` does not yet support TypeScript 7.
- **Item model:** `{ id: string (UUID), name: string, completed: boolean, createdAt: Date }`. Names are trimmed, 1–100 characters.
- **Dexie database `guat2it`**, table `shoppingItems` keyed by `id`, indexed by `createdAt`.

## Risks / Trade-offs

- [Mobile WebViews may evict IndexedDB under storage pressure] → Documented; migrate to a SQLite Capacitor plugin behind the same `ShoppingItemStore` port if it becomes a problem.
- [Ionic web components under jsdom need a browser build of `@lit/react`] → Vitest alias in `vite.config.ts`; Playwright smoke test covers the real browser.
- [`npm audit` reports moderate advisories in React Router 6 and the Capacitor CLI's dev-only dependencies] → React Router issues concern SSR hydration and redirect handling that this client-only app does not use; upgrade when Ionic supports React Router 7.
