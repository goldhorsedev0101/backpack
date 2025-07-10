import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import heTranslations from './locales/he.json';
import enTranslations from './locales/en.json';

const resources = {
  he: {
    translation: heTranslations
  },
  en: {
    translation: enTranslations
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'he', // עברית כשפת ברירת מחדל
    fallbackLng: 'he',
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

// Set RTL direction for Hebrew by default on client side
if (typeof document !== 'undefined') {
  document.dir = 'rtl';
  document.documentElement.lang = 'he';
}

export default i18n;