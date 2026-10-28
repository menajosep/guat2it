import type { Language } from '../domain/language';

export interface LanguageMessages {
  selectLabel: string;
  /** Shown when the language changed but the choice could not be stored on the device. */
  notRemembered: string;
}

export const LANGUAGE_MESSAGES: Record<Language, LanguageMessages> = {
  en: {
    selectLabel: 'Language',
    notRemembered: 'Could not remember your language choice on this device.',
  },
  es: {
    selectLabel: 'Idioma',
    notRemembered: 'No se pudo recordar tu elección de idioma en este dispositivo.',
  },
  ca: {
    selectLabel: 'Idioma',
    notRemembered: "No s'ha pogut recordar l'elecció d'idioma en aquest dispositiu.",
  },
};
