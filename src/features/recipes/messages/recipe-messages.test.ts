import { LANGUAGES } from '../../language/domain/language';
import { ALL_RECIPE_LABELS, RECIPE_CATEGORIES, RECIPE_LABEL_FACETS } from '../domain/recipe';
import { recipeMessages } from './recipe-messages';

describe.each(LANGUAGES)('%s recipe messages', (language) => {
  const messages = recipeMessages[language];

  it('provides localized deletion controls and errors', () => {
    expect(messages.delete.trim()).not.toBe('');
    expect(messages.deleteTitle.trim()).not.toBe('');
    expect(messages.deleteConfirmation('Soup')).toContain('Soup');
    expect(messages.deleteConfirm.trim()).not.toBe('');
    expect(messages.deleteFailed.trim()).not.toBe('');
    expect(messages.deleteUnexpected.trim()).not.toBe('');
    expect(messages.cancel.trim()).not.toBe('');
  });

  it('provides localized edit controls and update errors', () => {
    expect(messages.edit.trim()).not.toBe('');
    expect(messages.update.trim()).not.toBe('');
    expect(messages.removeIngredient.trim()).not.toBe('');
    expect(messages.updateFailed.trim()).not.toBe('');
    expect(messages.updateUnexpected.trim()).not.toBe('');
  });

  it('provides localized labels for every recipe category and list filter', () => {
    expect(messages.category.trim()).not.toBe('');
    expect(messages.categoryFilter.trim()).not.toBe('');
    expect(messages.allRecipes.trim()).not.toBe('');
    expect(messages.uncategorized.trim()).not.toBe('');
    expect(messages.noMatches.trim()).not.toBe('');
    expect(messages.invalidCategory.trim()).not.toBe('');
    for (const category of RECIPE_CATEGORIES) {
      expect(messages.categories[category].trim()).not.toBe('');
    }
  });

  it('provides nonempty translations for every recipe label and facet', () => {
    expect(messages.recipeFilters.trim()).not.toBe('');
    expect(messages.activeFilterCount(0).trim()).not.toBe('');
    expect(messages.activeFilterCount(1).trim()).not.toBe('');
    expect(messages.activeFilterCount(2).trim()).not.toBe('');
    expect(messages.recipeLabels.trim()).not.toBe('');
    expect(messages.labelFilters.trim()).not.toBe('');
    expect(messages.clearLabelFilters.trim()).not.toBe('');
    expect(messages.unlabeled.trim()).not.toBe('');
    expect(messages.invalidLabels.trim()).not.toBe('');
    expect(messages.labelSafetyNote.trim()).not.toBe('');
    expect(messages.selectedLabelCount(0).trim()).not.toBe('');
    expect(messages.selectedLabelCount(1).trim()).not.toBe('');
    expect(messages.selectedLabelCount(2).trim()).not.toBe('');
    for (const facet of RECIPE_LABEL_FACETS) {
      expect(messages.labelFacets[facet].trim()).not.toBe('');
    }
    for (const label of ALL_RECIPE_LABELS) {
      expect(messages.labels[label].trim()).not.toBe('');
    }
  });
});
