# Development guide

## Commands

| Command                 | Purpose                                                  |
| ----------------------- | -------------------------------------------------------- |
| `npm run dev`           | Vite dev server (http://localhost:5173)                  |
| `npm run build`         | Type-check and build to `dist/`                          |
| `npm run preview`       | Serve the production build                               |
| `npm test`              | Unit and component tests (Vitest, jsdom, fake-indexeddb) |
| `npm run test:watch`    | Vitest watch mode                                        |
| `npm run test:e2e`      | Playwright smoke tests against the production build      |
| `npm run typecheck`     | `tsc -b` (strict)                                        |
| `npm run lint`          | ESLint (type-aware, includes layering rules)             |
| `npm run format:check`  | Prettier verification (`npm run format` rewrites files)  |
| `npm run spec:validate` | `openspec validate --all --strict --no-interactive`      |
| `npm run check`         | typecheck + lint + format:check + test + spec:validate   |

Playwright needs a browser once: `npx playwright install chromium` (on Linux CI also `--with-deps`).

## OpenSpec workflow (CLI 1.3.1)

The CLI is a dev dependency, so use `npx openspec ...` (or the npm scripts). Canonical specs live in `openspec/specs/`, active changes in `openspec/changes/`, finished ones in `openspec/changes/archive/`. Project context and per-artifact rules are in `openspec/config.yaml`.

| Step      | How                                                                                                                               |
| --------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Explore   | Read code, `openspec/specs/`, tests; in Copilot Chat use `/opsx:explore`. `npx openspec list --specs`, `npx openspec show <spec>` |
| Propose   | `/opsx:propose <change-name>` or `npx openspec new change <change-name>`; creates `proposal.md`                                   |
| Specify   | `specs/<capability>/spec.md` delta files (`## ADDED/MODIFIED/REMOVED Requirements`, `#### Scenario:`)                             |
| Design    | `design.md` when the change is architectural, risky or ambiguous                                                                  |
| Plan      | `tasks.md` with `- [ ]` checkboxes. `npx openspec status --change <name>` shows artifact status                                   |
| Implement | `/opsx:apply <change-name>`; follow the tasks, tick them off                                                                      |
| Verify    | `npm run check`, `npm run build`, `npm run test:e2e`, `npx openspec validate <change-name> --strict`                              |
| Review    | Review the diff against the specs and tasks                                                                                       |
| Archive   | `/opsx:archive <change-name>` or `npx openspec archive <change-name>` (updates `openspec/specs/`)                                 |

`npx openspec update` refreshes the generated Copilot skills and prompts in `.github/skills` and `.github/prompts`; do not edit those by hand. `/opsx:*` commands come from `.github/prompts` and need VS Code to be restarted/reloaded after `openspec init/update`.

## Testing notes

- Ionic components are custom elements. Tests hydrate them in jsdom and drive the native input with `userEvent`.
- `vite.config.ts` aliases `@lit/react` to its browser build for tests. Without it Vitest resolves the SSR build, which silently never attaches `onIonInput`/`onIonChange` handlers.
- Each test creates a uniquely named Dexie database on top of `fake-indexeddb`.

## Native platforms (Capacitor)

See the README for the commands. The application ID in `capacitor.config.ts` is a placeholder (`com.example.guat2it`); change it before running `npx cap add`. Native projects (`android/`, `ios/`) are generated locally; their build output and signing files are git-ignored.

## Known dependency advisories

`npm audit` reports moderate advisories for `react-router` 6.x (open redirect in `<Link>`/`useNavigate`, SSR hydration `deserializeErrors`) and for the Capacitor CLI's `xcode`/`uuid` chain. Ionic React 9 requires React Router 6, and this client-only app does not use SSR or user-supplied redirects; the CLI is a dev-only tool. Revisit when Ionic supports React Router 7. Do not run `npm audit fix --force`.
