import { describe, it, expect } from 'vitest';
import { DICTIONARY, type Locale } from '../src/i18n.js';
import { TOKENS } from '@uzmonopoly/shared';

describe('Trilingual i18n Dictionary', () => {
  const locales: Locale[] = ['uz', 'ru', 'en'];

  it('contains translations for uz, ru, en', () => {
    for (const loc of locales) {
      expect(DICTIONARY[loc]).toBeDefined();
      expect(DICTIONARY[loc].appName).toBe('UzMonopoly');
    }
  });

  it('has identical keys across all languages', () => {
    const uzKeys = Object.keys(DICTIONARY.uz).sort();
    const ruKeys = Object.keys(DICTIONARY.ru).sort();
    const enKeys = Object.keys(DICTIONARY.en).sort();

    expect(ruKeys).toEqual(uzKeys);
    expect(enKeys).toEqual(uzKeys);
  });

  it('translates all 6 tokens in all languages', () => {
    for (const loc of locales) {
      for (const token of TOKENS) {
        expect(DICTIONARY[loc].tokens[token.id]).toBeDefined();
        expect(DICTIONARY[loc].tokens[token.id].length).toBeGreaterThan(3);
      }
    }
  });
});
