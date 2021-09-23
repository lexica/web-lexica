import * as R from 'ramda'
import { createContext, useEffect, useMemo, useState } from 'react'
import { logger } from '../util/logger'
import { ImplementedLanguage, languageCodeToTranslationsMap } from './implemented-languages'

type Translation = typeof languageCodeToTranslationsMap[keyof typeof languageCodeToTranslationsMap]

const addTranslationDefaults = (prefered: Partial<Translation>, defaults: Translation) => R.reduce(
  (acc: Translation, key: keyof Translation) => ({ ...acc, [key]: { ...defaults[key], ...(prefered[key] ? prefered[key] : {}) }}),
  {} as Translation,
  Object.keys(defaults) as any[] as (keyof Translation)[]
)

const translationsWithDefaults = (lang: ImplementedLanguage) => {
  const parentLang = lang.match(/(?<parentLang>.*)-/)?.groups?.parentLang
  const defaultTranslations = languageCodeToTranslationsMap[ImplementedLanguage.English]
  const preferedTranslations = languageCodeToTranslationsMap[lang]

  if (parentLang && isImplemented(parentLang)) {
    const withParentLangDefaults = addTranslationDefaults(preferedTranslations, languageCodeToTranslationsMap[parentLang])
    return addTranslationDefaults(withParentLangDefaults, defaultTranslations)
  }

  return addTranslationDefaults(preferedTranslations, defaultTranslations)
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
  const preset = localStorage.getItem('translation')
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
      if (event.key === 'translation') setBaseLanguage(getBestTranslation())
    }

    window.addEventListener('storage', handleStorageUpdate)

    return () => window.removeEventListener('storage', handleStorageUpdate)
  }, [setBaseLanguage])

  return translation
}

export type TranslationsContext = typeof languageCodeToTranslationsMap[ImplementedLanguage]

export const Translations = createContext<TranslationsContext>(languageCodeToTranslationsMap['en'])
