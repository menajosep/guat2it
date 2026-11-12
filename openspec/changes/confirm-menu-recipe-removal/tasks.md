## 1. Confirmation behavior

- [ ] 1.1 Add localized prompt text and confirm/cancel labels in English, Spanish and Catalan, identifying the recipe, day and meal.
- [ ] 1.2 Change the weekly-menu removal control to open an accessible confirmation for the captured assignment instead of writing immediately.
- [ ] 1.3 Invoke the existing removal service only on confirmation; cancel or dismiss without writing, including on view or menu changes.
- [ ] 1.4 Preserve single-slot removal, pending-operation safeguards and explicit failure feedback, including when the assignment no longer exists.

## 2. Tests and documentation

- [ ] 2.1 Test confirmation, cancellation and dismissal, including that no removal occurs before confirmation.
- [ ] 2.2 Test the same recipe in multiple slots and menus, safe handling of menu/view changes, and removal failures or a missing assignment.
- [ ] 2.3 Test accessible localized prompt text and actions, language changes with a pending target, and safe rendering of recipe names.
- [ ] 2.4 Update the browser planning flow for confirmation and cover both cancellation and successful removal with persistence after reload.
- [ ] 2.5 Update user documentation to describe the confirmation and its effect on assignments.

## 3. Verification

- [ ] 3.1 Run `npm run check` and resolve failures.
- [ ] 3.2 Run `npm run build` and resolve failures.
- [ ] 3.3 Run `npm run test:e2e` and resolve failures.
