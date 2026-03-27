import { createContext, useCallback, useContext, useMemo } from 'react';
import { usePersonalization } from './PersonalizationContext';

import en from '../locales/en.json';
import es from '../locales/es.json';
import fr from '../locales/fr.json';
import de from '../locales/de.json';
import hi from '../locales/hi.json';

const locales = { en, es, fr, de, hi };

const LanguageContext = createContext(null);

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};

/**
 * Resolve a dot-separated key from a nested object.
 * e.g. get(obj, 'settings.title') => obj.settings.title
 */
const get = (obj, path) => {
  if (!obj || !path) return undefined;
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
};

export const LanguageProvider = ({ children }) => {
  const { settings } = usePersonalization();
  const lang = settings.language || 'en';

  const t = useCallback(
    (key, fallback) => {
      // Try current language first, then English fallback
      const value = get(locales[lang], key) ?? get(locales.en, key);
      return value ?? fallback ?? key;
    },
    [lang]
  );

  const value = useMemo(() => ({ t, language: lang }), [t, lang]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
