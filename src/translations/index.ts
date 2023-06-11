import i18n from 'i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { TranslationsFn, LanguageTitlesFn } from './types'
import { createContext } from 'react';
import { logger } from '../util/logger';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: true,

    interpolation: {
      escapeValue: false,
    },

    backend: {
      loadPath: '/web-lexica/locales/{{lng}}/{{ns}}.json'
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage']
    }
  })

export default i18n;

export const Translations = createContext<{
  translationsFn: TranslationsFn,
  languageTitlesFn: LanguageTitlesFn,
  changeLanguage: (languageCode: string) => void,
  ready: boolean
}>({
  translationsFn: ((..._: any[]) => { logger.warn('trying to use `translationsFn` without context') }) as any,
  languageTitlesFn: ((..._: any[]) => { logger.warn('trying to use `languageTitlesFn` without context') }) as any,
  changeLanguage: (..._: any[]) => { logger.warn('trying to use `changeLanguage` without context') },
  ready: false
})
