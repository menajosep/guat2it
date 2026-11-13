## Why

The current green-and-lime interface feels cooler and heavier than desired. Issue #36 requests a warmer, lighter presentation throughout the app.

## What Changes

- Refresh light and dark appearances with warmer neutral surfaces and a softer green accent, making each appearance lighter than its current counterpart while keeping dark appearance recognizably dark.
- Apply the palette consistently across navigation, shopping, categories, recipes, weekly menus, controls, dialogs and feedback.
- Preserve system appearance following, existing functionality, accessible contrast, focus visibility and non-color status cues.
- Do not add a theme selector or change data, navigation or business behavior.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `ui-theme`: Replace the icon-inspired green and lime palette with a warmer, lighter palette across the application while retaining system-responsive appearances and accessibility.

## Impact

- Shared theme variables and any component styles needed for consistent surfaces, controls and feedback.
- Existing theme browser tests and additional coverage for app surfaces and appearance transitions.
- No storage, API or dependency changes are anticipated.
