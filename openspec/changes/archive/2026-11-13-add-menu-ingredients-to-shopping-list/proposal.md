## Why

Planning a weekly menu does not yet help users shop for it: they must manually copy and add ingredients, combine amounts, and resolve differences in units. Transferring a menu's ingredients to the existing local shopping list makes menu planning useful without introducing synchronization or a backend.

## What Changes

- Let the user review and transfer ingredients from the selected weekly menu to the shopping list, counting a recipe once per assignment.
- Group matching ingredient names and combine them with matching active shopping-list entries; completed entries remain unchanged.
- Ask the user to choose a unit for mixed-unit groups, convert compatible quantities where possible, and request a final quantity when quantities cannot be combined safely.
- Show a review before committing, retain unrelated list data and categories, and save the transfer atomically with localized success and error feedback.
- Keep saved recipes, menu assignments and the selected menu unchanged. Repeating a confirmed transfer adds the ingredients again.

## Capabilities

### New Capabilities

- `menu-ingredients-to-shopping-list`: Review and transfer a weekly menu's grouped ingredients into the local shopping list.

### Modified Capabilities

None.

## Impact

- Weekly-menu and shopping-list UI, domain rules, application services, storage ports and Dexie persistence.
- Shared local database reads and atomic writes spanning menus, assignments, recipes and shopping items; no backend or synchronization.
- Localized messages, accessibility, unit/component/integration/browser tests, and user and architecture documentation.
- No new dependency or database schema version is anticipated.
