## ADDED Requirements

### Requirement: Countable ingredient unit

The system SHALL let users select the countable unit for an ingredient during recipe review and editing. The unit MUST follow the same amount validation and localized singular and plural display rules as the countable shopping-item unit. Saved ingredient quantities MUST retain their selected unit after reopening the recipe. Existing whole-unit quantities and existing source-text mappings MUST remain unchanged.

#### Scenario: Review an ingredient using the countable unit

- **WHEN** the user chooses the countable unit and a valid amount for an ingredient in a recipe review and saves
- **THEN** the saved recipe shows that amount with the localized unit and retains it after reload

#### Scenario: Edit an ingredient using the countable unit

- **WHEN** the user edits a saved ingredient to use the countable unit and a valid amount, saves, and reopens the recipe
- **THEN** the edited amount and unit are retained

#### Scenario: Countable unit requires an amount

- **WHEN** the user selects the countable unit for an ingredient without an amount and attempts to save
- **THEN** the recipe is not saved and the ingredient quantity error is identified

#### Scenario: Existing import mappings

- **WHEN** a valid source ingredient uses `count`, `unidad` or `unidades` in an already supported quantity format
- **THEN** it continues to be reviewed with the whole unit rather than being silently reclassified as the new unit
