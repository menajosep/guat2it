## Context

The recipe page lists saved titles as buttons and opens details in the same page. Saved recipes already contain an image URL, and the review and detail views use a shared image component with an unavailable-image fallback. Displaying all thumbnails introduces multiple remote image requests and extends that shared presentation into an interactive list.

## Goals / Non-Goals

**Goals:**

- Make saved recipes visually recognizable while retaining accessible, keyboard-operable detail navigation.
- Handle missing, invalid, and failed images without blocking navigation or other recipes.
- Preserve existing recipe, localization, loading, and error behavior across phone and web layouts.

**Non-Goals:**

- Change recipe data, importing, persistence, detail content, or menu assignment.
- Add image uploads, image caching, a proxy, sorting, or filtering.

## Decisions

### One interactive entry per recipe

Use the existing list and detail-selection flow, presenting the thumbnail and title within one semantic button per recipe. The title identifies the action; image failure information must remain accessible without making the action ambiguous. The thumbnail is not a separate focus target. Style the entries as a responsive two-column graphical list with consistently bounded image areas, without clipping titles or requiring horizontal scrolling on narrow screens.

Separate image and title controls would add duplicate focus stops and make it less clear that both open the same detail view. A title-only link next to a noninteractive image would not satisfy opening details from the thumbnail.

### Reuse image safety and fallback behavior

Reuse or adapt the existing recipe image handling, including HTTPS validation and a localized unavailable-image fallback. Ensure its list variant uses markup valid inside a button, keeps failures independent per recipe, and resets failure state when the image URL changes. Preserve review and detail rendering. An always-generic placeholder would avoid requests but defeat the graphical-list goal; duplicating URL validation would risk inconsistent behavior.

### Use existing data and services

Read the saved image URL from each recipe already returned by the service; do not modify persistence or introduce dependencies. Requests remain direct to the image host, as in the existing recipe views. Image failures must not be treated as recipe-loading failures.

## Risks / Trade-offs

- More images can cause more simultaneous external requests and disclose the user's IP address to image hosts → Use browser-native lazy loading for list thumbnails and avoid introducing a proxy or persisted copies.
- Broken images and changed URLs can leave stale fallback state → Isolate image state per entry and test failure, URL replacement, and unaffected neighboring entries.
- An image and its title can produce duplicate or unclear accessible names → Use a single named control and test the fallback and keyboard interaction with assistive-technology semantics.
- Global image styles or shared-component changes can affect other views → Scope thumbnail sizing and verify review and detail images and fallbacks remain unchanged.

## Migration Plan

No data migration is needed. Deploy the presentation change with the application; reverting it restores the title-only list without changing saved recipes.
