/**
 * i18n Configuration
 * 
 * Internationalization setup using i18next and react-i18next.
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { Platform, NativeModules } from 'react-native';

import en from './locales/en.json';
import ja from './locales/ja.json';

// Get device language
function getDeviceLanguage(): string {
  if (Platform.OS === 'web') {
    return navigator.language?.split('-')[0] || 'en';
  }
  
  // iOS
  const iosLanguage = NativeModules.SettingsManager?.settings?.AppleLocale ||
    NativeModules.SettingsManager?.settings?.AppleLanguages?.[0];
  
  // Android
  const androidLanguage = NativeModules.I18nManager?.localeIdentifier;
  
  const deviceLanguage = iosLanguage || androidLanguage || 'en';
  return deviceLanguage.split(/[-_]/)[0];
}

// Resources
const resources = {
  en: { translation: en },
  ja: { translation: ja },
};

// Initialize i18n
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getDeviceLanguage(),
    fallbackLng: 'en',
    
    interpolation: {
      escapeValue: false, // React already escapes
    },
    
    // Namespace
    defaultNS: 'translation',
    
    // React specific
    react: {
      useSuspense: false,
    },
  });

export default i18n;

// Export utilities
export { useTranslation } from 'react-i18next';

export function changeLanguage(lang: 'en' | 'ja'): Promise<void> {
  return i18n.changeLanguage(lang);
}

export function getCurrentLanguage(): string {
  return i18n.language;
}

export const supportedLanguages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
] as const;

