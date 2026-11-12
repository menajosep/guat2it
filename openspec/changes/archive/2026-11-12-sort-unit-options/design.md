## Context

The shared quantity selector is used by shopping items and recipe ingredients.
It currently displays the domain catalog's insertion order, and the language
specification requires that same order across languages.

## Goals / Non-Goals

**Goals:**

- Sort translated unit labels according to the active language in every quantity
  selector while leaving the empty choice first.
- Keep selected values, other form state and stored data unchanged on language switches.

**Non-Goals:**

- Changing unit identifiers, labels, quantity rules or persistent data.
- Sorting by English names regardless of the active language.

## Decisions

- Sort a copy of the shared IDs in the presentation layer using a locale-aware
  comparison of singular translated labels and a stable identifier tie-breaker.
  Leave the source catalog untouched. Sorting the domain catalog itself would
  couple business data to one display language and affect other callers.
- Recompute the displayed order when the language changes, using the existing
  language context and controlled select value. Keep the no-unit option outside
  sorting so users can always clear a quantity.

## Risks / Trade-offs

- [Locale collation differences] Use the selected supported language explicitly
  and exercise all supported languages, including accented labels, in tests.
- [Selection changes on reorder] Preserve option values as stable unit identifiers
  and test language switches with an existing selection.
