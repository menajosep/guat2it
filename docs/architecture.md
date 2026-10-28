# Architecture

Guat2it is a modular monolith: one TypeScript code base, organized by feature, with business rules kept separate from persistence and UI. It currently contains two features: the shopping list and the interface language.

## Layers and dependency direction

```
pages / components  ->  hooks  ->  application  ->  domain
                                        ^
infrastructure (Dexie)  ----implements---+
src/app (composition root) wires infrastructure into application
```

| Location                                           | Responsibility                                                                                                                                                                                                                                    | May import                                |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `src/features/shopping-list/domain/`               | Entity type, name validation, creation, rename, completion, ordering. Pure.                                                                                                                                                                       | `src/shared`                              |
| `src/features/shopping-list/application/`          | `ShoppingListService` (use cases) and the `ShoppingItemStore` port.                                                                                                                                                                               | domain, `src/shared`                      |
| `src/features/shopping-list/infrastructure/`       | `DexieShoppingItemStore`, the port implementation. Wraps failures.                                                                                                                                                                                | application, domain, `src/infrastructure` |
| `src/features/shopping-list/hooks/`                | React hooks and context exposing the service and UI state (`useShoppingList`).                                                                                                                                                                    | application, domain                       |
| `src/features/shopping-list/components/`, `pages/` | Ionic UI. Rendering and interaction only.                                                                                                                                                                                                         | hooks, domain types                       |
| `src/features/language/`                           | Supported languages and detection (`domain`), `LanguageService` and its `LanguagePreferenceStore` port (`application`), the `localStorage` adapter (`infrastructure`), `LanguageProvider`/`useLanguage` and the selector (`hooks`, `components`). | shared, React/Ionic in UI only            |
| `src/infrastructure/persistence/`                  | Shared Dexie `AppDatabase` (schema and versions).                                                                                                                                                                                                 | domain types                              |
| `src/app/`                                         | `App` shell and routes; `create-services.ts` composition root.                                                                                                                                                                                    | everything                                |
| `src/shared/`                                      | `Result`, `PersistenceError`, `generateId`.                                                                                                                                                                                                       | nothing                                   |

ESLint forbids `domain/` and `application/` from importing React, Ionic, React Router or Dexie.

## Data flow

1. A component calls an action from `useShoppingList`.
2. The hook calls `ShoppingListService`, which applies domain rules and uses `ShoppingItemStore`.
3. `DexieShoppingItemStore` writes to IndexedDB.
4. The hook re-reads the list from storage and re-renders, so the UI always shows persisted data. It also records the outcome of the operation as feedback (a success message naming the item, or an error message), which `FeedbackToast` shows: success messages disappear on their own, errors stay until dismissed.

Expected failures (invalid names) are `Result` values and are shown next to the field; storage failures are thrown as `PersistenceError` and shown as dismissible feedback with `role="alert"`. Services report what actually changed (the affected item, or `undefined` for a no-op), which is what decides whether a success message is shown. Clearing completed items is one all-or-nothing storage operation (`removeMany`, a single Dexie transaction) behind a confirmation dialog in the UI.

## Interface language

The interface is available in English, Spanish and Catalan. Texts live in typed catalogs (`messages/en.ts`, `es.ts`, `ca.ts` in each feature) that must satisfy one interface, so a missing text fails type checking; tests also compare the three catalogs. Components read their texts through hooks (`useShoppingListMessages`), which pick the catalog of the active language from `useLanguage()`. Domain and application code never contain display text: validation returns error codes, units are stable ids, and `PersistenceError` carries an `action` that the UI words in the active language. The chosen language is stored in `localStorage` (not Dexie) because it is needed synchronously for the first render; `LanguageProvider` also keeps `<html lang>` in sync. Feedback messages are kept as text builders so a message already on screen switches language with the interface.

To add a text: add it to the feature's messages interface and to all three catalogs. To add a unit: add its id to `UNITS` and its label to every catalog. To add a language: add it to `LANGUAGES`, `LANGUAGE_NAMES` and every catalog.

## Data model

`ShoppingItem { id: string (UUID), name: string (trimmed, 1-100 chars), completed: boolean, createdAt: Date }`.
IndexedDB database `guat2it`, schema version 1, table `shoppingItems` (primary key `id`, index `createdAt`). Changing the schema requires a new `version()` in `app-database.ts`.

## Persistence limits

Data lives in IndexedDB inside each browser or native WebView. It is local to the installation and is **not synchronized** between Android, iOS and web. Mobile WebViews can evict IndexedDB under storage pressure; if that becomes a problem, implement `ShoppingItemStore` with a Capacitor SQLite plugin without touching the domain, service or UI.

## Adding a feature

Create `src/features/<feature>/` with the same sub-folders only when needed, expose its service through the composition root, and start with an OpenSpec change (see [development.md](./development.md)).
