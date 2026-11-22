## Why

Recipes that are not available on the supported website cannot currently be added to the app. Manual entry lets users save their own recipes without importing a page, as requested in issue #44.

## What Changes

- Offer manual recipe creation alongside the existing website import flow on Android, iOS and web.
- Let users enter and review the required recipe details, add and remove ingredients, and optionally provide a picture URL, before saving locally.
- Allow manually created recipes to have no source URL or picture while keeping existing website-import validation and saved recipes intact.
- Support viewing, editing, filtering and using manually created recipes wherever saved recipes are already supported.
- Keep photo capture and extraction outside this change; they are not currently implemented.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `recipe-import`: Add manual recipe creation and permit editing manually created recipes without a source or picture URL.

## Impact

- Recipe domain validation, application services, local persistence types, review UI, translations, tests and user documentation.
- Existing local records and website imports must remain compatible; no backend, synchronization or new dependency is required.
