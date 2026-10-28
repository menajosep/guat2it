# Architecture

Guat2it is a modular monolith: one TypeScript code base, organized by feature, with business rules kept separate from persistence and UI. It currently contains one feature, the shopping list.

## Layers and dependency direction

```
pages / components  ->  hooks  ->  application  ->  domain
                                        ^
infrastructure (Dexie)  ----implements---+
src/app (composition root) wires infrastructure into application
```

| Location                                           | Responsibility                                                                 | May import                                |
| -------------------------------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------- |
| `src/features/shopping-list/domain/`               | Entity type, name validation, creation, rename, completion, ordering. Pure.    | `src/shared`                              |
| `src/features/shopping-list/application/`          | `ShoppingListService` (use cases) and the `ShoppingItemStore` port.            | domain, `src/shared`                      |
| `src/features/shopping-list/infrastructure/`       | `DexieShoppingItemStore`, the port implementation. Wraps failures.             | application, domain, `src/infrastructure` |
| `src/features/shopping-list/hooks/`                | React hooks and context exposing the service and UI state (`useShoppingList`). | application, domain                       |
| `src/features/shopping-list/components/`, `pages/` | Ionic UI. Rendering and interaction only.                                      | hooks, domain types                       |
| `src/infrastructure/persistence/`                  | Shared Dexie `AppDatabase` (schema and versions).                              | domain types                              |
| `src/app/`                                         | `App` shell and routes; `create-services.ts` composition root.                 | everything                                |
| `src/shared/`                                      | `Result`, `PersistenceError`, `generateId`.                                    | nothing                                   |

ESLint forbids `domain/` and `application/` from importing React, Ionic, React Router or Dexie.

## Data flow

1. A component calls an action from `useShoppingList`.
2. The hook calls `ShoppingListService`, which applies domain rules and uses `ShoppingItemStore`.
3. `DexieShoppingItemStore` writes to IndexedDB.
4. The hook re-reads the list from storage and re-renders, so the UI always shows persisted data. It also records the outcome of the operation as feedback (a success message naming the item, or an error message), which `FeedbackToast` shows: success messages disappear on their own, errors stay until dismissed.

Expected failures (invalid names) are `Result` values and are shown next to the field; storage failures are thrown as `PersistenceError` and shown as dismissible feedback with `role="alert"`. Services report what actually changed (the affected item, or `undefined` for a no-op), which is what decides whether a success message is shown.

## Data model

`ShoppingItem { id: string (UUID), name: string (trimmed, 1-100 chars), completed: boolean, createdAt: Date }`.
IndexedDB database `guat2it`, schema version 1, table `shoppingItems` (primary key `id`, index `createdAt`). Changing the schema requires a new `version()` in `app-database.ts`.

## Persistence limits

Data lives in IndexedDB inside each browser or native WebView. It is local to the installation and is **not synchronized** between Android, iOS and web. Mobile WebViews can evict IndexedDB under storage pressure; if that becomes a problem, implement `ShoppingItemStore` with a Capacitor SQLite plugin without touching the domain, service or UI.

## Adding a feature

Create `src/features/<feature>/` with the same sub-folders only when needed, expose its service through the composition root, and start with an OpenSpec change (see [development.md](./development.md)).
