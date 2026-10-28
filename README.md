# Guat2it

A personal meal-planning app that will grow, one OpenSpec change at a time, from a shopping-list manager into a weekly menu planner. It is built with React, Ionic and Capacitor so that Android, iOS and the web share one code base.

## Current scope

Implemented: a **local shopping list** — add items, mark them completed/active, rename them inline, remove them, with validation, success/error messages for every operation, and empty/loading/error states.

Not implemented (yet): categories, recipes, meal planning, shopping lists generated from meals, sync, accounts.

> **Data is local to each installation and is not synchronized** between Android, iOS and the web. It is stored in IndexedDB (via Dexie) inside the browser or app WebView. Clearing site data or uninstalling the app deletes it, and mobile WebViews may evict it under storage pressure. See [docs/architecture.md](docs/architecture.md#persistence-limits).

## Prerequisites

- Node.js 22.12 or newer (Capacitor 8 requires Node 22+) and npm
- Git
- Optional, for browser tests: Chromium for Playwright (`npx playwright install chromium`)
- Optional, for native builds: see [Android and iOS](#android-and-ios)

## Setup

```bash
git clone <repository-url>
cd guat2it
npm ci
```

## Everyday commands

| Task                        | Command                                                           |
| --------------------------- | ----------------------------------------------------------------- |
| Dev server                  | `npm run dev` (http://localhost:5173)                             |
| Production build            | `npm run build` (output in `dist/`; `npm run preview` serves it)  |
| Unit/component tests        | `npm test` (`npm run test:watch` to watch)                        |
| Browser smoke tests         | `npm run test:e2e` (needs `npx playwright install chromium` once) |
| Type check                  | `npm run typecheck`                                               |
| Lint                        | `npm run lint`                                                    |
| Format check / format       | `npm run format:check` / `npm run format`                         |
| OpenSpec validation         | `npm run spec:validate`                                           |
| Everything except build/e2e | `npm run check`                                                   |

More detail in [docs/development.md](docs/development.md).

## OpenSpec workflow

This project uses [OpenSpec](https://github.com/Fission-AI/OpenSpec) (CLI 1.3.1, installed as a dev dependency, so use `npx openspec`). Every meaningful feature or behavior change goes through a change:

1. **Explore** – read code, tests and `openspec/specs/` (`/opsx:explore` in Copilot Chat, `npx openspec list --specs`).
2. **Propose** – `/opsx:propose <name>` or `npx openspec new change <name>`.
3. **Specify / Design / Plan** – fill in `proposal.md`, `specs/<capability>/spec.md` deltas, `design.md` (when warranted) and `tasks.md`; check with `npx openspec status --change <name>`.
4. **Implement** – `/opsx:apply <name>`, following the tasks and nothing else.
5. **Verify** – `npm run check`, `npm run build`, `npm run test:e2e`, `npx openspec validate <name> --strict`.
6. **Review** – check the diff against the specs and tasks.
7. **Archive** – `/opsx:archive <name>` or `npx openspec archive <name>`, which merges the delta specs into `openspec/specs/`.

Project context and artifact rules: [openspec/config.yaml](openspec/config.yaml). Copilot guidance: [.github/copilot-instructions.md](.github/copilot-instructions.md).

## Android and iOS

Capacitor is configured in [capacitor.config.ts](capacitor.config.ts) (`webDir: dist`). The app ID `com.example.guat2it` is a **placeholder**: change `appId` (and `appName` if wanted) **before** adding a platform, because it is baked into the generated native project.

```bash
npm run build
npm install @capacitor/android @capacitor/ios   # only the platforms you need
npx cap add android     # needs Android Studio + Android SDK
npx cap add ios         # needs macOS + Xcode 26+
npx cap sync            # after every web build
npx cap open android    # or: npx cap open ios
```

- Local iOS builds require macOS and Xcode; running on a device or distributing through TestFlight/App Store additionally requires an Apple Developer account, certificates and provisioning. A Mac is **not** needed to develop and test the web app.
- `android/` and `ios/` are generated locally; their build output, local SDK paths and signing files are git-ignored. Never commit keystores or certificates.
- Native builds have **not been verified** in this repository (no Android SDK or Xcode was available when it was created); only the web build is tested.

## Architecture

Feature-oriented modular monolith; domain rules and application services do not depend on Ionic or Dexie (enforced by ESLint).

```
src/
  app/                      App shell, routes, composition root (create-services.ts)
  features/shopping-list/
    domain/                 pure rules and types
    application/            ShoppingListService + ShoppingItemStore port
    infrastructure/         Dexie implementation of the port
    hooks/ components/ pages/   React + Ionic UI
  infrastructure/persistence/   Dexie database and schema versions
  shared/                   Result, PersistenceError, generateId
  test/                     test setup and UI-flow tests
e2e/                        Playwright smoke tests
openspec/                   specs/ (canonical) and changes/ (active, archive/)
docs/                       architecture and development guides
```

## Known limitations

- Local-only, unsynchronized data; no export/backup.
- Items have no categories or quantities; renaming replaces the name and keeps no history.
- Native Android/iOS builds untested; Playwright covers Chromium only.
- `npm audit` reports moderate advisories caused by Ionic 9's React Router 6 requirement and the Capacitor CLI's dev-only dependencies; see [docs/development.md](docs/development.md#known-dependency-advisories).

## Next recommended step

Create a small OpenSpec change to clear all completed items at once (a bulk, destructive action that needs a confirmation decision) before recipes and categories are introduced.
