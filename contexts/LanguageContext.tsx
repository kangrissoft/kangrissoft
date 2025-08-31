import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

// We will fetch the translation files instead of importing them to avoid module resolution and syntax issues.

interface LanguageContextType {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string, replacements?: { [key: string]: string | number }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('portfolio-language') || 'en';
  });
  const [translations, setTranslations] = useState<{ [key: string]: any } | null>(null);

  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        const [enResponse, idResponse] = await Promise.all([
          fetch('/locales/en.json'),
          fetch('/locales/id.json')
        ]);
        if (!enResponse.ok || !idResponse.ok) {
          throw new Error(`HTTP error! status: ${enResponse.status}, ${idResponse.status}`);
        }
        const enData = await enResponse.json();
        const idData = await idResponse.json();
        setTranslations({ en: enData, id: idData });
      } catch (error) {
        console.error("Failed to load translation files:", error);
      }
    };
    fetchTranslations();
  }, []);

  useEffect(() => {
    localStorage.setItem('portfolio-language', language);
  }, [language]);

  const t = useCallback((key: string, replacements?: { [key: string]: string | number }): string => {
    if (!translations) {
      return key; // Return the key if translations are not loaded yet
    }
    let translation = translations[language]?.[key] || key;
    if (replacements) {
        Object.keys(replacements).forEach(placeholder => {
            translation = translation.replace(`{{${placeholder}}}`, String(replacements[placeholder]));
        });
    }
    return translation;
  }, [language, translations]);

  // To prevent rendering with untranslated keys, wait for translations to load.
  if (!translations) {
    return null; // Or render a loading spinner
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
