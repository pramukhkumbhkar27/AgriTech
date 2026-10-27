import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from './locales/en.json';
import hiTranslation from './locales/hi.json';

const savedLanguage = localStorage.getItem('agritech_lang') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      hi: { translation: hiTranslation },
    },
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export const changeLanguage = (lang) => {
  i18n.changeLanguage(lang);
  localStorage.setItem('agritech_lang', lang);
};

export default i18n;
