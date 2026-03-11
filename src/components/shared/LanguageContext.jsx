import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, LANGUAGES } from './i18n';

const LanguageContext = createContext({
  lang: 'en',
  setLang: () => {},
  t: k => k,
  LANGUAGES: [],
});

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try { return localStorage.getItem('sofdex_lang') || 'en'; } catch { return 'en'; }
  });

  const applyDir = (code) => {
    const def = LANGUAGES.find(l => l.code === code);
    document.documentElement.dir = def?.rtl ? 'rtl' : 'ltr';
    document.documentElement.lang = code;
  };

  const setLang = (code) => {
    try { localStorage.setItem('sofdex_lang', code); } catch {}
    setLangState(code);
    applyDir(code);
  };

  const t = (key) => {
    return (translations[lang] || translations.en)[key] ?? translations.en[key] ?? key;
  };

  useEffect(() => { applyDir(lang); }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}