import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, LANGUAGES } from './i18n';
import { translationExtensions } from './i18nExtensions';

// Merge extensions into translations
const mergedTranslations = Object.keys(translations).reduce((acc, lang) => {
  acc[lang] = { ...translations[lang], ...(translationExtensions[lang] || {}) };
  return acc;
}, { ...translations });

const LanguageContext = createContext({
  lang: 'en',
  setLang: () => {},
  t: k => k,
  LANGUAGES: [],
});

/**
 * Auto-detect user language with intelligent fallback
 * Priority: localStorage → browser language → default (English)
 */
function detectUserLanguage() {
  // 1. Check localStorage for saved preference
  try {
    const saved = localStorage.getItem('sofdex_lang');
    if (saved && LANGUAGES.some(l => l.code === saved)) {
      return saved;
    }
  } catch {
    // Silent fail - localStorage may not be available
  }

  // 2. Check browser language
  try {
    const browserLang = navigator.language?.split('-')[0];
    if (browserLang && LANGUAGES.some(l => l.code === browserLang)) {
      return browserLang;
    }
  } catch {
    // Silent fail
  }

  // 3. Fallback to English
  return 'en';
}

export function LanguageProvider({ children }) {
  // Initialize with auto-detected language
  const [lang, setLangState] = useState(() => detectUserLanguage());
  const [isInitialized, setIsInitialized] = useState(false);

  // Apply language on mount
  useEffect(() => {
    applyDir(lang);
    setIsInitialized(true);
  }, []);

  const applyDir = (code) => {
    const def = LANGUAGES.find(l => l.code === code);
    document.documentElement.dir = def?.rtl ? 'rtl' : 'ltr';
    document.documentElement.lang = code;
  };

  const setLang = (code) => {
    // Validate language code
    if (!LANGUAGES.some(l => l.code === code)) {
      console.warn(`[Translation] Invalid language code: ${code}`);
      return;
    }

    try {
      localStorage.setItem('sofdex_lang', code);
    } catch {
      // Silent fail - localStorage may not be available
    }

    setLangState(code);
    applyDir(code);
  };

  /**
   * Translation function with hierarchical fallback
   * Supports: key, section.subsection.element
   * Automatically falls back to English if key missing
   */
  const t = (key) => {
    if (!key || typeof key !== 'string') {
      return '';
    }

    // Split hierarchical keys (e.g., "wallet.balance" → ["wallet", "balance"])
    const keys = key.split('.');
    
    // Try to find in current language
    let value = mergedTranslations[lang];
    for (const k of keys) {
      value = value?.[k];
    }

    // If found in current language, return it
    if (value) {
      return value;
    }

    // Fallback to English if different language
    if (lang !== 'en') {
      value = mergedTranslations.en;
      for (const k of keys) {
        value = value?.[k];
      }
      if (value) {
        return value;
      }
    }

    // Log missing key in development
    if (import.meta.env.DEV) {
      console.warn(`[Translation] Missing key "${key}" in ${lang}`);
    }

    // Return key as fallback (won't show raw key to users, English will be used)
    return key;
  };

  return (
    <LanguageContext.Provider 
      value={{ 
        lang, 
        setLang, 
        t, 
        LANGUAGES,
        isInitialized,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}