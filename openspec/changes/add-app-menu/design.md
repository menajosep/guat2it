## Context

The existing shopping-list page includes category management and uses a local service exposed through a React context. Ionic routing may keep pages mounted after navigation, so page state can become stale when categories change elsewhere.

## Goals / Non-Goals

**Goals:**

- Provide a toolbar-triggered side menu and a dedicated Admin screen.
- Preserve category management and item assignment behavior and keep data current when returning between screens.

**Non-Goals:**

- Authentication, remote administration, new category capabilities or persistence schema changes.

## Decisions

### Navigation and pages

Use the existing Ionic router and a side menu connected to the router outlet, with routes for the shopping list and Admin. Keep the existing root and unknown-route redirect to the shopping list. Bottom tabs and a menu landing page were considered but the user selected a side menu.

### Category state

Reuse the existing service and category manager on the Admin screen. Reload stored state when a routed screen becomes active so cached pages reflect changes made elsewhere; report load and mutation failures using the existing feedback patterns. Sharing a new global state library or duplicating persistence logic is unnecessary.

### Localization and accessibility

Extend the typed message catalogs for the menu, navigation labels and Admin title in all supported languages. Give the menu trigger and destinations accessible names; use Ionic's menu close and keyboard behavior. Keep the language control available on both screens.

## Risks / Trade-offs

- [Cached pages may show outdated data] → Reload when entering each screen and test a category change followed by returning to the list.
- [Navigation could lose unsubmitted form edits] → Navigation does not save drafts; persisted changes remain intact. Do not silently submit forms.
- [An active category change is not yet archived] → Implement against it but archive the category change before archiving this change.

## Migration Plan

No storage migration is needed. Existing item and category records remain unchanged.
