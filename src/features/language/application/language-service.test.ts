import { PersistenceError } from '../../../shared/errors/persistence-error';
import type { LanguagePreferenceStore } from './language-preference-store';
import { LanguageService } from './language-service';

class FakeStore implements LanguagePreferenceStore {
  saved: string | undefined;
  failLoad = false;
  failSave = false;

  load(): string | undefined {
    if (this.failLoad) throw new PersistenceError('load failed');
    return this.saved;
  }

  save(language: string): void {
    if (this.failSave) throw new PersistenceError('save failed');
    this.saved = language;
  }
}

describe('LanguageService', () => {
  it('uses the device language when nothing was chosen yet', () => {
    const service = new LanguageService(new FakeStore());
    expect(service.getInitial(['ca-ES'])).toBe('ca');
    expect(service.getInitial(['fr'])).toBe('en');
  });

  it('prefers the saved choice over the device language', () => {
    const store = new FakeStore();
    store.saved = 'en';
    expect(new LanguageService(store).getInitial(['es'])).toBe('en');
  });

  it('ignores a saved value that is not a supported language', () => {
    const store = new FakeStore();
    store.saved = 'fr';
    expect(new LanguageService(store).getInitial(['es'])).toBe('es');
  });

  it('falls back to the device language when the choice cannot be read', () => {
    const store = new FakeStore();
    store.failLoad = true;
    expect(new LanguageService(store).getInitial(['ca'])).toBe('ca');
  });

  it('remembers the chosen language', () => {
    const store = new FakeStore();
    const result = new LanguageService(store).choose('es');
    expect(result).toEqual({ ok: true, value: 'es' });
    expect(store.saved).toBe('es');
  });

  it('reports a choice that could not be remembered', () => {
    const store = new FakeStore();
    store.failSave = true;
    expect(new LanguageService(store).choose('es')).toEqual({ ok: false, error: 'not-saved' });
  });

  it('does not hide unexpected errors', () => {
    const store = new FakeStore();
    store.save = () => {
      throw new TypeError('bug');
    };
    expect(() => new LanguageService(store).choose('es')).toThrow(TypeError);
  });
});
