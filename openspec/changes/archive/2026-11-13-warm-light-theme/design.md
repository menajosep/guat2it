## Context

The shared theme defines Ionic color variables and custom focus and accent colors in `src/theme/variables.css`; Ionic's system dark palette is also imported in `src/main.tsx`. Shopping, category, recipe and menu interfaces mix Ionic controls with native controls. Existing browser tests measure contrast in both appearances and verify that changing the system appearance preserves form and list state.

## Goals / Non-Goals

**Goals:**

- Give both system appearances a warmer, lighter presentation with warm neutral surfaces and a softened green accent.
- Keep the system-driven switch, current functionality, accessible contrast, focus indicators and non-color feedback.
- Verify representative rendered surfaces and controls across the app, including Ionic and native controls.

**Non-Goals:**

- Add a theme setting, change the app icon, alter layouts or interactions, or introduce a dependency.
- Change persistence, navigation, localization or domain behavior.

## Decisions

1. **Use a shared, coordinated palette for both appearances.** Adjust the existing theme tokens and any necessary Ionic overrides together, including matching RGB, shade, tint and contrast values. Use warm off-white or cream surfaces in light appearance, warmer, lighter dark surfaces in dark appearance, and softened green accents. The main background in each appearance must have greater WCAG relative luminance than its current value (`#f8faf5` for light, `#101b17` for dark); dark remains recognizably dark. Select final colors during implementation and validate rendered combinations rather than assuming token contrast is sufficient. Updating only individual screens was rejected because it risks inconsistent navigation and feedback.

2. **Retain system appearance selection.** Continue responding to system changes without reloading or introducing a setting. Forcing light appearance was rejected because it would remove existing dark-mode behavior; changing only light appearance would leave the dark theme inconsistent with the requested direction.

3. **Test rendered behavior, not just color constants.** Extend the existing Playwright theme coverage in both appearances for shared navigation, shopping, category management, recipes and weekly menus. Check representative surfaces, native and Ionic controls, dialogs, feedback and keyboard focus against their actual adjacent backgrounds, using the existing 4.5:1 text and 3:1 control and focus thresholds. Verify the main background luminance against the pre-change values, and review the warmer, softer visual direction on web and mobile viewport sizes. Keep the existing appearance-switch state test. Token-only checks were rejected because component and platform styling can override them.

## Risks / Trade-offs

- [Lighter surfaces or softer accents reduce contrast] → Calculate contrast on rendered text, controls and focus states in both appearances and adjust colors as needed.
- [Default Ionic surfaces diverge from custom styles] → Inspect dialogs, navigation, controls and feedback in both appearances and override shared variables where necessary.
- [Warmth is subjective] → Use the agreed warm-neutral and softened-green direction and document the selected palette; visual review complements the measurable luminance and contrast checks.

## Migration Plan

Ship the stylesheet and tests together. No data migration is needed; reverting the theme changes restores the previous appearance.
