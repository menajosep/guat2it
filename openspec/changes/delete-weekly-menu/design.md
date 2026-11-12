## Context

Menus and their recipe assignments are stored in separate IndexedDB tables.
Menu selection is in-memory app state, and multiple menus can have identical
names and dates. Assignment creation already uses a transaction covering both
tables; recipe deletion checks the assignment table before removing a recipe.

## Goals / Non-Goals

**Goals:**

- Confirm and delete exactly one saved menu and its assignments.
- Preserve saved recipes, other menus and their assignments, including under
  concurrent operations and storage failures.
- Keep the active menu and list consistent after a confirmed deletion.

**Non-Goals:**

- Bulk deletion, undo, deleting recipes, synchronization, or menu editing.

## Decisions

1. Extend the weekly-menu application port and service with deletion by stable
   menu ID, returning an explicit missing-menu result and propagating storage
   failures as `PersistenceError`. Use one Dexie write transaction spanning
   menus and assignments to check existence, remove the menu's assignments,
   and remove the menu. The overlapping transaction prevents a concurrent
   assignment from leaving a dangling menu reference. Deleting records in
   separate operations was rejected because partial failure could orphan data.
2. Use the existing Ionic alert pattern, with a delete action on each menu row.
   Capture the actual menu ID when the prompt opens, identify its name and start
   date, and disclose that assignments will be removed but recipes kept. Cancel,
   dismissal or leaving the view performs no write. Identical menu names and
   dates must not cause deletion of the wrong record. Render saved names as text,
   not active markup.
3. On successful deletion, update the list from the confirmed result and
   conditionally clear the active menu only if its ID still matches the deleted
   ID. This avoids overwriting a different selection made while the operation
   was pending. Invalidate older in-flight list loads so they cannot restore a
   deleted row; do not make reporting a successful write depend on a later
   read. Failed or missing deletions retain the selection and report an error.
4. Provide localized controls, confirmation and error/status messages through
   the existing language catalogs. The existing schema and assignment/recipe
   delete rules remain unchanged.

## Risks / Trade-offs

- [Concurrent assignment or recipe deletion] Overlapping transactions must
  serialize operations and preserve reference invariants; exercise both
  operation orders with separate database connections.
- [Partial storage failure] The transaction must roll back both menu and
  assignment changes; test injected failures at both deletion steps.
- [Stale UI state] Protect against duplicate submissions, stale list reads and
  selection changes during a pending delete, and do not claim success for an
  already-missing menu.
