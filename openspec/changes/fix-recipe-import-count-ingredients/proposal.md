## Why

Issue #12 shows imported ingredients such as `2count Pan de molde` and `1count Huevos` appearing as ingredient names instead of usable quantities and names. Recognizing this source format avoids manual correction while retaining the existing review safeguards.

## What Changes

- Interpret an unambiguous `count` quantity in a supported imported ingredient as a whole-unit quantity and a separate ingredient name.
- Keep the original ingredient line visible and preserve the existing unresolved, user-confirmed handling for invalid or ambiguous inputs.
- Cover the issue examples and regression cases from extraction through review and saving.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `recipe-import`: Recognize source ingredient quantities expressed with the `count` unit during review.

## Impact

- Recipe ingredient parsing and its tests; recipe import and review integration tests.
- No new dependencies, storage schema changes, or changes to previously saved recipes.
