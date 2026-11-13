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

The system SHALL list saved recipes and let the user open a recipe to view its title, yield, ingredients, instructions and picture. Recipes MUST survive reload or restart and remain local to the installation. Unavailable pictures MUST have an accessible fallback without hiding the rest of the recipe. A database upgrade MUST preserve existing shopping items and categories. The user MUST be able to request deletion of a saved recipe from its detail view, and the system MUST require explicit confirmation before deleting it. Canceling confirmation MUST leave the recipe unchanged. After confirmed deletion succeeds, the recipe MUST no longer appear in the saved recipe list. If deletion fails, the system MUST announce an accessible error and MUST NOT claim that the recipe was deleted. A recipe assigned to any weekly menu MUST NOT be deleted until all its assignments are removed; the system MUST explain the reason.

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

- **WHEN** a user requests deletion of a saved recipe with no menu assignments and confirms the action
- **THEN** that recipe is removed from local storage and no longer appears in the recipe list

#### Scenario: Cancel recipe deletion

- **WHEN** a user requests deletion of a saved recipe and cancels confirmation
- **THEN** the recipe remains saved and available in its detail view

#### Scenario: Recipe deletion fails

- **WHEN** local storage fails while deleting a confirmed recipe
- **THEN** an accessible error is shown, the recipe remains available in the detail view, and the app does not report it as deleted

#### Scenario: Assigned recipe cannot be deleted

- **WHEN** the user confirms deletion of a recipe that is assigned to at least one menu
- **THEN** the recipe and all assignments remain unchanged and an accessible message explains that its assignments must be removed first

#### Scenario: Delete after removing all assignments

- **WHEN** the user removes every assignment of a recipe and confirms its deletion
- **THEN** the recipe is deleted and no longer appears in the recipe list

#### Scenario: Concurrent assignment and deletion

- **WHEN** adding a recipe to a menu and deleting the same recipe are attempted concurrently
- **THEN** the final state contains no assignment to a deleted recipe, and the unsuccessful operation reports the reason

### Requirement: Graphical saved recipe list

The system SHALL present each saved recipe in a two-column recipe list with its title and a thumbnail of its saved picture. Each entry MUST provide a single keyboard-operable control identified by the recipe title, and activating its thumbnail or title MUST open that recipe's existing detail view. The list MUST remain usable on narrow screens without horizontal scrolling or obscuring recipe titles.

#### Scenario: Browse saved recipes

- **WHEN** the saved recipe list contains multiple recipes with loadable pictures
- **THEN** each recipe appears with its own title and picture thumbnail

#### Scenario: Two recipes per row

- **WHEN** a user views three or more saved recipes on a phone-sized or desktop screen
- **THEN** two recipes appear side by side in each full row and remaining recipes continue on the next row

#### Scenario: Open a recipe from its thumbnail

- **WHEN** a user activates a recipe's thumbnail
- **THEN** the detail view opens for that recipe

#### Scenario: Open a recipe using the keyboard

- **WHEN** a user focuses and activates a recipe entry using the keyboard
- **THEN** the detail view opens for that recipe

#### Scenario: Narrow viewport

- **WHEN** a user views the recipe list on a narrow phone-sized screen
- **THEN** recipe titles and controls remain visible and usable without horizontal scrolling

### Requirement: Unavailable list thumbnails

If a saved picture is unavailable, invalid, or fails to load, the system SHALL show an accessible, localized fallback for that recipe's thumbnail. The recipe title and detail action MUST remain available, and failure of one picture MUST NOT prevent other entries from displaying or opening. The thumbnail MUST reflect a changed picture URL when the list is shown after an edit.

#### Scenario: Failed picture

- **WHEN** one recipe picture cannot be loaded
- **THEN** that entry shows an accessible fallback, remains selectable, and other entries remain usable

#### Scenario: Changed picture

- **WHEN** a user saves a different picture URL for a recipe and returns to the list
- **THEN** that entry attempts to display the updated picture rather than retaining the previous picture or failure state

#### Scenario: Localized fallback

- **WHEN** a thumbnail is unavailable and the interface language changes
- **THEN** its fallback is available in the selected interface language without changing the saved recipe title

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

### Requirement: Countable ingredient unit

The system SHALL let users select the countable unit for an ingredient during recipe review and editing. The unit MUST follow the same amount validation and localized singular and plural display rules as the countable shopping-item unit. Saved ingredient quantities MUST retain their selected unit after reopening the recipe. Existing whole-unit quantities and existing source-text mappings MUST remain unchanged.

#### Scenario: Review an ingredient using the countable unit

- **WHEN** the user chooses the countable unit and a valid amount for an ingredient in a recipe review and saves
- **THEN** the saved recipe shows that amount with the localized unit and retains it after reload

#### Scenario: Edit an ingredient using the countable unit

- **WHEN** the user edits a saved ingredient to use the countable unit and a valid amount, saves, and reopens the recipe
- **THEN** the edited amount and unit are retained

#### Scenario: Countable unit requires an amount

