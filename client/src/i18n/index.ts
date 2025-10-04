import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import he from './locales/he.json';

const resources = {
  en: {
    translation: en
  },
  he: {
    translation: he
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: !window.location.hostname.includes('replit.app'),
    cache: {
      enabled: false
    },
    
    // Log missing translation keys in development
    missingKeyHandler: (lngs: readonly string[], ns: string, key: string, fallbackValue: string, updateMissing: boolean, options: any) => {
      if (!window.location.hostname.includes('replit.app')) {
        console.warn(`Missing translation key: ${lngs[0]}.${ns}.${key}`, {
          languages: lngs,
          namespace: ns,
          key: key,
          fallback: fallbackValue,
          updateMissing
        });
      }
    },

    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    },

    // Set up locale change handler for date formatting
    react: {
      useSuspense: false
    }
  });

export default i18n;