import { PersistenceError } from '../../../shared/errors/persistence-error';
import { fail, ok, type Result } from '../../../shared/types/result';
import { detectLanguage, isLanguage, type Language } from '../domain/language';
import type { LanguagePreferenceStore } from './language-preference-store';

export class LanguageService {
  constructor(private readonly store: LanguagePreferenceStore) {}

  /** The remembered language, else the best match among the device languages, else English. */
  getInitial(deviceLanguages: readonly string[]): Language {
    let saved: string | undefined;
    try {
      saved = this.store.load();
    } catch (error) {
      // An unreadable preference must not stop the app from starting; the defaults apply.
      if (!(error instanceof PersistenceError)) throw error;
    }
    return saved !== undefined && isLanguage(saved) ? saved : detectLanguage(deviceLanguages);
  }

  /** The language applies even when it could not be remembered, which is reported as `not-saved`. */
  choose(language: Language): Result<Language, 'not-saved'> {
    try {
      this.store.save(language);
    } catch (error) {
      if (!(error instanceof PersistenceError)) throw error;
      return fail('not-saved');
    }
    return ok(language);
  }
}
