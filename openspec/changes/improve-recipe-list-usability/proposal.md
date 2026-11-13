## Why

The saved recipe list currently shows only titles, making recipes harder to recognize at a glance. Issue #32 requests a more graphical list with image thumbnails that open the corresponding recipe details.

## What Changes

- Show each saved recipe's picture as a thumbnail alongside its title in the recipe list.
- Let users open the existing detail view by activating the corresponding recipe entry, including its thumbnail.
- Keep entries usable when their pictures are unavailable, and preserve the existing empty, loading, error, and recipe-management flows.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `recipe-import`: Present saved recipes as recognizable, accessible image-and-title entries that open recipe details.

## Impact

- Recipe list presentation, shared recipe-image behavior, styling, and related localized accessibility text.
- Recipe UI and browser tests; no new storage schema, dependencies, or recipe import behavior.
