## Why

Category management currently competes with the shopping list for space. A navigation menu separates everyday shopping from administration and gives the app a clear way to move between them.

## What Changes

- Add a toolbar-triggered side menu with Shopping List and Admin destinations.
- Move category creation, renaming and deletion to the Admin screen, while retaining category selection and grouped items on the shopping-list screen.
- Keep Admin available to anyone using the app, without login or password.
- Localize and make navigation accessible while preserving existing local data and category behavior.

## Capabilities

### New Capabilities

- `app-navigation`: Accessible navigation between the shopping list and category administration.

### Modified Capabilities

None.

## Impact

- App routing and shell; shopping-list and category-management pages, localized messages, tests and documentation.
- Builds on the completed `add-item-categories` change, which must be archived before this change is archived.
- No new dependency, backend, authentication or data migration.
