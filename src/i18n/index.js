import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import en from './locales/en/translation.json';
import hi from './locales/hi/translation.json';

const resources = {
  en: { translation: en },
  hi: { translation: hi }
};

// Get device locale (e.g., 'en-US' or 'hi-IN')
// const deviceLanguage = 'hi-IN'
const deviceLanguage = Localization.getLocales()[0].languageCode;

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: deviceLanguage, // Use device language initially
    fallbackLng: 'en',    // Fallback if key is missing in Hindi
    compatibilityJSON: 'v3',
    interpolation: {
      escapeValue: false // React already escapes values
    },
    react: {
      useSuspense: false // Set to false for React Native
    }
  });

export default i18n;