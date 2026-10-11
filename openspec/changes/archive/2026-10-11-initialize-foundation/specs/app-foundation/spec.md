## ADDED Requirements

### Requirement: Web application

The system SHALL provide a web application that can be built for production and served without native tooling.

#### Scenario: Production build

- **WHEN** a developer runs `npm run build`
- **THEN** a static web build is produced in `dist/` and the command exits successfully

#### Scenario: Opening the app

- **WHEN** a user opens the application root URL
- **THEN** the shopping-list screen is shown with the title "Shopping list"

#### Scenario: Unknown route

- **WHEN** a user opens a URL that matches no route
- **THEN** the user is redirected to the shopping-list screen

### Requirement: Mobile packaging

The system SHALL be configured so that Android and iOS projects can be generated from the web build with Capacitor, using a documented placeholder application ID that is changed in one place.

#### Scenario: Application identity

- **WHEN** a developer reads the Capacitor configuration
- **THEN** it defines the application name, a placeholder reverse-domain application ID, and the web build directory `dist`

#### Scenario: No generated native artifacts committed

- **WHEN** native platforms are added locally
- **THEN** build outputs, signing material and local SDK paths are excluded from version control

### Requirement: Responsive layout

The application SHALL be usable on narrow mobile screens and on wide browser windows.

#### Scenario: Wide window

- **WHEN** the application is displayed in a wide browser window
- **THEN** the content is constrained to a readable column rather than stretching across the full width

### Requirement: Developer commands

The repository SHALL expose npm scripts for the development server, production build, tests, linting, type checking, format verification and OpenSpec validation.

#### Scenario: Aggregate check

- **WHEN** a developer runs `npm run check`
- **THEN** type checking, linting, format verification, unit/component tests and OpenSpec validation all run
