## ADDED Requirements

### Requirement: Data survives reloads

The system SHALL store the shopping list on the user's device so that it is still present after the page is reloaded or the app is restarted.

#### Scenario: Reload

- **WHEN** the user adds an item, completes it, and reloads the page
- **THEN** the item is still listed and still completed

### Requirement: Local data ownership

The system SHALL keep shopping-list data local to each installation. Data MUST NOT be sent to any server, and it MUST NOT be shared or synchronized between devices or users.

#### Scenario: Separate devices

- **WHEN** an item is added on one device
- **THEN** it does not appear on any other device

#### Scenario: Documented limitation

- **WHEN** a user or developer reads the README
- **THEN** it states that data is local to each installation and not synchronized between Android, iOS and web

### Requirement: Storage failures are reported

The system SHALL report storage failures to the user instead of ignoring them, and MUST NOT display state that was not saved.

#### Scenario: Load failure

- **WHEN** reading the stored list fails
- **THEN** an error message is shown with a "Try again" action that reloads the list

#### Scenario: Save failure

- **WHEN** adding, changing or removing an item fails to save
- **THEN** an error message is shown and the list continues to show the last successfully stored state

### Requirement: Isolated test data

Automated tests SHALL use their own storage and MUST NOT read or modify a developer's existing local data.

#### Scenario: Test databases

- **WHEN** the unit and component tests run
- **THEN** each test uses a uniquely named in-memory IndexedDB database
