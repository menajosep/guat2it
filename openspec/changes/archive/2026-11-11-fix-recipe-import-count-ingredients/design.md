## Context

The recipe extractor retains ingredient strings from structured data. The recipe service passes each string to the domain ingredient parser, which recognizes a limited set of units and validates names and quantities against shopping-list rules. Unrecognized or invalid lines remain intact and unconfirmed for manual review.

The issue screenshot shows the source forms `2count Pan de molde` and `1count Huevos`. `count` is not currently a recognized unit, so the whole line becomes an unconfirmed ingredient name.

## Goals / Non-Goals

**Goals:**

- Recognize `count` as a whole-unit quantity in the parser's existing prefix and suffix formats, including an amount immediately adjacent to the unit.
- Preserve the original line and existing validation, confirmation, and saving behavior.
- Verify the examples through the import and review flow, including saved values.

**Non-Goals:**

- Guess quantities for other unsupported units or free-form ingredients.
- Change saved recipes, the database schema, the source extractor, or unit identifiers.

## Decisions

1. Map the exact `count` unit token to the existing `whole` unit in the domain parser. This reuses the supported quantity representation and existing parsing and validation rules across web and native imports. Rewriting source text in the extractor would obscure the original line and bypass shared parsing behavior; adding a new stored unit would unnecessarily change the data model.
2. Keep the existing recognized-ingredient confirmation behavior: valid, unambiguous matches are initially confirmed, while invalid or unsupported lines remain unchanged and unconfirmed. Always requiring manual confirmation for `count` would differ from other recognized units; guessing on invalid values could silently alter the recipe.
3. Use synthetic structured-data fixtures and UI interactions rather than network-dependent tests. Include boundaries such as invalid amounts and words merely beginning with `count` to prevent accidental partial matches.

## Risks / Trade-offs

- [Other source formats remain unsupported] → Preserve them verbatim for explicit user review rather than guessing.
- [A malformed `count` line could be mistaken for a valid quantity] → Require an exact unit token, a valid name, and a quantity accepted by existing validation; test invalid and ambiguous examples.
- [Existing stored recipes retain their old values] → This change only affects new imports; users can correct a newly imported draft before saving.
