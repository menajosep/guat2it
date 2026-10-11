## Why

The repository had no application. Before recipes and meal planning can be built, the project needs
a runnable, tested foundation and a first vertical slice (a local shopping list) that proves the
architecture end to end and establishes the quality bar for later changes.

## What Changes

- Add a React + Ionic + Vite application that runs in the browser and can be packaged for Android and iOS with Capacitor.
- Add a shopping-list screen: add, complete/reactivate, and remove items, with validation, empty, loading and error states.
- Persist shopping-list data locally in IndexedDB so it survives reloads; no synchronization.
- Establish testing, linting, formatting, type-checking, accessibility and error-handling expectations.

## Capabilities

### New Capabilities

- `app-foundation`: The application runs on the web and is packageable for Android and iOS, with a responsive shell and reproducible developer commands.
- `shopping-list`: Users can manage a list of items to buy.
- `local-persistence`: Shopping-list data is stored on the device, owned by the installation, and failures are reported.
- `quality-requirements`: Automated checks, accessibility and error-handling expectations that every change must satisfy.

### Modified Capabilities

None.

## Impact

- New source tree under `src/`, tests under `src/` and `e2e/`, CI under `.github/workflows/`.
- New runtime dependencies: React, Ionic React, React Router 6, Dexie, Capacitor core.
- No backend, accounts, or cloud services.
