import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import translation files directly
import translationEN from './locales/en/translation.json';
import translationZH from './locales/zh/translation.json';

// Define resources
const resources = {
  en: {
    translation: translationEN
  },
  zh: {
    translation: translationZH
  }
};

i18n
  .use(initReactI18next) // Pass the i18n instance to react-i18next
  .init({
    resources, // Add resources directly
    supportedLngs: ['en', 'zh'], // Add languages you support
    fallbackLng: "zh", // Use English if detected language is not available
    lng: "zh", // Set initial language explicitly
    interpolation: {
      escapeValue: false, // React already safes from xss
    },
    react: {
      useSuspense: false, // Set to true if you want to use Suspense
    }
  });

export default i18n;
