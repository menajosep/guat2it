## Context

The app has a local shopping list, category administration and localized navigation, but no recipe model. Shopping items have a validated name, optional amount and stable unit ID, and optional category IDs. The two example Directo al Paladar pages currently expose Recipe JSON-LD with a numeric yield, ingredient list, instruction text and image URL. A request to the source with an Origin header returned no cross-origin allow header, so ordinary browser URL fetching is not a dependable web solution.

## Goals / Non-Goals

**Goals:**

- Import and review both example recipes via URL on native and pasted page source on web, keeping saved recipe content on the device.
- Store ingredient details in a format compatible with shopping-item name and quantity rules.
- Preserve existing lists and categories, provide localized accessible interaction, and expose errors.

**Non-Goals:**

- Shopping-list generation, meal planning, sync, authentication, server-side proxies, arbitrary websites, or post-import recipe editing.
- Guaranteeing offline availability of remotely hosted images.

## Decisions

### Platform-aware page-source acquisition

On Android and iOS, download the source for a user-supplied URL with a locally maintained Capacitor plugin that reads the response incrementally and stops at 5 MiB. On the web, ask the user to paste page source and identify its original URL; parse it locally with the same 5 MiB limit. Validate HTTPS, exact allowed hosts, credentials and ports before any native request and before following each redirect; disable automatic redirects, limit redirect hops and bound connection and overall request time. Report network, HTTP, redirect and oversized-response errors. The plugin also validates request targets at the native boundary.

Alternatives: browser fetch alone fails without source CORS permission; a hosted proxy conflicts with the no-backend constraint and exposes user requests to another service. Capacitor's built-in native HTTP API buffers responses without enforcing a download-size limit. The user chose a local streaming plugin to retain native URL-only import. Pasting rendered page text cannot reliably distinguish recipe fields.

### Structured metadata and safe review

Extract Recipe data from JSON-LD in inertly parsed page source, including objects nested in arrays or graphs. Never render imported markup as HTML or execute source scripts. Convert instruction text to plain text, preserve order and show it as text. Use synthetic fixtures reflecting the observed structures, not live-site responses, in deterministic tests.

Build a review draft before any write. Offer editable title, positive yield, image URL, instruction text and ingredient rows. Map recognizable ingredient names, Spanish quantities and units to existing shopping-item name and quantity rules. For ambiguous, unsupported or invalid lines, retain the original line visibly and require an explicit valid correction; never silently drop or invent a quantity. Categories default to none. Validate all reviewed fields using shared or extracted domain rules before committing one complete recipe.

Alternatives: keeping raw strings alone would not meet shopping-item compatibility; guessing a mapping would risk losing or changing meaning. Storing shopping-item IDs, completion state or timestamps on ingredients would couple unrelated lifecycles.

### Local storage and image

Introduce a recipe feature with domain models, application import and storage ports, infrastructure adapters and UI. Store one recipe with ordered embedded ingredient values, source URL and image URL in a new Dexie table using a new schema version. Store the source image as an HTTPS URL rather than copying the binary; show a meaningful fallback when it cannot load. Validate displayed image URLs as HTTPS and render imported values as text.

Alternatives: downloading image binaries would add storage, network and lifecycle complexity; using a shared shopping-item table would mix recipe ingredients with active shopping items.

### Navigation and accessibility

Add a Recipes menu destination and local list/detail/review screens within the existing shell, using the existing language provider and all three catalogs. Existing shopping list and Admin behavior remains unchanged. Persistence errors use the existing `PersistenceError` pattern and user-facing failures are announced.

## Risks / Trade-offs

- [The source changes its metadata or removes fields] → Fail visibly, preserve the draft where possible and cover both representative structures with fixtures.
- [Page-source paste is cumbersome on web] → Give concise instructions; do not imply that URL-only web import works.
- [Source image disappears or is unreachable] → Keep the saved recipe and show an image fallback; document online dependency.
- [Native networking differs by platform] → Test redirect, timeout, response-size and network failure handling, and exercise both native platforms where available.
- [Ingredient text is ambiguous] → Require review rather than silently coercing it; retain original text until the user resolves it.

## Migration Plan

Add a new schema version without modifying existing shopping-item or category records. Test upgrading a populated previous-version database and reopening saved recipes. Rolling back app code does not migrate recipe data backwards; older versions must not be used to rewrite the newer database. No server deployment is required.

## Open Questions

- Verify native downloads on Android and iOS during implementation; report unavailable device verification.
