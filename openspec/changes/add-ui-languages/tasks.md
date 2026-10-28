## 1. Language domain and preference

- [ ] 1.1 Add `src/features/language/domain/language.ts`: `LANGUAGES`, `Language`, `isLanguage`, `DEFAULT_LANGUAGE`, `detectLanguage(preferred)` with unit tests (regional variants, unsupported, empty list)
- [ ] 1.2 Add `LanguagePreferenceStore` port and `LanguageService` (`getInitial`, `choose`) in `application/` with unit tests using a fake store (saved wins, invalid ignored, save failure reported)
- [ ] 1.3 Add `LocalStorageLanguagePreferenceStore` in `infrastructure/`, wrapping failures in `PersistenceError`, with tests (round trip, invalid value, storage throwing)

## 2. Message catalogs

- [ ] 2.1 Define the shared `Messages` type and `en` catalog by moving the current English literals (page, forms, list, dialog, validation, feedback, fallback error, accessible names) out of `messages.ts` and the components, without changing any English text
- [ ] 2.2 Move unit labels out of `domain/units.ts` into the catalogs as `Record<UnitId, { singular; plural }>`; keep `UnitId`, `UNIT_IDS`, `isUnitId` and `takesAmount` in `domain/`; move `formatQuantity` to a presentation helper that takes the active unit labels; update domain tests
- [ ] 2.3 Add `es` and `ca` catalogs, including all unit names with singular/plural and count-dependent texts
- [ ] 2.4 Add a test asserting that `en`, `es` and `ca` have identical keys, no empty strings, and a label for every `UnitId`

## 3. UI integration

- [ ] 3.1 Add `LanguageProvider`/`useLanguage()` (current language, `setLanguage`, messages) that reads the initial language through `LanguageService` and keeps `document.documentElement.lang` in sync
- [ ] 3.2 Add the `LanguageSelect` control (options "English", "Español", "Català", translated accessible name) to the shopping list page toolbar; show the "could not be remembered" error when saving fails
- [ ] 3.3 Replace every hard-coded text in `ShoppingListPage`, `AddItemForm`, `EditItemForm`, `QuantityFields`, `ShoppingItemList`, `ClearCompletedButton` and `FeedbackToast` with catalog texts; keep typed form values when the language changes
- [ ] 3.4 Wire the preference store and service in `src/app/create-services.ts` and `App.tsx`

## 4. Tests

- [ ] 4.1 Ensure the existing UI tests still pass unchanged with English (default) selected
- [ ] 4.2 Add UI tests in `src/test/` (uniquely named fake-indexeddb databases): switching language updates texts at once, typed text is kept, items and stored unit slug are unchanged, messages and validation follow the language, choice survives remount, default from device language, save failure message
- [ ] 4.3 Add an e2e flow in `e2e/`: choose Català, add an item with a unit, reload and check the language and unit text persist, switch to English and check the unit name changes

## 5. Docs and verification

- [ ] 5.1 Update `README.md` and `docs/architecture.md` (language feature, catalogs, `localStorage` preference, how to add a language or text)
- [ ] 5.2 Ask the owner to review the Spanish and Catalan translations
- [ ] 5.3 Run `npm run check`, `npm run build` and `npm run test:e2e`; fix failures without weakening tests
