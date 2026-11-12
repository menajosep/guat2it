## Context

Shopping items and recipe ingredients share quantity validation, a stable unit
catalog, localized labels and quantity-entry controls. Imported Spanish `unidad`
and `unidades`, as well as `count`, currently map to the existing `whole` unit.
The new choice must not reinterpret existing stored quantities or change import
behavior incidentally.

## Goals / Non-Goals

**Goals:**

- Support an explicitly named countable unit throughout the shared quantity flows.
- Keep previously stored `whole` quantities and existing import mappings unchanged.
- Show singular and plural labels in each supported language.

**Non-Goals:**

- Changing the recipe import parser or automatically reclassifying imported units.
- Adding conversion, fractional-count restrictions, synchronization or new storage.

## Decisions

1. Add a distinct stable `unit` identifier to the shared catalog, marked as requiring
   an amount. This makes it available in both shopping and ingredient forms and uses
   the existing quantity rules. Renaming `whole` or changing only its labels would
   alter the meaning and presentation of existing data.
2. Provide `unit`/`units`, `unidad`/`unidades` and `unitat`/`unitats` in the
   existing localized catalogs. Reusing the current formatter keeps singular and
   plural behavior consistent. A special-purpose display path would duplicate it.
3. Keep the existing import parser mappings unchanged. Manual review and editing can
   select the new unit; reinterpreting source text is a separate behavior change.
   Existing `count` and Spanish `unidad` mappings remain `whole`.

## Risks / Trade-offs

- [Similar choices] Users can choose either "whole" or "unit" for a count; existing
  values remain unchanged, and the labels make the distinction visible.
- [Rollback compatibility] An older app version may not recognize newly stored `unit`
  values. Do not remove the identifier in a later release without a deliberate data
  compatibility plan; rolling back after saving such values needs explicit handling.
- [Import mismatch] Spanish `unidad` is still imported as `whole`; users can change
  it during review. Tests should guard against an accidental change to this mapping.

## Migration Plan

The existing quantity representation can store the additional identifier without a
schema migration. Deploy the catalog and all translations together. Existing data
is untouched; rolling back after saving the new identifier requires a compatibility
strategy rather than assuming old versions can read it.