- **WHEN** the user selects the countable unit for an ingredient without an amount and attempts to save
- **THEN** the recipe is not saved and the ingredient quantity error is identified

#### Scenario: Existing import mappings

- **WHEN** a valid source ingredient uses `count`, `unidad` or `unidades` in an already supported quantity format
- **THEN** it continues to be reviewed with the whole unit rather than being silently reclassified as the new unit

### Requirement: Optional recipe course category

The system SHALL offer exactly these ten primary course categories: Breakfast & Brunch, Appetizers & Snacks, Soups & Stews, Salads, Main Courses, Side Dishes, Breads & Baked Goods, Desserts, Sauces & Condiments, and Beverages. A recipe SHALL have at most one category and MAY be uncategorized. The import review and saved-recipe edit forms SHALL provide an accessible single-selection control to select, change, or clear the category. Imported recipes SHALL initially be uncategorized. The system MUST reject an invalid category value without saving it.

#### Scenario: Categorize an imported recipe

- **WHEN** the user selects Desserts while reviewing a valid imported recipe and saves it
- **THEN** the saved recipe has Desserts as its category

#### Scenario: Save without a category

- **WHEN** the user saves a valid imported recipe without selecting a category
- **THEN** the recipe is saved as uncategorized

#### Scenario: Change or clear a category

- **WHEN** the user edits a saved recipe and changes its category or selects uncategorized, then saves
- **THEN** the saved recipe has the newly chosen category or no category respectively

#### Scenario: Cancel an edit

- **WHEN** a category edit is canceled
- **THEN** the saved category remains unchanged

#### Scenario: Invalid category

- **WHEN** a recipe draft contains a category outside the supported choices and the user attempts to save it
- **THEN** the category is identified as invalid and the recipe is not saved

### Requirement: Browse recipes by course category

The recipes page SHALL provide an accessible single-selection filter for all recipes, each of the ten categories, and uncategorized recipes. All recipes SHALL be selected initially. A category filter MUST show only recipes assigned to that category, and the uncategorized filter MUST show only recipes with no category. Filtering MUST preserve the order and existing actions of matching entries. The current filter SHALL remain selected when returning from a recipe or refreshing the list after a recipe operation. If the library is nonempty but the selected filter has no matches, the system SHALL show a distinct no-matches message; an empty library SHALL continue to show its existing empty state.

#### Scenario: Filter by category

- **WHEN** the user selects Soups & Stews
- **THEN** only recipes assigned to Soups & Stews are shown in their existing order

#### Scenario: Browse uncategorized recipes

- **WHEN** the user selects uncategorized
- **THEN** only recipes without a category are shown

#### Scenario: Return to all recipes

- **WHEN** the user selects all recipes after applying a category filter
- **THEN** every saved recipe is shown

#### Scenario: No matching recipes

- **WHEN** the library contains recipes but none match the chosen filter
- **THEN** a no-matches message is shown and the user can choose another filter

#### Scenario: Navigate and update while filtered

- **WHEN** the user opens a matching recipe, changes its category, saves, and returns to the list
- **THEN** the original filter remains selected and the list reflects the updated category

### Requirement: Persist and display recipe categories

The system SHALL persist the selected category locally with the recipe and display its category or uncategorized state in recipe details. Existing recipes saved before categories were introduced MUST remain available with all their existing details and menu assignments intact and SHALL be treated as uncategorized. A category change MUST survive reload. A failed category save MUST be reported without presenting the change as saved.

#### Scenario: Upgrade existing recipes

- **WHEN** an installation with previously saved recipes and menu assignments is upgraded
- **THEN** those recipes and assignments remain intact and the recipes are uncategorized until edited

#### Scenario: Reload a categorized recipe

- **WHEN** the user saves a category and reloads the app
- **THEN** the recipe detail and category filter reflect the saved category

#### Scenario: Category update fails

- **WHEN** local storage fails while saving a category change
- **THEN** an error is shown and the last successfully saved category remains in effect

### Requirement: Localized recipe category controls

Category labels, the uncategorized and all-recipes choices, the filter label, no-matches message, and category validation messages SHALL be available in English, Spanish, and Catalan. Changing the UI language MUST update visible category labels without changing the saved category, current filter, or unsaved form selection.

#### Scenario: Switch language

- **WHEN** the user switches the UI language while a category filter or form selection is active
- **THEN** the labels change to the selected language and the filter, form selection, and stored category remain unchanged

### Requirement: Add a saved recipe to a selected menu

The system SHALL let a user start adding a saved recipe from Recipes to the active weekly menu and select a day and meal as specified by weekly-menu planning. If no menu is active, the system MUST explain how to select one and MUST NOT save an assignment.

#### Scenario: Add from Recipes

- **WHEN** a user selects a weekly menu, opens a saved recipe and chooses to add it
- **THEN** the user can choose one of the selected menu's seven days and lunch or dinner

#### Scenario: Recipe has no active menu

- **WHEN** the user tries to add a recipe without selecting a weekly menu
- **THEN** the user is informed that a menu must first be selected and nothing is saved
