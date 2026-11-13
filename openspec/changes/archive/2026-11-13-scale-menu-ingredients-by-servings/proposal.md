## Why

Menu transfers currently use each recipe's saved ingredient quantities regardless of its yield or the number of people the menu serves. This can add too much or too little to the shopping list.

## What Changes

- Require a positive whole-number serving count when creating a menu and allow users to change it later.
- Preserve existing menus without inventing their serving counts; require users to provide a count before their first transfer.
- Scale each assigned recipe's ingredient amounts by the menu serving count divided by that recipe's yield before combining them with other contributions.
- Show the inputs and scaled contributions in the transfer review, and retain explicit resolution for quantities that cannot be calculated or represented safely.
- Protect reviews from changes to the menu serving count or recipe yield, and preserve the existing atomic transfer and conflict behavior.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `weekly-menus`: Capture, display, persist and edit serving counts, including for menus created before this change.
- `menu-ingredients-to-shopping-list`: Scale recipe contributions by menu servings and recipe yield during review and transfer.

## Impact

- Weekly-menu domain, storage, creation and editing UI; localized messages and accessible validation.
- Menu-transfer calculation, review, snapshot validation and tests, with existing shopping-list quantity limits and atomicity preserved.
- Local database migration and upgrade tests for existing menus; documentation and browser coverage.
