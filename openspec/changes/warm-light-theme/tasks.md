## 1. Palette

- [ ] 1.1 Select and document coordinated warm-neutral and softened-green light and dark palettes; verify each main background's relative luminance exceeds its specified pre-change value.
- [ ] 1.2 Update shared theme variables and their RGB, shade, tint and contrast counterparts for both appearances, including navigation, surfaces, focus, success and danger states.
- [ ] 1.3 Adjust necessary Ionic and native component styles so shopping, categories, recipes, weekly menus, dialogs and feedback consistently use the palette without changing behavior.

## 2. Verification

- [ ] 2.1 Extend browser tests in both appearances to check rendered main-background luminance against the specified baselines and representative text, control, focus, dialog and feedback contrast against actual adjacent backgrounds.
- [ ] 2.2 Cover representative navigation, shopping, category, recipe and weekly-menu surfaces and retain checks for appearance changes, form and list state, status messages and destructive actions.
- [ ] 2.3 Visually review warm, softer colors and readable layouts at web and mobile viewport sizes in both appearances; document any platform verification not performed.
- [ ] 2.4 Update directly affected theme documentation to describe the chosen palette and system appearance behavior.
- [ ] 2.5 Run `npm run check`, `npm run build` and `npm run test:e2e`; report any failures or skipped platform checks.
