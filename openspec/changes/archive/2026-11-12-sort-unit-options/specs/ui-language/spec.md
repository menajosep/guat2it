## MODIFIED Requirements

### Requirement: Language-independent stored data

The system SHALL store only language-independent data. Units MUST be stored as their stable identifiers, never as translated text, so that an item's unit is shown in whichever language is selected. Switching languages MUST NOT require a data migration. Unit selectors in shopping-item and recipe-ingredient forms SHALL list unit names alphabetically according to the selected language, with the no-unit choice first.

#### Scenario: Unit shown in the selected language

- **WHEN** the list contains an item with 2 tablespoons and the user switches among English, Spanish and Catalan
- **THEN** the item shows "2 tablespoons", "2 cucharadas" and "2 cullerades" respectively

#### Scenario: Unit selector in the selected language

- **WHEN** the user opens a shopping-item or recipe-ingredient unit selector in English, Spanish or Catalan
- **THEN** the no-unit choice appears first and every other unit is offered in alphabetical order by its name in the selected language

#### Scenario: Changing language with a selected unit

- **WHEN** the user selects a unit in a quantity form and switches the interface language
- **THEN** the selected unit and typed amount remain unchanged and the unit choices reorder alphabetically using the new language

#### Scenario: Singular and plural

- **WHEN** an item has the amount 1 and the unit "tablespoon", and the user switches to Catalan
- **THEN** the item shows "1 cullerada"

#### Scenario: Stored data does not depend on language

- **WHEN** the user adds an item with the unit "tablespoon" while the interface is in Spanish and then switches to English
- **THEN** the item is shown with the unit "tablespoon" and the stored item holds the unit identifier "tablespoon"

#### Scenario: Existing data is unaffected

- **WHEN** the app with this feature starts on a device that already holds items
- **THEN** all existing items are listed unchanged, in English unless another language is selected
