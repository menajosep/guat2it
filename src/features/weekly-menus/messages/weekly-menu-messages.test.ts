import { LANGUAGES } from '../../language/domain/language';
import { weeklyMenuMessages } from './weekly-menu-messages';

it.each(LANGUAGES)('has complete weekly menu messages for %s', (language) => {
  const messages = weeklyMenuMessages[language];
  expect(Object.keys(messages)).toEqual(Object.keys(weeklyMenuMessages.en));
  const { defaultName, deleteMenu, deletePrompt, servingsValue, editServings, ...texts } = messages;
  for (const text of Object.values(texts)) {
    expect(typeof text).toBe('string');
    if (typeof text === 'string') expect(text.trim()).not.toBe('');
  }
  expect(defaultName('2026-11-16')).toContain('2026-11-16');
  expect(deleteMenu('Menu')).toContain('Menu');
  expect(deletePrompt('Menu', '2026-11-16')).toContain('Menu');
  expect(deletePrompt('Menu', '2026-11-16')).toContain('2026-11-16');
  expect(servingsValue(2)).toContain('2');
  expect(editServings('Menu', '2026-11-16')).toContain('Menu');
});
