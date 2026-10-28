import { PersistenceError } from '../../../shared/errors/persistence-error';
import {
  LANGUAGE_STORAGE_KEY,
  LocalStorageLanguagePreferenceStore,
} from './local-storage-language-preference-store';

function memoryStorage(): Storage {
  const data = new Map<string, string>();
  return {
    get length() {
      return data.size;
    },
    clear: () => {
      data.clear();
    },
    getItem: (key) => data.get(key) ?? null,
    key: (index) => [...data.keys()][index] ?? null,
    removeItem: (key) => {
      data.delete(key);
    },
    setItem: (key, value) => {
      data.set(key, value);
    },
  };
}

function failingStorage(): Storage {
  const storage = memoryStorage();
  storage.getItem = () => {
    throw new Error('blocked');
  };
  storage.setItem = () => {
    throw new Error('quota');
  };
  return storage;
}

describe('LocalStorageLanguagePreferenceStore', () => {
  it('returns undefined when nothing was stored', () => {
    expect(new LocalStorageLanguagePreferenceStore(memoryStorage()).load()).toBeUndefined();
  });

  it('stores and reads back the language', () => {
    const storage = memoryStorage();
    new LocalStorageLanguagePreferenceStore(storage).save('ca');
    expect(storage.getItem(LANGUAGE_STORAGE_KEY)).toBe('ca');
    expect(new LocalStorageLanguagePreferenceStore(storage).load()).toBe('ca');
  });

  it('returns an invalid stored value unchanged so the service can ignore it', () => {
    const storage = memoryStorage();
    storage.setItem(LANGUAGE_STORAGE_KEY, 'klingon');
    expect(new LocalStorageLanguagePreferenceStore(storage).load()).toBe('klingon');
  });

  it('reports storage failures as PersistenceError', () => {
    const store = new LocalStorageLanguagePreferenceStore(failingStorage());
    expect(() => store.load()).toThrow(PersistenceError);
    expect(() => {
      store.save('es');
    }).toThrow(PersistenceError);
  });
});
