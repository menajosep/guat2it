## Context

All texts are English literals spread over `messages.ts`, the components and `domain/units.ts` (unit `singular`/`plural` labels, also used by `formatQuantity`). Domain validation already returns error codes (`ItemNameError`, `QuantityError`) that `messages.ts` maps to text, and units are stored as slugs (`UnitId`). The only persisted data is in Dexie; there is no user-settings storage yet.

## Goals / Non-Goals

**Goals:**

- Three UI languages (en, es, ca), switchable at runtime and remembered on the device.
- Stored data stays language-independent (unit slugs, untranslated item names).
- Keep layering: `domain/` and `application/` contain no display text and no React/Ionic/Dexie.
- A missing translation is caught by the compiler or a test, never shown to users.

**Non-Goals:** localized number display, translating user-typed item names, RTL, extra languages, syncing the preference between devices.

## Decisions

### 1. Own typed catalogs, no i18n library

Each language is a plain TypeScript object that must satisfy one `Messages` interface, so a missing key is a compile error. Dynamic texts (counts, names, limits) are functions in the catalog, as `feedbackMessages` already does today. Plurals are handled inside those functions; for these languages "one" vs "other" is enough.

_Alternative: `i18next`/`react-i18next` or `react-intl`._ They add a dependency and runtime key lookup (untyped by default) for three languages and a few dozen strings, which the project guidelines ("add dependencies only with a clear need") argue against. Revisit if more languages or complex plurals appear.

### 2. Domain keeps ids and rules; display text moves to catalogs

`domain/units.ts` keeps `UnitId`, `UNIT_IDS`, `isUnitId` and `takesAmount`, and drops `singular`/`plural`. Unit labels (singular and plural) live in each language catalog as `Record<UnitId, { singular; plural }>`, so adding a unit without translations fails to compile. `formatQuantity` moves out of `domain/` into a presentation helper that receives the unit labels of the active language (the quantity _value_ rules stay in `domain/`). Unit ordering in the selector stays `UNIT_IDS` order for every language.

_Alternative: sort units alphabetically per language._ Rejected for now; it changes existing behavior and is not requested.

### 3. New `language` feature with a port for the preference

- `domain/`: `LANGUAGES = ['en','es','ca']`, `Language` type, `isLanguage`, `DEFAULT_LANGUAGE = 'en'`, and `detectLanguage(preferred: readonly string[])` (matches the primary subtag, e.g. `es-MX` → `es`, else `en`).
- `application/`: `LanguagePreferenceStore` port (`load(): Language | undefined`, `save(language): void`) and `LanguageService` (`getInitial(deviceLanguages)`, `choose(language)`).
- `infrastructure/`: `LocalStorageLanguagePreferenceStore`, wrapping failures in `PersistenceError`. An invalid stored value is ignored (falls back to detection).
- `hooks/`+`components/`: `LanguageProvider`/`useLanguage()` (current language, `setLanguage`, `messages`) and a `LanguageSelect` control placed in the shopping-list page header toolbar.
- `src/app/create-services.ts` wires the adapter; the provider also sets `document.documentElement.lang`.

### 4. Store the preference in `localStorage`, not Dexie

The language is needed synchronously for the first render; reading from IndexedDB would be asynchronous and flash English text first. It is a tiny device setting, so no Dexie `version()` bump and no migration. A failure to save does not block the change: the language still switches for the session and an error message is shown (in the newly selected language) saying it could not be remembered.

_Alternative: Dexie `settings` table._ Rejected: needs schema version, async loading state, and more code for one string.

### 5. Message catalogs are split per feature

Each feature owns its catalogs: `src/features/language/messages/{en,es,ca}.ts` for the language control, and `src/features/shopping-list/messages/{en,es,ca}.ts` for the shopping list, each satisfying a type defined by the feature. The `shopping-list` feature reads the active language through the `language` feature's `useLanguage()` hook (one-way dependency; `language` never imports `shopping-list`) and picks its own catalog in `useShoppingListMessages()`. Components call that hook instead of importing text constants. The language context has a default value of English, so components can render without a provider (for example in isolated component tests).

### 5b. Storage failures are translated in the UI

`PersistenceError` carries an optional machine-readable `action` (`load-list`, `read-item`, `save-item`, `remove-item`, `remove-items`). The Dexie adapter keeps an English technical `message` for logs, and the UI shows the catalog text for the action in the selected language. Errors without an `action` keep showing their own message, and unknown errors show the translated fallback message.

### 6. Selector UX

A native-labelled `IonSelect` (options always shown as "English", "Español", "Català", regardless of the active language) with the accessible name translated ("Language" / "Idioma" / "Idioma"). Changing it applies immediately and keeps any text already typed in forms.

## Risks / Trade-offs

- [Translation quality] Spanish/Catalan unit names (e.g. "small glass", "sachet", "shaving", "dash") are culinary terms → write them carefully, and ask the owner to review the catalogs before archiving.
- [Many files touched at once] Refactoring messages and units touches all shopping-list components → keep English output identical and cover it with the existing tests before adding es/ca.
- [Pluralization beyond one/other] Fine for en/es/ca; a future language may need a library.
- [`localStorage` unavailable, e.g. private mode] → fall back to detection/default each launch and report the save failure when the user chooses a language.
