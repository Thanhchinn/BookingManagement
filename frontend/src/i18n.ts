import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import viTranslation from './assets/locales/vi/translation.json';
import enTranslation from './assets/locales/en/translation.json';

i18n
  .use(LanguageDetector) // Tự động nhận diện ngôn ngữ từ trình duyệt hoặc localStorage
  .use(initReactI18next) // Liên kết i18next với react-i18next
  .init({
    resources: {
      vi: {
        translation: viTranslation,
      },
      en: {
        translation: enTranslation,
      },
    },
    fallbackLng: 'vi',
    supportedLngs: ['vi', 'en'],
    debug: false,
    interpolation: {
      escapeValue: false, // React đã tự động ngăn chặn XSS
    },
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'sessionStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'], // Lưu lựa chọn ngôn ngữ của người dùng vào localStorage
    },
  });

export default i18n;
