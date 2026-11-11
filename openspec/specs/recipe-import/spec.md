# recipe-import Specification

## Purpose
Import supported recipes for review and keep saved recipes available locally.

## Requirements
### Requirement: Acquire a supported recipe

The system SHALL offer recipe import from HTTPS Directo al Paladar recipe pages. On Android and iOS the user SHALL supply a URL and the app SHALL download the page; on web the user SHALL supply the URL and paste the corresponding page source for local processing. Only the exact `www.directoalpaladar.com` or `directoalpaladar.com` host without credentials or a nonstandard port SHALL be accepted, including redirects. Downloads and pasted input MUST be limited to 5 MiB. Invalid URLs, unsupported sources, network or HTTP errors, unsafe redirects, oversized input and pages without a usable recipe MUST produce a specific accessible error and MUST NOT create a recipe.

#### Scenario: Native import

- **WHEN** a user on Android or iOS supplies a valid URL for either example recipe from issue #11 and the source is available
- **THEN** the app downloads the page and presents the extracted recipe for review without requiring pasted source

#### Scenario: Web import

- **WHEN** a web user supplies a valid source URL and pastes the corresponding page source for either example recipe from issue #11
- **THEN** the recipe is extracted locally and presented for review without a backend

#### Scenario: Unsupported or unavailable source

- **WHEN** the URL is unsupported, the pasted source is too large or it does not contain a usable recipe
- **THEN** an explanation is announced and no recipe is saved

#### Scenario: Unsafe redirect or download failure

- **WHEN** a native download fails, exceeds the size limit or redirects to an unsupported URL
- **THEN** an explanation is announced and no recipe is saved

### Requirement: Review and save complete recipes

The system SHALL present the extracted title, positive yield number, ordered ingredients, instructions and picture for review before saving. The user MUST be able to correct each of these fields and cancel without saving. The system MUST require a nonempty title, a positive yield, at least one valid ingredient, nonempty instructions and a valid HTTPS picture URL before saving. Saving MUST create the complete reviewed recipe atomically.

#### Scenario: Review example recipe

- **WHEN** a supported example recipe is extracted
- **THEN** its title, yield, all ingredients in order, instructions and picture are available for review

#### Scenario: Correct and save

- **WHEN** the user corrects a field in a valid draft and saves
- **THEN** the stored recipe contains the reviewed values and appears in the recipe list

#### Scenario: Cancel or invalid draft

- **WHEN** the user cancels or attempts to save with a missing or invalid required field
- **THEN** no recipe is created, and an invalid submission identifies the affected fields

### Requirement: Compatible ingredient details

Every saved ingredient SHALL have a name and optional amount and unit conforming to the same validation rules and stable unit identifiers as shopping-list items. Ingredients SHALL initially have no categories. The system MUST preserve each source ingredient line in the review until the user has resolved any ambiguous or unsupported mapping; it MUST NOT silently omit or guess unsupported details. A valid ingredient quantity expressed with the exact `count` unit token SHALL map to the existing whole-unit quantity, including when the amount and unit are adjacent.

#### Scenario: Recognized quantity

- **WHEN** an ingredient has an unambiguously recognized name, amount and supported unit
- **THEN** the review shows the corresponding shopping-list-compatible values

#### Scenario: Count quantities from a recipe

- **WHEN** imported ingredient lines include `2count Pan de molde` and `1count Huevos`
- **THEN** the review preserves both original lines and shows the names `Pan de molde` and `Huevos` with amounts `2` and `1` respectively, each using the whole unit
- **AND** the recognized ingredients are initially confirmed and can be saved with those values

#### Scenario: Count unit with spacing or suffix placement

- **WHEN** a valid ingredient uses the exact `count` token in the supported quantity prefix or suffix format, with or without whitespace between the amount and unit
- **THEN** the review shows the ingredient name and corresponding whole-unit amount

#### Scenario: Invalid or ambiguous count line

- **WHEN** a count-like line has an invalid amount or name, or does not contain the exact `count` unit token and cannot otherwise be confidently mapped
- **THEN** it remains unresolved with its original text available for correction or explicit confirmation, rather than being guessed as a count quantity

#### Scenario: Ambiguous ingredient

- **WHEN** an ingredient cannot be confidently mapped to valid name and quantity fields
- **THEN** the original line remains visible and the user must correct or explicitly confirm valid fields before saving

#### Scenario: Invalid ingredient

- **WHEN** an ingredient name or its amount and unit violate shopping-list rules
- **THEN** the draft cannot be saved and the ingredient error is identified

### Requirement: View and persist recipes locally

