## Context

The app has a local shopping list, category administration and localized navigation, but no recipe model. Shopping items have a validated name, optional amount and stable unit ID, and optional category IDs. The two example Directo al Paladar pages currently expose Recipe JSON-LD with a numeric yield, ingredient list, instruction text and image URL. A request to the source with an Origin header returned no cross-origin allow header, so ordinary browser URL fetching is not a dependable web solution.

## Goals / Non-Goals

**Goals:**

- Import and review both example recipes on native and web, keeping recipe content on the device.
- Store ingredient details in a format compatible with shopping-item name and quantity rules.
- Preserve existing lists and categories, provide localized accessible interaction, and expose errors.

**Non-Goals:**

- Shopping-list generation, meal planning, sync, authentication, server-side proxies, arbitrary websites, or post-import recipe editing.
- Guaranteeing offline availability of remotely hosted images.

## Decisions

### Platform-aware acquisition

On Android and iOS, acquire a user-supplied HTTPS Directo al Paladar URL through a native HTTP adapter behind an application port. On web, ask the user to paste the page source and identify its original Directo al Paladar URL; parse it locally. Explain the fallback in the UI and documentation. Validate the scheme and exact allowed host, reject credentials and nonstandard ports, and validate every redirect target before following it; surface network, HTTP and redirect failures. Fetch only after a user action, with bounded response size and timeout.

Alternatives: browser fetch alone fails without source CORS permission; a hosted proxy conflicts with the no-backend constraint and exposes user requests to another service. Pasting rendered page text is more convenient but cannot reliably distinguish recipe fields.

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
- [Page-source paste is cumbersome] → Give concise platform-specific instructions; do not imply that URL-only web import works.
- [Source image disappears or is unreachable] → Keep the saved recipe and show an image fallback; document online dependency.
- [Native networking differs by platform or redirect] → Exercise actual Android and iOS acquisition where available, and separately test adapter failures and redirect validation.
- [Ingredient text is ambiguous] → Require review rather than silently coercing it; retain original text until the user resolves it.

## Migration Plan

Add a new schema version without modifying existing shopping-item or category records. Test upgrading a populated previous-version database and reopening saved recipes. Rolling back app code does not migrate recipe data backwards; older versions must not be used to rewrite the newer database. No server deployment is required.

## Open Questions

- None blocking the proposal. Verify the native HTTP mechanism and actual device behavior during implementation; do not claim native support until tested.
