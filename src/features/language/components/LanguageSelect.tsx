import { LANGUAGE_NAMES, LANGUAGES, isLanguage } from '../domain/language';
import { useLanguage } from '../hooks/language-context';
import { LANGUAGE_MESSAGES } from '../messages/language-messages';

export function LanguageSelect() {
  const { language, setLanguage } = useLanguage();

  return (
    <select
      className="language-select"
      aria-label={LANGUAGE_MESSAGES[language].selectLabel}
      value={language}
      onChange={(event) => {
        const chosen = event.target.value;
        if (isLanguage(chosen)) setLanguage(chosen);
      }}
    >
      {LANGUAGES.map((code) => (
        <option key={code} value={code} lang={code}>
          {LANGUAGE_NAMES[code]}
        </option>
      ))}
    </select>
  );
}
