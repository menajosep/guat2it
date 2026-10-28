## Context

Items have an id, name, completion state and creation time (`domain/shopping-item.ts`). `ShoppingListService` talks to a `ShoppingItemStore` whose `save` is an upsert, backed by Dexie with `shoppingItems: 'id, createdAt'`. Add and rename both go through `parseItemName`. Issue #2 requests an optional amount and unit, with the unit chosen from a reference list of Spanish cooking terms (with English meanings).

## Goals / Non-Goals

**Goals:**

- Optional amount and unit on every item, set when adding and changed in the inline edit row.
- Validation in `domain/` only; the UI shows messages and renders inputs.
- Existing stored items keep working untouched.

**Non-Goals:**

- Unit conversion, summing quantities, or recipe/ingredient entities.
- Spanish labels or any localisation (English labels only, as decided).
- Search, sorting or grouping by unit.

## Decisions

### Data model: two optional fields, no new Dexie version

`ShoppingItem` gains `amount?: number` and `unit?: UnitId`. Neither is indexed, so the schema string stays the same and no `version()` is added; old records simply lack the fields. The adapter and port are unchanged.

Alternative: a nested `quantity: { amount, unit }`. Rejected: it adds a level for no benefit; the "amount requires unit" rule is enforced by one domain function either way.

### Unit catalogue is a typed constant in `domain/`

`domain/units.ts` exports a `UNITS` record keyed by a stable English kebab-case id (stored in the database), each with a singular and plural label and a flag `takesAmount`. The reference list in issue #2 has several Spanish terms that map to the same English word (for example `rebanada`, `rodaja` and `rajita` are all "slice"; `barra`, `palo` and `rama` are all "stick"). With English-only labels these would be indistinguishable in a selector, so synonyms are merged into one unit. `tacita` is listed as "stalk" in the issue but its note says "small cup", so it becomes "small cup". Final catalogue (singular / plural):

| Id                     | Label                       | Merged from              |
| ---------------------- | --------------------------- | ------------------------ |
| `to-taste` (no amount) | to taste                    | al gusto                 |
| `a-bit` (no amount)    | a bit                       | un poquito               |
| `stick`                | stick / sticks              | barra, palo, rama        |
| `jar`                  | jar / jars                  | bote, tarro              |
| `bottle`               | bottle / bottles            | botella                  |
| `dash`                 | dash / dashes               | chorrito                 |
| `small-glass`          | small glass / small glasses | copita, vasito           |
| `square`               | square / squares            | cuadrito                 |
| `tablespoon`           | tablespoon / tablespoons    | cucharada                |
| `teaspoon`             | teaspoon / teaspoons        | cucharadita              |
| `dozen`                | dozen / dozen               | docena                   |
| `clove`                | clove / cloves              | diente                   |
| `whole`                | whole / whole               | entero                   |
| `flake`                | flake / flakes              | escama                   |
| `ear`                  | ear / ears                  | espiga, mazorca          |
| `wedge`                | wedge / wedges              | gajo                     |
| `drop`                 | drop / drops                | gota                     |
| `gram`                 | gram / grams                | g, gr, gramo             |
| `leaf`                 | leaf / leaves               | hoja                     |
| `kilogram`             | kilogram / kilograms        | kg, kilo                 |
| `can`                  | can / cans                  | lata                     |
| `pound`                | pound / pounds              | libra                    |
| `liter`                | liter / liters              | l, litro                 |
| `bunch`                | bunch / bunches             | manojo                   |
| `half`                 | half / halves               | mitad                    |
| `milliliter`           | milliliter / milliliters    | ml                       |
| `pinch`                | pinch / pinches             | pellizco, pizca          |
| `inch`                 | inch / inches               | pulgada                  |
| `handful`              | handful / handfuls          | puñado                   |
| `strip`                | strip / strips              | raja, tira               |
| `sprig`                | sprig / sprigs              | ramita                   |
| `slice`                | slice / slices              | rebanada, rodaja, rajita |
| `piece`                | piece / pieces              | trozo                    |
| `sachet`               | sachet / sachets            | sobre                    |
| `small-cup`            | small cup / small cups      | tacita                   |
| `stalk`                | stalk / stalks              | tallo                    |
| `cup`                  | cup / cups                  | taza                     |
| `shaving`              | shaving / shavings          | viruta                   |
| `glass`                | glass / glasses             | vaso                     |

Alternative: keep every Spanish term as its own unit with the English meaning as label. Rejected: duplicate labels in the selector. The merge is easy to reverse later because ids are stored, not labels.

### Validation rules live in one domain function

`parseQuantity(rawAmount, unitId)` returns `Result<{ amount?: number; unit?: UnitId }, QuantityError>` with errors `invalid-amount`, `amount-too-large`, `unit-required`, `amount-required` and `amount-not-allowed`. Rules:

- Empty amount and no unit: no quantity (valid).
- Amount present: must be a positive decimal with at most 2 decimal places and at most 9999.99; both `.` and `,` are accepted as separator; a unit is required (`unit-required`).
- Unit present: if it takes an amount (every unit except `to-taste` and `a-bit`), an amount is required (`amount-required`); if it does not, an amount is rejected (`amount-not-allowed`).

`createShoppingItem` and `withName` are replaced/extended by functions that take the raw name, raw amount and unit and return the first error. Name errors and quantity errors are kept separate so each message appears next to its own field.

### Service: rename becomes a general update

`renameItem(id, rawName)` becomes `updateItem(id, { name, amount, unit })` and returns `{ previous, item } | undefined` (undefined when nothing changed), reusing the existing outcome shape. The hook derives the feedback kind: name changed → `Renamed A to B`; only amount/unit changed → `Updated A`. `addItem` takes the same input. The store port and Dexie adapter are unchanged. Amount and unit are removed from the stored record when cleared (not stored as `undefined`/`null`), so stored shapes stay minimal.

### Display and formatting

`formatQuantity(item)` in `domain/` returns e.g. `500 grams`, `1 cup`, `0.5 teaspoons`, `to taste`; the plural label is used unless the amount equals 1. The list shows it after the name; the accessible name of the row control labels (for example `Remove Milk`) keeps using the item name only so existing selectors and tests do not change.

### UI

`AddItemForm` and `EditItemForm` get an amount input (`inputmode="decimal"`, label "Amount") and a unit select (label "Unit", first option "No unit"), implemented as a native `<select>` (Ionic's select opens an overlay that is harder to test and to use with assistive technology). In the edit row the labels get a " for <name>" suffix so they stay distinct from the add form. Choosing a unit that takes no amount disables and clears the amount field. Quantity errors use their own `role="alert"` region next to the fields (so forms now contain two alert regions), and the editor/form stays open on error, like name errors do today.

## Risks / Trade-offs

- Merged synonyms lose the distinction between, for example, `copita` and `vasito`. Acceptable for English-only labels; ids can be split later without losing stored data only if a migration maps old ids, so splitting would need a follow-up change.
- Amount-less units rejecting an amount is stricter than the issue text; it avoids nonsensical items such as "2 to taste" and can be relaxed without a data migration.
- Decimal parsing accepts a comma; display always uses a dot, so a value entered as `0,5` is shown as `0.5`.
