## ADDED Requirements

### Requirement: Icon-inspired interface colors

The shopping-list interface SHALL use colors inspired by the app icon: green as its primary action color, light neutral surfaces in light appearance, and lime as a secondary accent. Text, controls, dialogs and operation feedback MUST use a coherent palette. Error and destructive states MUST remain distinguishable from ordinary and successful actions without relying on color alone.

#### Scenario: Light appearance

- **WHEN** the user's system is set to light appearance and the shopping list is shown
- **THEN** the interface uses the icon-inspired green primary color and light neutral surfaces

#### Scenario: Destructive action and failure

- **WHEN** the user inspects a remove control or a persistence error
- **THEN** the action or failure is identifiable by its accessible name or message as well as its visual styling

### Requirement: System-responsive appearance

The interface SHALL follow the system's light or dark appearance without requiring a setting. Both appearances MUST use the icon-inspired palette while preserving the existing shopping-list interactions and language selection.

#### Scenario: Dark appearance

- **WHEN** the user's system is set to dark appearance
- **THEN** the shopping-list screen, controls, dialogs and feedback use a readable dark appearance with icon-inspired accents

#### Scenario: Appearance changes

- **WHEN** the system appearance changes while the app is open
- **THEN** the interface updates to the corresponding appearance without losing the list or an in-progress form

### Requirement: Color contrast and focus visibility

In both appearances, normal text and its rendered background SHALL have a contrast ratio of at least 4.5:1. Essential boundaries and visual indicators of enabled controls, including keyboard focus, MUST have a contrast ratio of at least 3:1 against adjacent colors. Disabled controls are excluded. Status messages MUST remain understandable without color alone.

#### Scenario: Form and feedback text contrast

- **WHEN** a user views enabled form controls, validation errors or operation feedback in either appearance
- **THEN** normal text has at least 4.5:1 contrast against its rendered background

#### Scenario: Keyboard focus

- **WHEN** a keyboard user focuses an enabled interactive control in either appearance
- **THEN** the focus indicator is visible and has at least 3:1 contrast against adjacent colors
