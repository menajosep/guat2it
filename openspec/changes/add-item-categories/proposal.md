## Why

An ungrouped shopping list is harder to use across different shops or departments. User-defined categories let shoppers organize items around where they buy them.

## What Changes

- Let users create, rename and delete local categories; prevent deleting a category that is assigned to an item.
- Allow each item to have any number of categories when added or edited, including none.
- Group the shopping list by category, showing an item in each assigned category and uncategorized items separately.
- Preserve existing items and their details when upgrading, and persist category changes locally.
- Provide accessible controls, localized interface text and clear validation and storage-error feedback.

## Capabilities

### New Capabilities

- `item-categories`: User-defined category management and assignment to shopping items.

### Modified Capabilities

- `shopping-list`: Display and interact with items grouped by their categories.
- `local-persistence`: Persist categories and assignments while preserving existing local data.

## Impact

- Shopping-list domain, services, persistence adapters, components, messages and tests.
- IndexedDB schema migration and composition root.
- Browser flow tests and user-facing documentation. No backend, synchronization or new dependency is required.
