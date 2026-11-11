## Why

Users currently cannot keep recipes in Guat2it, so recipe details remain separate from the shopping-list workflow. Issue #11 introduces local recipe management by importing recipes from Directo al Paladar, with ingredients compatible with the existing shopping-item format.

## What Changes

- Add a Recipes destination to the app menu, with a local recipe list and a detail view.
- Import a recipe from a Directo al Paladar URL on native platforms; on the web, import locally from page source pasted by the user because the source does not currently permit cross-origin browser requests.
- Capture and display the title, yield, ingredients, instructions and picture. Allow review and correction of imported fields before saving, particularly ingredients that cannot be mapped confidently to shopping-list quantities and units.
- Persist recipes locally, preserve existing shopping-list data, and provide localized, accessible feedback for invalid input, import and storage failures.
- Keep creating shopping lists from recipes, recipe editing after import, synchronization and support for other sites out of scope.

## Capabilities

### New Capabilities

- `recipe-import`: Import, review, save and view local recipes from Directo al Paladar.

### Modified Capabilities

- `app-navigation`: Add the Recipes destination and extend localized navigation to it.

## Impact

- New recipe domain, application, infrastructure and UI layers, and a versioned local database migration.
- App composition, routing, navigation, translations, documentation and tests.
- Native import requires a platform HTTP adapter; the web workflow uses pasted page source and does not introduce a backend.
