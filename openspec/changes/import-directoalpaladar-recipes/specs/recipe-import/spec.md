## ADDED Requirements

### Requirement: Acquire a supported recipe

The system SHALL offer recipe import from HTTPS Directo al Paladar recipe pages. On Android and iOS the user SHALL supply the recipe URL; on the web the user SHALL supply the URL and paste the corresponding page source for local processing. Only the exact `www.directoalpaladar.com` or `directoalpaladar.com` host without credentials or a nonstandard port SHALL be accepted. Invalid URLs, unsupported sources, acquisition failures and pages without a usable recipe MUST produce a specific accessible error and MUST NOT create a recipe.

#### Scenario: Native import

- **WHEN** a user on Android or iOS submits a valid URL for either example recipe from issue #11 and the source is available
- **THEN** the recipe is acquired and presented for review

#### Scenario: Web import

- **WHEN** a web user supplies a valid source URL and pastes the corresponding page source for either example recipe from issue #11
- **THEN** the recipe is extracted locally and presented for review without a backend

#### Scenario: Unsupported or unavailable source

- **WHEN** the URL is unsupported, the request fails or the pasted source does not contain a usable recipe
- **THEN** an explanation is announced and no recipe is saved

#### Scenario: Redirect to an unsupported host

- **WHEN** a native import redirects to an unsupported URL
- **THEN** the redirect is rejected and an explanation is shown

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

Every saved ingredient SHALL have a name and optional amount and unit conforming to the same validation rules and stable unit identifiers as shopping-list items. Ingredients SHALL initially have no categories. The system MUST preserve each source ingredient line in the review until the user has resolved any ambiguous or unsupported mapping; it MUST NOT silently omit or guess unsupported details.

#### Scenario: Recognized quantity

- **WHEN** an ingredient has an unambiguously recognized name, amount and supported unit
- **THEN** the review shows the corresponding shopping-list-compatible values

#### Scenario: Ambiguous ingredient

- **WHEN** an ingredient cannot be confidently mapped to valid name and quantity fields
- **THEN** the original line remains visible and the user must correct or explicitly confirm valid fields before saving

#### Scenario: Invalid ingredient

- **WHEN** an ingredient name or its amount and unit violate shopping-list rules
- **THEN** the draft cannot be saved and the ingredient error is identified

### Requirement: View and persist recipes locally

The system SHALL list saved recipes and let the user open a recipe to view its title, yield, ingredients, instructions and picture. Recipes MUST survive reload or restart and remain local to the installation. Unavailable pictures MUST have an accessible fallback without hiding the rest of the recipe. A database upgrade MUST preserve existing shopping items and categories.

#### Scenario: Reopen a recipe

- **WHEN** a user saves a recipe and reloads the app
- **THEN** the recipe is listed and its saved details can be opened

#### Scenario: Picture unavailable

- **WHEN** the saved picture cannot be loaded
- **THEN** an accessible fallback is shown and the recipe's other details remain available

#### Scenario: Upgrade with existing data

- **WHEN** an installation with shopping items and categories upgrades
- **THEN** its existing data remains unchanged and recipes can be saved

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
