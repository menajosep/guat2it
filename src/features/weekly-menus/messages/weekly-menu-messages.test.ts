import { LANGUAGES } from '../../language/domain/language';
import { weeklyMenuMessages } from './weekly-menu-messages';

it.each(LANGUAGES)('has complete weekly menu messages for %s', (language) => {
  const messages = weeklyMenuMessages[language];
  expect(Object.keys(messages)).toEqual(Object.keys(weeklyMenuMessages.en));
  const { defaultName, ...texts } = messages;
  for (const text of Object.values(texts)) {
    expect(text.trim()).not.toBe('');
  }
  expect(defaultName('2026-11-16')).toContain('2026-11-16');
});
