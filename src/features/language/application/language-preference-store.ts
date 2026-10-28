/** Storage port for the user's language choice. Implementations throw `PersistenceError` on failure. */
export interface LanguagePreferenceStore {
  /** The stored value as is (it may be invalid), or `undefined` when nothing was stored. */
  load(): string | undefined;
  save(language: string): void;
}
