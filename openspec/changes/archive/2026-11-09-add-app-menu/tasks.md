## 1. Navigation and screens

- [x] 1.1 Add an accessible toolbar-triggered side menu and routes for Shopping List and Admin, retaining existing redirects.
- [x] 1.2 Move category management to Admin, retaining item category selection and existing persistence/error behavior.
- [x] 1.3 Reload persisted state when entering each routed screen so category changes are reflected when navigating back.
- [x] 1.4 Add menu and Admin messages in English, Spanish and Catalan and retain the language selector on both screens.

## 2. Verification

- [x] 2.1 Update component tests for the relocated category manager, navigation, error handling and language changes.
- [x] 2.2 Update Playwright flows and add coverage for navigation, menu dismissal, category changes and return to the shopping list.
- [x] 2.3 Update affected user and architecture documentation.
- [x] 2.4 Run `npm run check`, `npm run build` and `npm run test:e2e`; resolve failures and report unavailable checks.
