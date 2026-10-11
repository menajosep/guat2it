# quality-requirements Specification

## Purpose
TBD - created by archiving change initialize-foundation. Update Purpose after archive.
## Requirements
### Requirement: Automated verification

The repository SHALL include automated tests for shopping-list domain rules, add/complete/remove behavior, input validation, persistence, and the main user flow through the UI, plus a browser smoke test for the web build.

#### Scenario: Unit and component tests

- **WHEN** a developer runs `npm test`
- **THEN** domain, application, persistence and UI-flow tests run deterministically without network access and pass

#### Scenario: Browser smoke test

- **WHEN** a developer runs `npm run test:e2e` after installing the Playwright browser
- **THEN** the production build is served and the add, complete, reload and remove flow passes in a real browser

### Requirement: Static quality checks

The codebase SHALL pass strict TypeScript type checking, linting and formatting verification, and SHALL NOT suppress these checks to make them pass.

#### Scenario: Checks pass

- **WHEN** `npm run typecheck`, `npm run lint` and `npm run format:check` are run
- **THEN** each exits successfully

### Requirement: Continuous integration

Pushes and pull requests to the main branch SHALL run installation from the lockfile, type checking, linting, format verification, tests, OpenSpec validation and the production build, without requiring secrets.

#### Scenario: Pull request

- **WHEN** a pull request targets the main branch
- **THEN** the workflow runs the same npm scripts documented for local use

### Requirement: Layering

Domain and application code SHALL NOT depend on React, Ionic, React Router or Dexie.

#### Scenario: Forbidden import

- **WHEN** a file under a feature's `domain/` or `application/` directory imports one of those libraries
- **THEN** linting fails

### Requirement: Accessibility

Interactive controls SHALL be operable with a keyboard, have accessible names, and validation or error messages SHALL be announced to assistive technology.

#### Scenario: Accessible names

- **WHEN** a screen reader inspects the shopping-list screen
- **THEN** the name field is labelled "Item name", the submit control "Add item", each checkbox carries its item name, and each remove control is named "Remove" followed by the item name

#### Scenario: Announced errors

- **WHEN** a validation or storage error is shown
- **THEN** it is rendered in an element with the alert role

### Requirement: Explicit error handling

Errors SHALL surface as specific, user-readable messages. Code MUST NOT silently swallow exceptions.

#### Scenario: Wrapped storage errors

- **WHEN** the storage layer fails
- **THEN** the failure is raised as a `PersistenceError` that preserves the original cause

