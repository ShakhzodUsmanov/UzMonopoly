import { describe, it, expect } from 'vitest';
import { DICTIONARY, type Locale } from '../src/i18n.js';

describe('Phase 6: Polish, Disclaimers, Keyboard Navigation & Special Modes', () => {
  const locales: Locale[] = ['uz', 'ru', 'en'];

  it('contains legal disclaimer mentioning UzMonopoly and UzBiznes in all 3 languages', () => {
    for (const loc of locales) {
      const t = DICTIONARY[loc];
      expect(t.footerDisclaimer).toBeDefined();
      expect(t.footerDisclaimer.length).toBeGreaterThan(50);
      expect(t.footerDisclaimer).toContain('UzMonopoly');
      expect(t.footerDisclaimer).toContain('UzBiznes');
    }
  });

  it('contains keyboard shortcuts guidance for accessibility in all 3 languages', () => {
    for (const loc of locales) {
      const t = DICTIONARY[loc];
      expect(t.keyboardShortcutsGuide).toBeDefined();
      expect(t.keyboardShortcutsGuide).toContain('Esc');
    }
  });

  it('contains Short Game mode and Add Bot translations', () => {
    for (const loc of locales) {
      const t = DICTIONARY[loc];
      expect(t.modeShort).toBeTruthy();
      expect(t.modeFull).toBeTruthy();
      expect(t.addBot).toBeTruthy();
      expect(t.shortGameRemaining).toBeTruthy();
    }
  });

  it('maintains symmetrical dictionary keys across all languages', () => {
    const uzKeys = Object.keys(DICTIONARY.uz).sort();
    const ruKeys = Object.keys(DICTIONARY.ru).sort();
    const enKeys = Object.keys(DICTIONARY.en).sort();

    expect(ruKeys).toEqual(uzKeys);
    expect(enKeys).toEqual(uzKeys);
  });
});
