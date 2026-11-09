## Context

The shopping list stores items in an IndexedDB database and reloads persisted state after mutations. Items currently have no category information, and existing installations have a version 1 database. The interface supports English, Spanish and Catalan.

## Goals / Non-Goals

**Goals:**

- Support local category management and multiple optional assignments per item.
- Group items for shopping without treating repeated appearances as separate items.
- Upgrade existing data without losing item details and report failed storage operations.

**Non-Goals:**

- Synchronization, accounts, recipes, category hierarchies or category-based item totals.

## Decisions

### Persist stable category identifiers

Store category records with stable IDs and names, and store a deduplicated array of category IDs with each item. A rename then updates one record and immediately applies everywhere. Categories are independent of UI language. A join table was considered but is unnecessary for this small local list.

### Enforce referential integrity in storage transactions

Check category existence when saving assignments and check for assigned items when deleting a category in the same read/write transaction as the mutation. This prevents dangling references even across browser tabs. Expose domain-level outcomes through application ports without importing Dexie into application or domain code. A check performed only in the UI is insufficient under concurrent changes.

### Group views, not records

Derive groups from persisted items and categories. Each category appears only when it has assigned items, and uncategorized items appear in a separate group. Keep creation order within each group and sort category groups by name; count and mutate unique items, not rendered rows. Editing from one appearance opens one editor for that item, and changes immediately affect all appearances. A single combined group per assignment set was rejected because users chose one appearance per category.

### Validate category names consistently

Trim names, require 1–100 characters and reject names equal ignoring case. Return expected validation and in-use failures as explicit outcomes, and translate their messages in all supported languages. Stable IDs avoid confusing a rename with a new category.

## Risks / Trade-offs

- [Repeated item controls can be ambiguous] → Identify each group accessibly and ensure actions in one appearance update every appearance.
- [Concurrent operations can introduce dangling references] → Use shared database transactions and test conflicting delete/assignment behavior.
- [Failed migration or save could lose or misrepresent data] → Use an additive versioned schema, test upgrade from version 1, and retain the last successfully loaded state on failure.
- [Downgrading to an older app may not understand the newer database] → Do not delete the database for rollback; retain data and restore a compatible application version or a user-managed backup.

## Migration Plan

Add a new schema version with a category table. Treat legacy items without category IDs as uncategorized; preserve IDs, names, quantity, completion and creation dates. Verify the upgrade using a populated version 1 database.

## Open Questions

None; the proposal is subject to user approval before implementation.
