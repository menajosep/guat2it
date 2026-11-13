## 1. Menu data and persistence

- [ ] 1.1 Model unknown legacy serving counts and validate explicitly entered positive safe integers for menu creation and editing; test valid and invalid boundaries.
- [ ] 1.2 Add the next database version and migration for existing menus without altering other local data; test upgrades and reopening with assignments intact.
- [ ] 1.3 Add a transactional serving-count update port, adapter and service that preserve other fields and report missing menus and storage failures; test deletion and update races.

## 2. Menu controls

- [ ] 2.1 Add an initially blank serving-count creation field, accessible validation and localized labels; preserve its draft across date and language changes.
- [ ] 2.2 Show saved and unknown counts and provide accessible localized editing; retain failed drafts and refresh the menu list and active-menu state after saving.
- [ ] 2.3 Require a saved count for a legacy menu's nonempty transfer while preserving the empty-menu no-op; test user feedback, retries and navigation.

## 3. Scaled transfer

- [ ] 3.1 Extend the pure transfer model and exact rational calculations to scale each recipe assignment by menu servings divided by saved recipe yield, without scaling shopping items or rounding intermediates.
- [ ] 3.2 Test repeated assignments, differing and decimal yields, exact fractional sums, supported conversion, precision limits, overflow, and missing, vague or incompatible quantities.
- [ ] 3.3 Reject invalid saved yields with specific accessible feedback, and show each original and exact scaled recipe contribution and its yield in the localized review.
- [ ] 3.4 Ensure count and yield changes invalidate a reviewed transfer atomically; test edit/transfer races, deletion, stale reviews, rollback and repeated confirmation.

## 4. Verification and documentation

- [ ] 4.1 Add component and browser coverage for creating, editing, upgrading and transferring menus, including legacy counts, reload and explicit conflict resolution.
- [ ] 4.2 Update affected user and developer documentation to describe serving counts, scaling, legacy menus and precision handling.
- [ ] 4.3 Run `npm run check`, `npm run build`, `npm run test:e2e`, and `openspec validate scale-menu-ingredients-by-servings --strict`; report any failures or skipped checks.
