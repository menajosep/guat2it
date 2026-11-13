## 1. Recipe list presentation

- [x] 1.1 Adapt shared image rendering for inline list use, preserving HTTPS validation, localized fallback, existing review/detail behavior, and independent failure state that resets for a changed URL.
- [x] 1.2 Render each saved recipe's thumbnail and title in one keyboard-operable control that opens the existing detail view; use lazy loading for thumbnails.
- [x] 1.3 Add scoped, responsive thumbnail and list styling that keeps long titles and controls usable on narrow screens.

## 2. Behavior tests

- [x] 2.1 Add recipe UI tests for multiple thumbnails, selecting the matching recipe by image and keyboard, and unchanged loading, empty, error, and detail behavior.
- [x] 2.2 Test invalid and failed images, localized accessible fallback, unaffected neighboring entries, and recovery after updating an image URL; cover review and detail image regressions.
- [x] 2.3 Add browser coverage for the thumbnail-to-detail flow and narrow viewport layout, including no horizontal overflow.

## 3. Verification

- [x] 3.1 Update directly affected user-facing documentation if needed.
- [x] 3.2 Run `npm run check` and `npm run build`.
- [x] 3.3 Run `npm run test:e2e` for the changed UI flow.

## 4. Two-column recipe list

- [x] 4.1 Show two recipe entries per row while preserving readable titles and navigation on narrow screens.
- [x] 4.2 Verify two entries share a row and a third wraps on phone-sized and desktop screens, including long titles and no horizontal overflow.
- [x] 4.3 Update user documentation and run `npm run check`, `npm run build`, and `npm run test:e2e`.
