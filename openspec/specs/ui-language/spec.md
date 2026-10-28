# ui-language Specification

## Purpose
TBD - created by archiving change add-ui-languages. Update Purpose after archive.
## Requirements
### Requirement: Supported languages

The system SHALL offer its user interface in exactly three languages: English, Spanish and Catalan. Every text the user can see or that is announced to assistive technology MUST be available in each of them: titles, labels, placeholders, buttons, the empty-list message, the confirmation dialog, validation messages, operation and error messages, accessible names, and unit names (including their singular and plural forms). Item names typed by the user MUST be shown exactly as entered and never translated.

#### Scenario: Spanish interface

- **WHEN** Spanish is the selected language
- **THEN** all texts of the shopping list page, its forms, dialogs and messages are shown in Spanish, except item names

#### Scenario: Catalan interface

- **WHEN** Catalan is the selected language
- **THEN** all texts of the shopping list page, its forms, dialogs and messages are shown in Catalan, except item names

#### Scenario: English interface

- **WHEN** English is the selected language
- **THEN** the texts are the English texts the app has always shown

#### Scenario: Item names are not translated

- **WHEN** the list contains an item named "Milk" and the user switches to Spanish
- **THEN** the item is still shown as "Milk"

### Requirement: Choose the language

The system SHALL provide a language control, available on the shopping list page, with the options "English", "Español" and "Català". Each option MUST always be written in its own language, whatever language is selected. The control MUST have an accessible name in the selected language and show the selected language. Choosing a language MUST apply it immediately to the whole interface, without reloading the page, without losing text the user has typed in a form, and without changing any stored item.

#### Scenario: Switching language

- **WHEN** the user chooses "Català" in the language control
- **THEN** every visible text is shown in Catalan at once and the control shows "Català"

#### Scenario: Options are self-named

- **WHEN** the user opens the language control while the interface is in Spanish
- **THEN** the options are "English", "Español" and "Català"

#### Scenario: Typed text is kept

- **WHEN** the user has typed "Flour" in the name field and then changes the language
- **THEN** the name field still contains "Flour"

#### Scenario: Items are unchanged

- **WHEN** the user changes the language
- **THEN** the items, their names, order, completed state, amounts and units are unchanged

#### Scenario: Messages follow the language

- **WHEN** the user switches to Spanish and then adds an item
- **THEN** the confirmation message and any validation message are shown in Spanish

### Requirement: Remembered and default language

The system SHALL remember the language the user chose on that device and use it every time the app starts. When the user has not chosen a language yet, the system MUST use the device's preferred language if it is English, Spanish or Catalan (regional variants such as "es-MX" or "ca-ES" included), and English otherwise. The page's declared document language MUST always match the interface language. If the choice cannot be stored, the language MUST still change for the current session and the system MUST show an error message, in the newly selected language, saying the choice could not be remembered.

#### Scenario: Choice survives reload

- **WHEN** the user chooses "Español" and reloads the page
- **THEN** the interface is in Spanish

#### Scenario: Device language is supported

- **WHEN** the app starts for the first time on a device whose preferred language is Catalan
- **THEN** the interface is in Catalan

#### Scenario: Regional variant

- **WHEN** the app starts for the first time on a device whose preferred language is "es-MX"
- **THEN** the interface is in Spanish

#### Scenario: Device language is not supported

- **WHEN** the app starts for the first time on a device whose preferred language is French
- **THEN** the interface is in English

#### Scenario: Saved choice wins

- **WHEN** the user previously chose English and the device's preferred language is Spanish
- **THEN** the interface is in English

#### Scenario: Invalid saved value

- **WHEN** the stored language value is not one of the three supported languages
- **THEN** it is ignored and the default rules apply

#### Scenario: Document language

- **WHEN** the interface language is Catalan
- **THEN** the page's declared language is Catalan

#### Scenario: Choice cannot be stored

- **WHEN** the user chooses a language and storing the choice fails
- **THEN** the interface still changes to that language and an error message in that language is shown stating that the choice could not be remembered

### Requirement: Language-independent stored data

The system SHALL store only language-independent data. Units MUST be stored as their stable identifiers, never as translated text, so that an item's unit is shown in whichever language is selected. Switching languages MUST NOT require a data migration.

#### Scenario: Unit shown in the selected language

- **WHEN** the list contains an item with 2 tablespoons and the user switches among English, Spanish and Catalan
- **THEN** the item shows "2 tablespoons", "2 cucharadas" and "2 cullerades" respectively

#### Scenario: Unit selector in the selected language

- **WHEN** the user opens the unit selector while the interface is in Spanish
- **THEN** every unit of the list is offered with its Spanish name, in the same order as in English

#### Scenario: Singular and plural

- **WHEN** an item has the amount 1 and the unit "tablespoon", and the user switches to Catalan
- **THEN** the item shows "1 cullerada"

#### Scenario: Stored data does not depend on language

- **WHEN** the user adds an item with the unit "tablespoon" while the interface is in Spanish and then switches to English
- **THEN** the item is shown with the unit "tablespoon" and the stored item holds the unit identifier "tablespoon"

#### Scenario: Existing data is unaffected

- **WHEN** the app with this feature starts on a device that already holds items
- **THEN** all existing items are listed unchanged, in English unless another language is selected

### Requirement: Complete translations

The system SHALL have, for every text of the interface, a translation in each of the three languages, with no text falling back to another language or showing a technical key. The automated tests MUST fail when a text or a unit name is missing in any language.

#### Scenario: Missing translation is detected

- **WHEN** a text or unit name exists in one language but not in another
- **THEN** the automated checks fail

#### Scenario: Count-dependent texts

- **WHEN** the user clears one completed item, and later three, in each language
- **THEN** each message uses the correct singular or plural wording of that language

