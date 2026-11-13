## 1. Aggregation and quantity rules

- [x] 1.1 Model transfer snapshots, grouped contributions, review choices, valid results and expected errors using explicit types and existing quantity validation.
- [x] 1.2 Implement deterministic ingredient matching, per-assignment counting, active-item grouping, survivor selection and category unions without duplicating multi-category records.
- [x] 1.3 Implement exact same-unit arithmetic and mass/metric-volume conversions, mixed-unit selection and manual resolution for missing, vague, incompatible, overflow or unrepresentable quantities.
- [x] 1.4 Test matching boundaries, repeated assignments, active/completed duplicates, category preservation, deterministic ordering, precision, limits and all conflict-resolution paths.

## 2. Transfer service and persistence

- [x] 2.1 Define a transfer application service and storage port that obtain a consistent menu, assignment, recipe, shopping-item and category snapshot and validate review choices.
- [x] 2.2 Implement a Dexie transaction that detects stale or missing sources and atomically creates, updates and consolidates shopping items, preserving all other data and wrapping storage errors.
- [x] 2.3 Protect existing shopping-item edit and completion writes from overwriting or recreating records changed by a transfer; expose conflicts without losing existing validation or feedback.
- [x] 2.4 Wire the service through the composition root and contexts without introducing UI or Dexie dependencies into domain/application layers.
- [x] 2.5 Test successful transfer and reopening, missing sources, stale snapshots, rollback at each write stage and overlapping menu, recipe, assignment, shopping-item and category operations using separate database connections.
- [x] 2.6 Test shopping edits and completion changes started before a transfer but saved afterward, including merged-away records and explicit conflict feedback.

## 3. Review interface and localization

- [x] 3.1 Add an accessible action for the selected menu and a review that identifies the menu, shows contributions and proposed totals, and handles empty menus.
- [x] 3.2 Implement mixed-unit selection and explicit final-quantity entry, preserving choices across language changes and applying existing validation.
- [x] 3.3 Require confirmation, prevent duplicate submissions, cancel on dismissal or view leave, and handle selection changes, stale reviews, missing records and storage failures without false success.
- [x] 3.4 Localize controls, review text, validation, success and errors in English, Spanish and Catalan; refresh the shopping list on entry after a successful transfer.
- [x] 3.5 Test review, cancel/dismiss/navigation, language changes, accessible controls and errors, empty menus, repeated transfers and duplicate-submit behavior.
- [x] 3.6 Add browser coverage for a populated menu, repeated recipe assignments, matching list items, a unit conflict, confirmation, preserved completed items and persistence after reload.
- [x] 3.7 Update user and architecture documentation for transfer behavior, unit handling, explicit review and local-only persistence.

## 4. Verification

- [x] 4.1 Run `npm run check` and resolve failures.
- [x] 4.2 Run `npm run build` and resolve failures.
- [x] 4.3 Run `npm run test:e2e` and resolve failures.
