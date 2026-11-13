## Context

Recipes already have one optional course category, a shared import-review/edit form, a detail view, and an in-memory category filter over the loaded list. Issue #34 calls for a separate, multi-valued taxonomy. Existing recipe records have no labels; recipes and menu assignments are stored locally. The attached course-category design describes the existing feature, not the five-facet label taxonomy.

## Goals / Non-Goals

**Goals:**

- Support multiple user-selected fixed labels across all five facets, in import review and editing.
- Filter by any selected value within each facet and all selected facets, in conjunction with the existing category filter.
- Preserve existing data, recipe workflows, accessibility, and English, Spanish, and Catalan localization.

**Non-Goals:**

- Custom labels, automatic inference, verified dietary or allergen claims, or importing labels from source pages.
- Changes to the course-category taxonomy, shopping-list categories, menu assignment, synchronization, or remote services.

## Decisions

### Fixed, language-independent label identifiers

Define a domain-owned taxonomy grouped by facet, with stable identifiers for the exact values in the spec. Store identifiers rather than translated strings and use typed translation maps for facet names and values. Each recipe holds a set of unique labels; domain validation rejects unsupported identifiers and duplicates rather than silently dropping them. A missing labels field represents an empty set for legacy records. This separates labels from the existing single course category.

Free-form labels and a user-managed label table were considered, but introduce management and ambiguity outside the requested fixed taxonomy. Imported labels are initially empty rather than inferred: users, not the application, make dietary and allergen claims.

### Extend the existing recipe lifecycle

Carry labels through imported drafts, draft conversion, validation, save, update, and reads. Reuse the shared review/edit form with grouped, accessible multi-selection controls and show selected labels in details. Cancel and persistence failures retain existing behavior. A separate label-editing workflow was considered but would duplicate saving and error handling.

Store labels as an optional, unindexed recipe property; no Dexie schema version is needed unless an indexed schema actually changes. Do not rewrite legacy records merely to add an empty field. Preserve recipe IDs, category values, source URLs, menu references, and all unrelated data.

### Compose filters over the loaded list

Keep selected label identifiers in page state grouped by facet. A recipe matches a facet when no values are selected there or it has at least one selected value. It matches the label filter when every facet matches, and appears only if it also matches the existing course-category filter. An empty selection imposes no label constraint. Preserve the list's existing ordering, actions, empty-library, loading, and error states; show no-matches for a nonempty library with no combined matches.

Use individually collapsible native disclosure groups for each facet in both recipe forms and browsing filters. Start each group collapsed to avoid making the label controls dominate the page, and include the localized selected-label count in each summary so choices remain visible while collapsed. Wrap both the category selector and label controls in an outer native disclosure that also starts collapsed. Its localized summary shows the total number of active filters (the selected category, if any, plus selected labels); changing disclosure state never resets filters. Keep controls keyboard-operable and suitable for touch and narrow screens, with a way to clear label filters. Keep selections when returning from details or reloading after an operation, and reset them when the page is initialized, matching the category filter lifecycle. A database index or server-side query would add complexity without benefit while the app already loads the whole local library.

### Localized presentation and safety

Translate facet names, values, controls, empty states, and validation messages in all three supported languages. Changing language changes labels but not selections or stored identifiers. Describe dietary and allergen labels as user-assigned, not verified claims; do not imply that filtering establishes safety.

## Risks / Trade-offs

- [Many choices may overwhelm small screens] → Group controls by facet and verify keyboard, touch, and narrow-screen usability.
- [A user may mistake a dietary label for a safety guarantee] → Make clear that labels are user-assigned and not verified; never infer them.
- [Legacy records and unrelated fields could be lost during updates] → Exercise old records through list, detail, edit, reload, and existing menu assignments.
- [Filters can hide a newly edited recipe] → Retain selections, show a distinct no-matches state, and offer a way to clear label filters.
- [Translations or identifiers may drift] → Use exhaustive typed maps and tests covering every facet and value in every language.

## Migration Plan

Read recipes without a labels field as unlabeled and write labels only as part of normal saves or edits. No bulk migration is required for an unindexed field. If implementation introduces an indexed schema change, add a new Dexie version and test upgrades with existing data. An older app can read records containing the extra field, but rewriting a recipe in that app can discard its labels; rollback cannot guarantee label preservation.

## Open Questions

None.
