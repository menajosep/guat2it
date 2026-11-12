## 1. Deletion service and persistence

- [ ] 1.1 Extend the weekly-menu port and service to delete by menu ID, explicitly report a missing menu, and preserve storage-error wrapping.
- [ ] 1.2 Implement deletion of a menu and its assignments in one transaction overlapping assignment creation, without deleting recipes or other menus' assignments.
- [ ] 1.3 Test populated and empty menus, duplicate names and dates, missing menus, rollback at both deletion steps, and persistence after reopening.
- [ ] 1.4 Test competing menu deletion, recipe assignment and recipe deletion using separate database connections, including existing recipe in-use protection.

## 2. Selection and interface

- [ ] 2.1 Add a conditional active-selection clear operation so deleting an active menu clears it without overwriting a different selection made during deletion.
- [ ] 2.2 Add an accessible per-menu deletion control and confirmation identifying the target and explaining the effect on assignments and saved recipes.
- [ ] 2.3 Ensure cancellation, dismissal and leaving the view do not delete; guard duplicate requests and safely render saved menu names.
- [ ] 2.4 Update the list and active selection only after successful deletion, invalidate stale loads, and report missing-menu and storage failures without false success.
- [ ] 2.5 Localize controls, prompts and feedback in English, Spanish and Catalan while retaining the target across language changes.

## 3. Tests and documentation

- [ ] 3.1 Test confirmation, cancellation, dismissal, identical menu entries, localization and safe menu-name rendering.
- [ ] 3.2 Test active and inactive selection, selection changes during deletion, stale list loads, missing menus and storage failures.
- [ ] 3.3 Add browser coverage for deleting a populated menu, canceling, persistence after reload and preserved recipes and other menus.
- [ ] 3.4 Update affected user and architecture documentation for confirmed deletion and assignment cleanup.

## 4. Verification

- [ ] 4.1 Run `npm run check` and resolve failures.
- [ ] 4.2 Run `npm run build` and resolve failures.
- [ ] 4.3 Run `npm run test:e2e` and resolve failures.
