## Why

The shopping-list interface still uses default Ionic colors, while the app icon has a distinctive green and lime palette. Issue #5 asks that the UI colors reflect the icon so the app has a consistent identity.

## What Changes

- Apply an icon-inspired palette to the current shopping-list UI, using green as the primary color, light neutral surfaces and lime as a restrained accent.
- Preserve the existing automatic light and dark appearance, with suitable colors in each mode.
- Keep success and destructive actions recognizable and maintain readable text, controls and focus indicators.
- Align the amount and unit controls in both add and edit forms without changing their accessible labels or behavior.
- Preserve existing shopping-list behavior, language selection and data; no new features or settings are added.

## Capabilities

### New Capabilities

- `ui-theme`: Icon-inspired colors and accessible, system-responsive presentation for the existing interface.

### Modified Capabilities

None.

## Impact

- The Ionic theme and existing custom styles in `src/theme/variables.css`, including overrides for light and dark system appearances.
- Browser tests for both color schemes, representative interactive states and contrast; existing UI flows remain unchanged.
- User-facing documentation describing the system-responsive theme.
- No dependencies, storage changes or native asset changes are planned.
