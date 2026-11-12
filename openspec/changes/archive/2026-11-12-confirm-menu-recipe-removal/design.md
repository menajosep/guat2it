## Context

The weekly-menu view already displays a removal control for each recipe
assignment. It currently calls the assignment service immediately; the service
removes only the specified menu, day, meal and recipe combination. Other
destructive actions use an Ionic confirmation dialog.

## Goals / Non-Goals

**Goals:**

- Confirm the precise assignment before invoking the existing removal service.
- Preserve cancellation, local persistence, error reporting and slot isolation.
- Make the prompt accessible and localized.

**Non-Goals:**

- Deleting the recipe, bulk removal, changing assignment storage or adding undo.

## Decisions

1. Use the existing Ionic alert pattern rather than a browser-native dialog or
   an immediate removal. This is consistent across the web and mobile builds and
   provides explicit confirm and cancel actions.
2. Keep the pending assignment in transient UI state, including its menu ID,
   day offset, meal and recipe ID. Identify the recipe, localized date and meal
   in the prompt. Confirming calls the existing service for that captured
   assignment; canceling, dismissing or leaving the view clears it without a
   write. Switching menus must not redirect a pending confirmation to a different
   assignment. A confirmation referring only to a recipe title was rejected
   because the same recipe can occur in multiple slots or menus.
3. Keep the existing loading, removal-in-progress and error handling. Disable
   conflicting removal actions while a request is pending, and update the
   displayed slot only after successful storage. If another app instance already
   removed the assignment or storage fails, report the failure rather than
   claiming success. Do not retry automatically.
4. Add prompt text and action labels to the existing English, Spanish and
   Catalan planning catalog. Render user-supplied names as text, not executable
   markup, and retain the pending target if the language changes.

## Risks / Trade-offs

- [Accidental removal from another slot] Capture the full assignment and include
  the day and meal in the prompt; test identical recipe names and other slots.
- [Stale dialog] Dismiss pending confirmation when the selected menu or view
  changes; validate dismissals and concurrent disappearance without a false
  success message.
- [Existing tests assume immediate removal] Update the browser flow to confirm
  explicitly and add cancellation, dismissal, error and localization coverage.
