## 1. Icon-inspired theme

- [ ] 1.1 Define the icon-inspired Ionic primary, success, danger, neutral surface and text tokens in `src/theme/variables.css`, including their companion shade, tint, RGB and contrast values.
- [ ] 1.2 Provide coherent dark-system overrides while retaining automatic system appearance changes and the existing Ionic dark palette import.
- [ ] 1.3 Apply the theme consistently to the shopping-list page, native selectors, input boundaries, checked and focus states, confirmation dialog and success/error feedback without changing existing interactions.

## 2. Verification

- [ ] 2.1 Add browser tests for light and dark modes, live system appearance changes, and unchanged form and list state.
- [ ] 2.2 Verify rendered foreground/background contrast for normal text (at least 4.5:1) and enabled control boundaries and focus indicators (at least 3:1), including errors, feedback, dialogs and both appearances.
- [ ] 2.3 Inspect the rendered interface in both appearances at mobile and desktop widths and correct visual regressions.
- [ ] 2.4 Update relevant user-facing documentation and run `npm run check`, `npm run build` and `npm run test:e2e`.
