## MODIFIED Requirements

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
