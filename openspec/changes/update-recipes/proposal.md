## Why

Saved recipes cannot be corrected after import, so users must delete and reimport a recipe to fix its details. Issue #14 requests editing existing recipes without losing their saved identity.

## What Changes

- Add an edit action to saved recipe details, prefilled with the current values.
- Allow users to change the title, yield, ordered ingredients, instructions, and picture URL, including adding and removing ingredients.
- Validate edits using the existing recipe and ingredient rules; cancel leaves the saved recipe unchanged.
- Persist a valid update to the existing recipe, retaining its identity and source URL. Report missing recipes and storage failures accessibly without discarding the draft or falsely reporting success.
- Localize new controls and messages in English, Spanish, and Catalan.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `recipe-import`: Extend saved-recipe behavior to support validated, local editing and explicit update failures.

## Impact

- Recipe domain validation, application service and storage port, local persistence adapter, detail and review UI, and localized messages.
- Recipe unit, integration, and browser tests and user-facing documentation.
- No new dependency, backend, synchronization, or database schema change is expected.