The system SHALL list saved recipes and let the user open a recipe to view its title, yield, ingredients, instructions and picture. Recipes MUST survive reload or restart and remain local to the installation. Unavailable pictures MUST have an accessible fallback without hiding the rest of the recipe. A database upgrade MUST preserve existing shopping items and categories. The user MUST be able to request deletion of a saved recipe from its detail view, and the system MUST require explicit confirmation before deleting it. Canceling confirmation MUST leave the recipe unchanged. After confirmed deletion succeeds, the recipe MUST no longer appear in the saved recipe list. If deletion fails, the system MUST announce an accessible error and MUST NOT claim that the recipe was deleted.

#### Scenario: Reopen a recipe

- **WHEN** a user saves a recipe and reloads the app
- **THEN** the recipe is listed and its saved details can be opened

#### Scenario: Picture unavailable

- **WHEN** the saved picture cannot be loaded
- **THEN** an accessible fallback is shown and the recipe's other details remain available

#### Scenario: Upgrade with existing data

- **WHEN** an installation with shopping items and categories upgrades
- **THEN** its existing data remains unchanged and recipes can be saved

#### Scenario: Confirm recipe deletion

- **WHEN** a user requests deletion of a saved recipe and confirms the action
- **THEN** that recipe is removed from local storage and no longer appears in the recipe list

#### Scenario: Cancel recipe deletion

- **WHEN** a user requests deletion of a saved recipe and cancels confirmation
- **THEN** the recipe remains saved and available in its detail view

#### Scenario: Recipe deletion fails

- **WHEN** local storage fails while deleting a confirmed recipe
- **THEN** an accessible error is shown, the recipe remains available in the detail view, and the app does not report it as deleted

### Requirement: Explicit failures and localized controls

Recipe controls, accessible names, validation and error messages SHALL be available in English, Spanish and Catalan and follow the selected language immediately. Imported content MUST remain in its original language unless the user changes it. Read or write failures MUST be reported without claiming that unsaved data was saved; failed loads MUST offer retry. Imported source content MUST be displayed as text, not executed.

#### Scenario: Language switch

- **WHEN** the user changes the interface language while reviewing a recipe
- **THEN** controls and messages change language without changing the draft content

#### Scenario: Failed save

- **WHEN** storage fails while saving a recipe
- **THEN** an accessible error is shown, the draft remains available and the recipe is not reported as saved

#### Scenario: Failed load

- **WHEN** saved recipes cannot be loaded
- **THEN** an accessible error and retry action are shown

#### Scenario: Untrusted markup

- **WHEN** imported recipe text contains markup or scripts
- **THEN** it is not executed or rendered as active content

### Requirement: Edit a saved recipe

The system SHALL allow a user to edit a saved recipe from its detail view. The edit form MUST be prefilled with its saved title, yield, ordered ingredients, instructions, and picture URL. The user MUST be able to modify those fields and add or remove ingredients. Saving MUST apply the existing recipe and ingredient validation rules, including a nonempty title, positive yield, at least one valid ingredient, nonempty instructions, and a valid HTTPS picture URL. A successful update MUST atomically replace the saved values without changing the recipe identity or source URL, and the updated recipe MUST remain available after reload or restart. Canceling MUST leave the saved recipe unchanged.

#### Scenario: Edit and save

- **WHEN** a user opens a saved recipe, changes its title, yield, ingredients, instructions, and picture URL, and saves valid values
- **THEN** the detail and recipe list show the updated recipe, its identity and source URL are unchanged, and the updated values persist after reload

#### Scenario: Add and remove ingredients

- **WHEN** a user adds an ingredient and removes another before saving a valid edit
- **THEN** the saved recipe contains the resulting ingredients in their displayed order

#### Scenario: Cancel editing

- **WHEN** a user changes recipe fields and cancels editing
- **THEN** the detail view shows the original saved values and they remain unchanged after reload

#### Scenario: Invalid edit

- **WHEN** a user attempts to save an edit with invalid required fields or ingredient details, including no ingredients
- **THEN** the affected fields are identified, the draft remains available for correction, and the stored recipe remains unchanged

### Requirement: Explicit and localized recipe update failures

Edit controls, accessible names, validation, and error messages SHALL be available in English, Spanish, and Catalan and follow the selected language without changing draft content. A failed update MUST announce an accessible error, retain the draft, and MUST NOT claim that the recipe was saved. If the recipe no longer exists when an update is attempted, the system MUST report that it is missing and MUST NOT create it again.

#### Scenario: Storage failure during update

- **WHEN** local storage fails while saving an edit
- **THEN** an accessible error is shown, the draft remains available for retry, and the app does not report the edit as saved

#### Scenario: Recipe missing during update

- **WHEN** the saved recipe has been removed before an edit is saved
- **THEN** an accessible missing-recipe error is shown, the draft remains available, and no recipe is recreated

#### Scenario: Change language while editing

- **WHEN** the user changes the interface language while editing a recipe
- **THEN** controls and messages change language without changing the edit draft
