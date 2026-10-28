## Context

The app icon uses deep and bright greens, a lime accent and light neutral areas, alongside smaller red and orange details. The current UI mostly uses Ionic defaults, with a system-controlled dark palette imported in `src/main.tsx` and custom selectors and feedback styles in `src/theme/variables.css`.

## Goals / Non-Goals

**Goals:**

- Give the current shopping-list screen a coherent icon-inspired palette in both system appearances.
- Keep actions, form states, feedback, dialogs and keyboard focus distinguishable and readable.
- Verify real rendered colors and retain the existing functionality.

**Non-Goals:**

- Adding a manual theme selector, changing the icon or generating native assets.
- Changing overall layout, copy, language behavior, persistence, or shopping-list business rules.

## Decisions

1. Define shared Ionic color tokens and supporting surface/text colors in the existing stylesheet, with explicit dark-mode overrides under `prefers-color-scheme: dark`. Derive primary greens, neutrals and accent colors from the icon's visual character rather than requiring exact sampled pixels, which can compromise contrast. Override Ionic color RGB, contrast, shade and tint companion tokens consistently. Continue importing Ionic's system dark palette before app overrides. Alternatives: component-by-component hardcoded colors, which drift; or a new theming library, which adds unnecessary complexity.
2. Keep red for destructive and error states and distinguish success from errors using existing text and icons, not color alone. Lime is an accent, not small text on a light surface. Alternatives: using green for every semantic role, which obscures destructive actions.
3. Use light and dark neutral backgrounds and contrast-tested foregrounds. Test normal text at a minimum 4.5:1 and essential non-text control boundaries and focus indicators against adjacent colors at 3:1. Exclude inactive disabled controls from those measurements. Browser tests should exercise actual rendered components and their relevant shadow DOM styles in both system schemes, not just CSS variable declarations. Supplement with a visual inspection of the screen and confirmation dialog at mobile and desktop widths.
4. Preserve system appearance detection and do not add a preference. An always-light theme would regress the existing system-dark behavior; a user-selectable theme is beyond the issue.
5. Align the existing amount and unit controls at their bottom edge in their shared grid. This keeps the native unit label above its selector and the Ionic floating amount label while aligning the control areas, without changing their accessible names or replacing the native selector. Ionic's iOS mode does not draw the outlined input style, so alignment there is measured from the input's control area.

## Risks / Trade-offs

- [Ionic components have shadow DOM and state-specific styling] → Inspect rendered controls, dialogs and feedback, including checked, focus and error states, in both modes.
- [Icon colors can have insufficient contrast] → Adapt shades and verify actual foreground/background pairs rather than forcing exact icon colors.
- [Browser automation cannot establish visual quality alone] → Inspect rendered screenshots at narrow and wide sizes as well as running contrast checks.
