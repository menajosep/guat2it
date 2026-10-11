---
applyTo: 'openspec/**'
---

- Use the OpenSpec CLI (`openspec new change`, `status`, `instructions`, `validate`, `archive`); do not create change folders by hand.
- Requirements use `### Requirement:` with SHALL/MUST; scenarios use exactly four hashtags (`#### Scenario:`) with WHEN/THEN.
- Specs describe observable behavior, not library choices, and only for features that exist or are in the active change.
- Do not edit `openspec/specs/` directly for new behavior; change it through a change's delta specs and archive.
- Run `npm run spec:validate` after editing.
