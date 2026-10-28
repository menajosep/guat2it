import { createContext, useContext } from 'react';
import { DEFAULT_LANGUAGE, type Language } from '../domain/language';

export interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
  /** True while the latest choice could not be stored on the device. */
  notRemembered: boolean;
}

// Without a provider the app is simply in English, which keeps isolated components renderable.
const LanguageContext = createContext<LanguageState>({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => undefined,
  notRemembered: false,
});

export const LanguageContextProvider = LanguageContext.Provider;

export function useLanguage(): LanguageState {
  return useContext(LanguageContext);
}
