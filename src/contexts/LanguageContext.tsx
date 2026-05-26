'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Lang, t as translate, TranslationKey } from '@/lib/translations';

interface LanguageContextType {
  lang: Lang;
  toggleLang: () => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('ar');

  useEffect(() => {
    const saved = localStorage.getItem('lang') as Lang | null;
    if (saved === 'ar' || saved === 'en') {
      setLang(saved);
      applyLang(saved);
    } else {
      applyLang('ar');
    }
  }, []);

  const applyLang = (l: Lang) => {
    const root = document.documentElement;
    root.setAttribute('lang', l);
    root.setAttribute('dir', l === 'ar' ? 'rtl' : 'ltr');
  };

  const toggleLang = () => {
    const next: Lang = lang === 'ar' ? 'en' : 'ar';
    setLang(next);
    localStorage.setItem('lang', next);
    applyLang(next);
  };

  const tFunc = (key: TranslationKey): string => translate(key, lang);

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t: tFunc }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
