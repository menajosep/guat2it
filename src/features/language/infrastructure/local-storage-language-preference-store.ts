import { PersistenceError } from '../../../shared/errors/persistence-error';
import type { LanguagePreferenceStore } from '../application/language-preference-store';

export const LANGUAGE_STORAGE_KEY = 'guat2it.language';

export class LocalStorageLanguagePreferenceStore implements LanguagePreferenceStore {
  constructor(private readonly storage: Pick<Storage, 'getItem' | 'setItem'>) {}

  load(): string | undefined {
    try {
      return this.storage.getItem(LANGUAGE_STORAGE_KEY) ?? undefined;
    } catch (error) {
      throw new PersistenceError('Could not read the language choice.', { cause: error });
    }
  }

  save(language: string): void {
    try {
      this.storage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch (error) {
      throw new PersistenceError('Could not store the language choice.', { cause: error });
    }
  }
}
