# Guat2it

A personal meal-planning app that will grow, one OpenSpec change at a time, from a shopping-list manager into a weekly menu planner. It is built with React, Ionic and Capacitor so that Android, iOS and the web share one code base.

## Current scope

Implemented: a **local shopping list** — add items with an optional amount, unit and multiple categories, mark them completed/active, edit them inline, remove them one by one or clear all completed items at once (after a confirmation), with validation, success/error messages and empty/loading/error states. Use the toolbar menu to switch between **Shopping list**, **Recipes** and **Admin**, where categories can be created, renamed and deleted without a login. Items appear in each assigned category, and items without one appear under Uncategorized. A category in use cannot be deleted until it is removed from all items. The interface is available in **English, Spanish and Catalan**: pick the language in the toolbar; the choice is remembered on the device, and the first launch follows the device language when supported.

The interface uses an icon-inspired green theme and automatically follows the device's light or dark appearance.

Use **Weekly menus** in the toolbar menu to create a named local menu with a chosen start date. The date starts at today; changing it resets the name to the suggested name. Multiple menus can share a start date. Select a saved menu, then open a saved recipe under **Recipes** and add it to a day and lunch or dinner. A meal can contain multiple recipes, but not the same recipe twice. Remove assignments from the selected weekly menu. A recipe cannot be deleted until all its assignments are removed. Assignments remain on the device, while the selected menu is cleared on reload or restart.

Not implemented (yet): shopping lists generated from recipes, sync, accounts.

> **Data is local to each installation and is not synchronized** between Android, iOS and the web. It is stored in IndexedDB (via Dexie) inside the browser or app WebView. Clearing site data or uninstalling the app deletes it, and mobile WebViews may evict it under storage pressure. See [docs/architecture.md](docs/architecture.md#persistence-limits).

## Import a recipe

Open **Recipes** and select **Import recipe**. On Android and iOS, enter the HTTPS URL of a Directo al Paladar recipe; the app downloads the page for local processing. On the web, paste both the recipe URL and the page's HTML source, then select **Review recipe**. For example, on desktop Chrome or Firefox, open the recipe page, use `Ctrl+U` (or `Cmd+Option+U` on macOS) to view its source, and copy it. Copying rendered article text instead of HTML source will not work.

Review the title, yield, ingredients, instructions and picture before saving. Ingredients that cannot be mapped confidently to shopping-list units retain their original text and must be corrected or explicitly confirmed. The import itself runs locally and accepts up to 5 MiB of page source. Only Directo al Paladar URLs are supported; changes to the site may prevent extraction.

For individual items, select the countable unit ("unit", "unidad" or "unitat") and enter an amount. It is also available for shopping-list items. Existing imported `count`, `unidad` and `unidades` quantities continue to use the separate "whole" unit; you can change the choice during review.

Unit choices are listed alphabetically in the selected language, after the option to leave the unit empty.

Recipes are stored locally, but pictures are referenced by their HTTPS URLs rather than saved offline. Displaying a picture contacts its host and needs network access; if it is unavailable the other recipe details remain accessible. Native downloads accept up to 5 MiB and restrict requests and redirects to the supported Directo al Paladar hosts.

To edit a saved recipe, open it from the recipe list and select **Edit recipe**. Changes are validated before saving; canceling leaves the saved recipe unchanged.

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
- The user verified native URL-only recipe import on Android. iOS device verification has not been performed; Playwright covers the web build.

## Architecture

Feature-oriented modular monolith; domain rules and application services do not depend on Ionic or Dexie (enforced by ESLint).

```
src/
  app/                      App shell, routes, composition root (create-services.ts)
  features/language/        supported languages, preference service, selector (messages/ holds its texts)
  features/shopping-list/
    domain/                 pure rules and types
    application/            ShoppingListService + ShoppingItemStore port
    infrastructure/         Dexie implementation of the port
    hooks/ components/ pages/   React + Ionic UI
    messages/               texts per language (en, es, ca)
  features/recipes/         local recipe import, review, persistence and display
  features/weekly-menus/    local weekly-menu creation and listing
  infrastructure/persistence/   Dexie database and schema versions
  shared/                   Result, PersistenceError, generateId
  test/                     test setup and UI-flow tests
e2e/                        Playwright smoke tests
openspec/                   specs/ (canonical) and changes/ (active, archive/)
docs/                       architecture and development guides
```

## Known limitations

- Local-only, unsynchronized data; no export/backup.
- Editing items and categories keeps no history. Units are a fixed list (shown in the selected language, stored as language-independent ids) and are not converted or summed. Item and category names are never translated, and amounts always use "." as the decimal separator.
- Removing items, including "Clear completed", is permanent: there is no undo or trash.
- iOS native behavior remains unverified; Playwright covers Chromium only.
- Web recipe imports require manually pasted page source; native imports download the page from its URL. Saved picture URLs require network access.
- `npm audit` reports moderate advisories caused by Ionic 9's React Router 6 requirement and the Capacitor CLI's dev-only dependencies; see [docs/development.md](docs/development.md#known-dependency-advisories).

## Next recommended step

Create the next OpenSpec change for an approved planning feature.
