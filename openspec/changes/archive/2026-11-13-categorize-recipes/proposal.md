## Why

Saved recipes cannot currently be classified or browsed by course, making a growing collection harder to navigate. Issue #33 requests a small, single-select set of recipe categories for organizing and finding recipes.

## What Changes

- Offer the ten specified course categories as an optional single selection when reviewing an imported recipe and editing a saved recipe.
- Allow existing recipes to remain uncategorized and to be categorized later; retain categories locally across restarts and upgrades.
- Let users browse all recipes, a selected category, or uncategorized recipes without losing access to existing recipe actions.
- Localize category labels and controls in English, Spanish, and Catalan.
- Manual recipe creation, custom categories, and automatic classification are outside this change.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `recipe-import`: Assign, view, change, clear, persist, and browse recipes by their optional course category.

## Impact

- Recipe domain, import review, edit and detail views, list filtering, localized messages, and local recipe storage compatibility.
- Recipe unit, storage, UI, and browser tests and relevant user documentation.
- No new dependencies or synchronization.
