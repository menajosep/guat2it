---
applyTo: 'src/**/*.{ts,tsx}'
---

- Keep `domain/` and `application/` free of React, Ionic, React Router and Dexie imports (ESLint enforces this).
- Components must not import Dexie or `infrastructure/`; they get services through hooks/context provided by `src/app/`.
- Model expected failures with `Result`; wrap storage failures in `PersistenceError`; never leave a promise unhandled.
- Prefer explicit types on exported functions; avoid `any`, non-null assertions, and `eslint-disable`.
- Icon-only controls need `aria-label`; error text goes in an element with `role="alert"`.
