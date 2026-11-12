## 1. Assignment rules and storage contracts

- [x] 1.1 Define assignment types, seven-day calendar derivation and validation of day offsets and meals, including year and leap-day boundaries.
- [x] 1.2 Define application ports and use cases for adding, listing and removing assignments, with explicit duplicate, missing-reference and persistence failures.
- [x] 1.3 Define the recipe-deletion in-use result and wire the application contracts without introducing infrastructure dependencies into domain or application layers.

## 2. Persistence and integrity

- [x] 2.1 Add a Dexie schema version and assignment storage with a unique menu/day/meal/recipe key, preserving all version-4 data.
- [x] 2.2 Implement transactional assignment creation with menu and recipe existence checks and return the committed slot contents; implement assignment listing and removal.
- [x] 2.3 Make recipe deletion atomically check all assignments and refuse deletion when referenced, including under concurrent assignment and deletion.
- [x] 2.4 Resolve current recipe titles when loading slots and report missing references and storage failures instead of hiding them.

## 3. Planning interface

- [x] 3.1 Add session-only shared active-menu selection, indicate the selected list entry even for identical names and dates, and support switching menus across navigation.
- [x] 3.2 Add accessible recipe assignment controls for the selected menu, seven dates and lunch/dinner, with guidance when no menu is selected.
- [x] 3.3 Show the saved slot contents and an accessible confirmation identifying the day and meal, with duplicate, missing-reference and write-failure feedback.
- [x] 3.4 Display assignments grouped by day and meal in the selected menu, with accessible removal actions and retryable load and removal errors.
- [x] 3.5 Show an actionable deletion-block message for assigned recipes, preserving confirmation and existing deletion behavior for unassigned recipes.
- [x] 3.6 Localize controls, dates, meal labels, confirmations and errors in English, Spanish and Catalan without losing an in-progress selection on language change.

## 4. Tests and documentation

- [x] 4.1 Test calendar arithmetic, day and meal validation, same-slot duplicates and permitted assignments across different slots and menus.
- [x] 4.2 Test the version-4 migration, persistence across reloads, removal isolation, updated recipe titles, missing references and injected storage failures.
- [x] 4.3 Test concurrent duplicate attempts and assignment versus recipe deletion, plus blocked deletion and deletion after all assignments are removed.
- [x] 4.4 Test session selection and reset, identical menu names and dates, navigation, localized accessible controls, slot confirmations, retry and error states.
- [x] 4.5 Add browser coverage for selecting a menu, assigning and removing recipes, duplicate prevention, restart persistence and deletion protection.
- [x] 4.6 Update directly affected user and architecture documentation for local menu planning and session selection.

## 5. Verification

- [x] 5.1 Run `npm run check` and resolve failures.
- [x] 5.2 Run `npm run build` and resolve failures.
- [x] 5.3 Run `npm run test:e2e` and resolve failures.
