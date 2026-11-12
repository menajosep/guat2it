## Why

Users cannot yet create a named weekly menu with a chosen start date. Issue #18
introduces the first local planning record so a week can be identified and revisited.

## What Changes

- Add a Weekly menus destination with a creation form and a list of saved menus.
- Default the start date to the current local date, allow any valid date, and
  regenerate the localized default name whenever the date changes.
- Allow users to edit the name and create multiple menus with the same start date.
- Store menus locally and preserve existing shopping items, categories and recipes.
- Do not add meal or recipe assignment, menu editing, deletion or synchronization.

## Capabilities

### New Capabilities

- `weekly-menus`: Create, validate, list and persist named weekly menus locally.

### Modified Capabilities

- `app-navigation`: Add the localized Weekly menus destination.

## Impact

A new feature module, navigation and composition wiring, a new IndexedDB schema
version, localized messages, tests and user documentation are required. No backend
or new dependency is needed.
