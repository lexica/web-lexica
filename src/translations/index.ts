import * as R from 'ramda'
import { createContext, useEffect, useMemo, useState } from 'react'
import { logger } from '../util/logger'
import { storage } from '../util/storage'
import {
  ImplementedLanguage,
  languageCodeToTranslationsMap,
  GeneralTranslation,
  defaultTranslation,
  Translation
} from './implemented-languages'

export enum LocalStorage {
  LanguageCode = 'translation'
}

const addTranslationDefaults = <
  T extends GeneralTranslation
>(preferred: GeneralTranslation, defaults: T) => {
  const keys: (keyof T)[] = R.uniq([...Object.keys(defaults), ...Object.keys(preferred)]) as any[]
  return R.reduce(
    (acc: T, key: keyof T) => {
      const preferredKey = key as keyof GeneralTranslation
      return {
        ...acc,
        [key]: {
          ...(defaults[key] ? defaults[key] : {}),
          ...(preferred[preferredKey] ? preferred[preferredKey] : {})
        }
      }
    },
    {} as T,
    keys
  )
}

const translationsWithDefaults = (lang: ImplementedLanguage) => {
  const parentLang = lang.match(/(?<parentLang>.*)-/)?.groups?.parentLang
  const preferredTranslations = languageCodeToTranslationsMap[lang]

  if (parentLang && isImplemented(parentLang)) {
    const parentTranslation = languageCodeToTranslationsMap[parentLang]
    const withParentLangDefaults = addTranslationDefaults(preferredTranslations, parentTranslation)
    return addTranslationDefaults(withParentLangDefaults, defaultTranslation)
  }

  return addTranslationDefaults(preferredTranslations, defaultTranslation)
}

const isImplemented = (lang: string): lang is ImplementedLanguage => {
  for (const validLang in ImplementedLanguage) {
    if (lang === ImplementedLanguage[validLang as any as keyof typeof ImplementedLanguage]) {
      return true
    }
  }
  return false
}

const getClosestLanguageIfPossible = (languageCode: string) => {
  const [language, region] = languageCode.split('-')

  const bestFit = `${language}-r${region}`

  if (isImplemented(bestFit)) return bestFit

  if (isImplemented(language)) return language
  
  return ImplementedLanguage.English
}

const getBestTranslation = () => {
  const preset = storage.get({ key: LocalStorage.LanguageCode, parser: R.identity })
  if (preset && isImplemented(preset)) return preset
  return getClosestLanguageIfPossible(navigator.language)
}

export const useTranslations = () => {
  const [baseLanguage, setBaseLanguage] = useState(getBestTranslation())

  const language = isImplemented(baseLanguage) ? baseLanguage : ImplementedLanguage.English

  const translation = useMemo(() => translationsWithDefaults(language), [language])


  useEffect(() => {
    logger.debug('running translations useEffect...')
    const handleStorageUpdate = (event: StorageEvent) => {
      if (event.key === LocalStorage.LanguageCode) setBaseLanguage(getBestTranslation())
    }

    window.addEventListener('storage', handleStorageUpdate)

    return () => window.removeEventListener('storage', handleStorageUpdate)
  }, [setBaseLanguage])

  return translation
}

export type TranslationsContext = Translation

export const Translations = createContext<TranslationsContext>(defaultTranslation)
