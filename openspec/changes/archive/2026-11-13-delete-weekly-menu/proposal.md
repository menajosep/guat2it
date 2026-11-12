## Why

Users can create and select weekly menus but cannot remove menus they no longer
need. Issue #22 requests a delete control for each saved menu with confirmation.

## What Changes

- Allow deletion of an individual saved menu only after explicit confirmation;
  canceling or dismissing the prompt leaves it unchanged.
- Delete the menu and its assignments together while retaining saved recipes
  and assignments in other menus, as chosen by the user.
- Clear the active selection when that menu is deleted, without changing a
  different active menu; report storage failures and missing menus explicitly.
- Localize accessible controls, prompts and feedback in English, Spanish and
  Catalan.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `weekly-menus`: Add confirmed deletion of a menu and its assignments, and
  define the effect on the active selection.

## Impact

The weekly-menu application port, Dexie adapter, selection state, UI,
translations, tests and documentation are affected. Existing recipes and
unrelated menus remain intact; no new dependency or database schema is needed.
