## Why

Weekly menus and recipes can be saved, but users cannot connect them to plan
lunches or dinners. Issue #19 adds that connection and makes each meal's current
selection visible.

## What Changes

- Let the user select a saved weekly menu for the current app session, then add
  saved recipes from Recipes to one of the menu's seven days and lunch or dinner.
- Show an accessible confirmation identifying the day and meal and the current
  recipes for that slot; retain assignments locally across restarts.
- Allow multiple different recipes per slot but prevent the same recipe appearing
  twice in that slot. Let users remove an assignment to correct a menu.
- Block deletion of a recipe while it is assigned, and explain how to remove the
  assignments first. Keep other recipe and menu behavior unchanged.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `weekly-menus`: Select a menu and add, view and remove recipes in day/meal slots.
- `recipe-import`: Add recipes to the selected menu and prevent deletion of assigned
  recipes until their assignments are removed.

## Impact

Weekly-menu and recipe services, storage ports and adapters, the shared IndexedDB
schema, UI, navigation state, translations, tests and documentation are affected.
Existing local data must survive the upgrade; no backend or dependency is required.
