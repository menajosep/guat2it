## Context

The recipe service currently accepts only supported website URLs, and saved recipes require a source URL and an HTTPS picture URL. The existing review form already edits recipe fields and ingredients, and saved recipes are used by lists and weekly menus. Photo import described in issue #43 is not implemented on this branch and is not a dependency of this change.

## Goals / Non-Goals

**Goals:**

- Create recipes manually on all supported platforms using the existing recipe and ingredient rules.
- Reuse the review, persistence, browsing, editing and menu flows while preserving website-import behavior.
- Permit manual recipes without a source or picture and retain existing records unchanged.

**Non-Goals:**

- Photo capture, image extraction, synchronization, a backend or changes to website acquisition.
- Arbitrary manual source URLs or local image uploads.

## Decisions

### Reuse the review form for a blank manual draft

Add a distinct manual-entry action on the recipe list that opens a blank draft in the shared review form. Show ordinary editable ingredient rows with add and remove controls, without imported-source text or confirmation controls. The form retains category and label options and existing quantity validation. A cancel discards the draft; failed validation or storage retains it.

This avoids a second form with divergent business rules. Treating a blank draft as an imported recipe was rejected because it exposes irrelevant source-line confirmation and requires a fictitious URL.

### Distinguish manual recipes by absent source URL

Manual drafts and records have no source URL; existing and newly imported website recipes retain their supported source URL. Use source-aware draft and saved types and explicit manual and website creation paths so the website path cannot bypass supported-URL or picture validation. The save and update paths apply common domain validation and require an HTTPS picture for website recipes. A manual picture is optional, but if supplied must be a valid HTTPS URL. Preserve the existing source on update; a manual recipe remains manual. Normalize empty picture input to an absent value.

Using a fabricated source URL would misrepresent provenance; requiring a picture would unnecessarily prevent entry of recipes without one. A new persisted discriminator and migration are unnecessary for the current two sources: existing records all have website URLs. If another source is later added, revisit this representation instead of treating every source-less recipe as an unspecified future import.

### Preserve local records and existing consumers

Make source and picture optional in the saved model and adapt draft conversion, image display and callers to handle their absence. Use the existing accessible picture fallback in list and detail views. Manual recipes remain ordinary saved recipes for category and label filtering, menu assignment and ingredient transfer. Avoid a Dexie schema bump: neither field is indexed, and no existing record needs rewriting. Continue surfacing save and update failures instead of claiming success.

## Risks / Trade-offs

- [Optional fields accidentally weaken website validation] → Keep creation paths explicit and test imported save and edit rejection of missing or invalid values alongside manual cases.
- [A consumer assumes a URL exists] → Update typed consumers and test list, detail, editing and menu use without a picture or source.
- [Older app versions may not handle new records] → Existing records remain unchanged, but rolling back after manual recipes are saved is not guaranteed to preserve their usability; back up local data before downgrading.

## Migration Plan

No schema version or data rewrite is required. Existing recipes retain their source and picture; new manual records omit absent fields. Verify existing records across upgrade and manual records across reload. A downgrade to an older app may not support manual records; no automatic reverse migration is proposed.

## Open Questions

None.
