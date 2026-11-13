import { LANGUAGES } from '../../language/domain/language';
import { RECIPE_CATEGORIES } from '../domain/recipe';
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
});
