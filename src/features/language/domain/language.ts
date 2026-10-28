export const LANGUAGES = ['en', 'es', 'ca'] as const;

export type Language = (typeof LANGUAGES)[number];

export const DEFAULT_LANGUAGE: Language = 'en';

/** Each language written in itself, so users can find theirs whatever language is active. */
export const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  es: 'Español',
  ca: 'Català',
};

export function isLanguage(value: string): value is Language {
  return (LANGUAGES as readonly string[]).includes(value);
}

/** Picks the first supported language among the device's preferences (`es-MX` counts as `es`). */
export function detectLanguage(preferred: readonly string[]): Language {
  for (const tag of preferred) {
    const primary = tag.trim().toLowerCase().split(/[-_]/)[0] ?? '';
    if (isLanguage(primary)) return primary;
  }
  return DEFAULT_LANGUAGE;
}
