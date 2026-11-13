## ADDED Requirements

### Requirement: Graphical saved recipe list

The system SHALL present each saved recipe in a two-column recipe list with its title and a thumbnail of its saved picture. Each entry MUST provide a single keyboard-operable control identified by the recipe title, and activating its thumbnail or title MUST open that recipe's existing detail view. The list MUST remain usable on narrow screens without horizontal scrolling or obscuring recipe titles.

#### Scenario: Browse saved recipes

- **WHEN** the saved recipe list contains multiple recipes with loadable pictures
- **THEN** each recipe appears with its own title and picture thumbnail

#### Scenario: Two recipes per row

- **WHEN** a user views three or more saved recipes on a phone-sized or desktop screen
- **THEN** two recipes appear side by side in each full row and remaining recipes continue on the next row

#### Scenario: Open a recipe from its thumbnail

- **WHEN** a user activates a recipe's thumbnail
- **THEN** the detail view opens for that recipe

#### Scenario: Open a recipe using the keyboard

- **WHEN** a user focuses and activates a recipe entry using the keyboard
- **THEN** the detail view opens for that recipe

#### Scenario: Narrow viewport

- **WHEN** a user views the recipe list on a narrow phone-sized screen
- **THEN** recipe titles and controls remain visible and usable without horizontal scrolling

### Requirement: Unavailable list thumbnails

If a saved picture is unavailable, invalid, or fails to load, the system SHALL show an accessible, localized fallback for that recipe's thumbnail. The recipe title and detail action MUST remain available, and failure of one picture MUST NOT prevent other entries from displaying or opening. The thumbnail MUST reflect a changed picture URL when the list is shown after an edit.

#### Scenario: Failed picture

- **WHEN** one recipe picture cannot be loaded
- **THEN** that entry shows an accessible fallback, remains selectable, and other entries remain usable

#### Scenario: Changed picture

- **WHEN** a user saves a different picture URL for a recipe and returns to the list
- **THEN** that entry attempts to display the updated picture rather than retaining the previous picture or failure state

#### Scenario: Localized fallback

- **WHEN** a thumbnail is unavailable and the interface language changes
- **THEN** its fallback is available in the selected interface language without changing the saved recipe title
