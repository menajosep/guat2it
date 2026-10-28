import { DEFAULT_LANGUAGE, detectLanguage, isLanguage, LANGUAGES } from './language';

describe('isLanguage', () => {
  it('accepts the three supported languages only', () => {
    for (const code of LANGUAGES) expect(isLanguage(code)).toBe(true);
    expect(isLanguage('fr')).toBe(false);
    expect(isLanguage('')).toBe(false);
    expect(isLanguage('EN')).toBe(false);
    expect(isLanguage('toString')).toBe(false);
  });
});

describe('detectLanguage', () => {
  it('uses a supported device language', () => {
    expect(detectLanguage(['ca'])).toBe('ca');
    expect(detectLanguage(['es'])).toBe('es');
    expect(detectLanguage(['en'])).toBe('en');
  });

  it('accepts regional variants', () => {
    expect(detectLanguage(['es-MX'])).toBe('es');
    expect(detectLanguage(['ca-ES'])).toBe('ca');
    expect(detectLanguage(['en-GB'])).toBe('en');
    expect(detectLanguage(['ES_ar'])).toBe('es');
  });

  it('takes the first supported language in order of preference', () => {
    expect(detectLanguage(['fr-FR', 'ca-ES', 'es'])).toBe('ca');
  });

  it('falls back to English when no language is supported or none is given', () => {
    expect(detectLanguage(['fr-FR', 'de'])).toBe(DEFAULT_LANGUAGE);
    expect(detectLanguage([])).toBe('en');
    expect(detectLanguage([''])).toBe('en');
  });
});
