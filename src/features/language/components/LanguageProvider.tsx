import { useEffect, useMemo, useState, type ReactNode } from 'react';
import type { LanguageService } from '../application/language-service';
import type { Language } from '../domain/language';
import { LanguageContextProvider, type LanguageState } from '../hooks/language-context';

interface LanguageProviderProps {
  service: LanguageService;
  deviceLanguages?: readonly string[];
  children: ReactNode;
}

/** Holds the interface language, remembers the user's choice and keeps `<html lang>` in sync. */
export function LanguageProvider({
  service,
  deviceLanguages = navigator.languages,
  children,
}: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(() =>
    service.getInitial(deviceLanguages),
  );
  const [notRemembered, setNotRemembered] = useState(false);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const state = useMemo<LanguageState>(
    () => ({
      language,
      notRemembered,
      setLanguage: (chosen) => {
        setLanguageState(chosen);
        setNotRemembered(!service.choose(chosen).ok);
      },
    }),
    [language, notRemembered, service],
  );

  return <LanguageContextProvider value={state}>{children}</LanguageContextProvider>;
}
