import { LANGUAGES } from '../../language/domain/language';
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
});
