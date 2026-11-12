## 1. Confirmation behavior

- [x] 1.1 Add localized prompt text and confirm/cancel labels in English, Spanish and Catalan, identifying the recipe, day and meal.
- [x] 1.2 Change the weekly-menu removal control to open an accessible confirmation for the captured assignment instead of writing immediately.
- [x] 1.3 Invoke the existing removal service only on confirmation; cancel or dismiss without writing, including on view or menu changes.
- [x] 1.4 Preserve single-slot removal, pending-operation safeguards and explicit failure feedback, including when the assignment no longer exists.

## 2. Tests and documentation

- [x] 2.1 Test confirmation, cancellation and dismissal, including that no removal occurs before confirmation.
- [x] 2.2 Test the same recipe in multiple slots and menus, safe handling of menu/view changes, and removal failures or a missing assignment.
- [x] 2.3 Test accessible localized prompt text and actions, language changes with a pending target, and safe rendering of recipe names.
- [x] 2.4 Update the browser planning flow for confirmation and cover both cancellation and successful removal with persistence after reload.
- [x] 2.5 Update user documentation to describe the confirmation and its effect on assignments.

## 3. Verification

- [x] 3.1 Run `npm run check` and resolve failures.
- [x] 3.2 Run `npm run build` and resolve failures.
- [x] 3.3 Run `npm run test:e2e` and resolve failures.
