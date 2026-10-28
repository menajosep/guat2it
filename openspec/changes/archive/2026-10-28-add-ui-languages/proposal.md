## Why

Every piece of text in the app is hard-coded in English, but the two users also speak Spanish and Catalan. Issue #3 asks for a UI that can be used in Spanish, Catalan or English, chosen by the user. Doing it now, while the UI is still one page, keeps the cost of translating low before recipes and meal planning add much more text.

## What Changes

- The app UI is available in three languages: **English**, **Spanish** and **Catalan**. All user-visible text is translated: labels, placeholders, buttons, empty state, confirmation dialog, operation and validation messages, accessible names, and the unit names (including singular/plural forms).
- A **language selector** in the app UI lets the user switch among the three languages at any time. The change applies immediately, without reloading and without touching stored data.
- The chosen language is **remembered** on the device across reloads. On first launch the app uses the device language when it is one of the three, otherwise English.
- The document language (`lang` attribute) follows the selected language so screen readers pronounce text correctly.
- Stored data stays language-independent: units are saved as slugs (for example `tablespoon`, `to-taste`) as today, and item names typed by the user are never translated. No Dexie schema change and no data migration.
- Existing English texts do not change, so current behavior is preserved when English is selected.

Out of scope: translating item names, localized number display (amounts keep the current "." format), right-to-left languages, more than these three languages.

No breaking changes.

## Capabilities

### New Capabilities

- `ui-language`: choosing among English, Spanish and Catalan; default and remembered language; all UI text and unit names shown in the selected language; language-independent stored data.

### Modified Capabilities

None. The existing `shopping-list` scenarios quote the English texts and remain valid when English is selected; the new capability defines how they are shown in the other languages.

## Impact

- New `src/features/language/` (domain: supported languages and default detection; application: preference service and storage port; infrastructure: local preference adapter; hooks/components: provider and selector) and translation catalogs for en/es/ca.
- `src/features/shopping-list/`: `messages.ts` and the unit labels in `domain/units.ts` become per-language catalogs; `components/` and `pages/` read text through the active language; `domain/` keeps only unit ids and rules (no display text).
- `src/app/`: composition root wires the preference store; `App.tsx` provides the language; `index.html` default `lang` stays `en` and is updated at runtime.
- Tests: domain, service, adapter, UI (`src/test/`) in all three languages, and an e2e flow switching language and reloading. A test checks that every catalog has exactly the same keys.
- Docs: `README.md`, `docs/architecture.md`. No new dependencies are planned (see design).
