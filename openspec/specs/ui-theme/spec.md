# ui-theme Specification

## Purpose
TBD - created by archiving change adapt-ui-colors. Update Purpose after archive.
## Requirements
### Requirement: Icon-inspired interface colors

The interface SHALL use warmer neutral surfaces and softened green accents across navigation, shopping lists, category management, recipes and weekly menus. The main background in each appearance MUST have greater WCAG relative luminance than its pre-change value: `#f8faf5` in light appearance and `#101b17` in dark appearance. Dark appearance MUST remain recognizably dark. Text, controls, dialogs and operation feedback MUST use a coherent palette. Error and destructive states MUST remain distinguishable from ordinary and successful actions without relying on color alone.

#### Scenario: Light appearance

- **WHEN** the user's system is set to light appearance and the app is shown
- **THEN** the interface uses warm light neutral surfaces and softened green accents, and its main background has greater relative luminance than `#f8faf5`

#### Scenario: Consistent application surfaces

- **WHEN** the user navigates among shopping, category management, recipes and weekly menus in either appearance
- **THEN** navigation, surfaces, controls, dialogs and feedback use the coherent warmer palette

#### Scenario: Destructive action and failure

- **WHEN** the user inspects a remove control or a persistence error
- **THEN** the action or failure is identifiable by its accessible name or message as well as its visual styling

#### Scenario: Quantity fields align

- **WHEN** the add or edit form displays the amount and unit controls side by side
- **THEN** their control areas align along their top and bottom edges and both controls retain their accessible labels

### Requirement: System-responsive appearance

The interface SHALL follow the system's light or dark appearance without requiring a setting. Both appearances MUST use the warmer palette while preserving the existing shopping-list interactions and language selection.

#### Scenario: Dark appearance

- **WHEN** the user's system is set to dark appearance
- **THEN** the app's screens, controls, dialogs and feedback use a readable, recognizably dark appearance with warmer surfaces and softened green accents, and the main background has greater relative luminance than `#101b17`

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
