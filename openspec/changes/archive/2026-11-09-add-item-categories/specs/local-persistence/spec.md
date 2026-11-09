## ADDED Requirements

### Requirement: Persist categories and preserve existing data

The system SHALL keep categories and item assignments local to the installation and preserve them across reloads. Upgrading an existing installation MUST retain its shopping items and their existing details, treating items with no saved assignments as uncategorized.

#### Scenario: Reload categories

- **WHEN** the user creates a category, assigns an item to it and reloads
- **THEN** the category and assignment remain available

#### Scenario: Upgrade an existing list

- **WHEN** an installation with items saved before categories upgrades
- **THEN** all items retain their names, quantities, completion states and creation order and appear uncategorized

#### Scenario: Category storage failure

- **WHEN** loading or changing categories or assignments fails
- **THEN** the user is informed and the interface does not claim that an unsuccessful change was saved

#### Scenario: Concurrent category deletion and assignment

- **WHEN** category deletion and assignment are attempted concurrently
- **THEN** no saved item references a deleted category
