import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  translations,
  formatLifetimeLocalized,
  formatAgeLocalized,
  translateStage
} from './translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      const saved = localStorage.getItem('hr_diagram_lang');
      if (saved === 'cs' || saved === 'en') return saved;
      const navLang = navigator.language || '';
      return navLang.toLowerCase().startsWith('cs') || navLang.toLowerCase().startsWith('sk') ? 'cs' : 'en';
    } catch {
      return 'en';
    }
  });

  const setLang = useCallback((newLang) => {
    setLangState(newLang);
    try {
      localStorage.setItem('hr_diagram_lang', newLang);
    } catch {}
  }, []);

  const toggleLang = useCallback(() => {
    setLang((prev) => (prev === 'en' ? 'cs' : 'en'));
  }, [setLang]);

  // Sync with HTML lang attribute and document title
  useEffect(() => {
    document.documentElement.lang = lang;
    const title = lang === 'cs'
      ? 'H–R diagram | Interaktivní Hertzsprungův–Russellův diagram'
      : 'H–R Diagram Studio | Interactive Hertzsprung–Russell diagram';
    document.title = title;
  }, [lang]);

  // Translation lookup helper: t('key', { param: 'value' })
  const t = useCallback((key, params = {}) => {
    const dict = translations[lang] || translations.en;
    let text = dict[key] || translations.en[key] || key;

    if (params && typeof text === 'string') {
      Object.entries(params).forEach(([paramKey, val]) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(val));
      });
    }

    return text;
  }, [lang]);

  const formatLifetime = useCallback((massSolar) => {
    return formatLifetimeLocalized(massSolar, lang);
  }, [lang]);

  const formatAge = useCallback((years) => {
    return formatAgeLocalized(years, lang);
  }, [lang]);

  const translateStageName = useCallback((stage) => {
    return translateStage(stage, lang);
  }, [lang]);

  const value = {
    lang,
    setLang,
    toggleLang,
    t,
    formatLifetime,
    formatAge,
    translateStageName
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// oxlint-disable-next-line react/only-export-components
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
