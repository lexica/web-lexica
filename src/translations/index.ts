import * as R from 'ramda'
import { createContext, useEffect, useMemo, useState } from 'react'
import { logger } from '../util/logger'

import * as en from './en'

enum ImplementedLanguage {
  English = 'en'
}

const languageCodeToTranslationsMap: { [P in ImplementedLanguage]: { languageTitles: { [key: string]: string}}} = {
  [ImplementedLanguage.English]: en
}

const getTranslationPreference = () => {
  const preset = localStorage.getItem('translation')
  return preset || R.head(navigator.language.split(/-_/))! || ''
}

const isImplemented = (lang: string): lang is ImplementedLanguage => {
  for (const validLang in ImplementedLanguage) {
    if (lang === validLang) return true
  }

  return false
}

export const useTranslations = () => {
  const [baseLanguage, setBaseLanguage] = useState(getTranslationPreference())

  const language = isImplemented(baseLanguage) ? baseLanguage : ImplementedLanguage.English

  const translation = useMemo(() => languageCodeToTranslationsMap[language], [language])


  useEffect(() => {
    logger.debug('running translations useEffect...')
    const handleStorageUpdate = (event: StorageEvent) => {
      if (event.key === 'translation') setBaseLanguage(getTranslationPreference())
    }

    window.addEventListener('storage', handleStorageUpdate)

    return () => window.removeEventListener('storage', handleStorageUpdate)
  }, [setBaseLanguage])

  return translation
}

export type TranslationsContext = typeof languageCodeToTranslationsMap[ImplementedLanguage]

export const Translations = createContext<TranslationsContext>(languageCodeToTranslationsMap['en'])
