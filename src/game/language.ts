import axios from 'axios'
import { createContext, useEffect, useState } from 'react'

import { logger } from '../util/logger'
import { LocalStorage as TranslationsLocalStorage } from '../translations'
import { getUseEffectLocalStorageListener, getWithDefault } from '../util/local-storage'
import * as R from 'ramda'

export type MetadataV1 = {
  name: string,
  locale: string,
  isBeta: boolean,
  definitionUrl: string,
  letterProbabilities: { [key: string]: number[] },
  letterScores: { [key: string]: number }
}

export type LanguageState = {
  loading: boolean,
  error: boolean,
  metadata: MetadataV1,
  dictionary: string[]
}

export enum LocalStorage {
  LanguageCode = 'game-language'
}

const getBaseUrl = () => `${window.location.protocol}//${window.location.host}`

export const getLanguageMetadata = (languageCode: string) => axios.get<MetadataV1>(
  `${getBaseUrl()}/lexica/api/v1/language/${languageCode}/metadata.json`
).then(({ data }) => data)

const getDictionary = (languageCode: string) => axios.get<string[]>(
  `${getBaseUrl()}/lexica/api/v1/language/${languageCode}/dictionary.json`
).then(({ data }) => data)

export const useLanguage = (languageCode: string) => {
  const [state, setState] = useState<LanguageState>({
    loading: true,
    error: false,
    metadata: { name: '', locale: '', isBeta: true, definitionUrl: '', letterProbabilities: {}, letterScores: {} },
    dictionary: []
  })

  useEffect(() => {
    logger.debug('running language useEffect...')
    if (languageCode.length) {
      Promise.all([
        getLanguageMetadata(languageCode),
        getDictionary(languageCode)
      ]).then(([metadata, dictionary]) => {
        setState({
          loading: false,
          error: false,
          dictionary,
          metadata
        })
      }).catch((err) => {
        setState({
          loading: false,
          error: true,
          dictionary: [],
          metadata: {} as any
        })
        return err
      })

    }
  }, [languageCode, setState])

  return state
}

const languageCodeIsSet = () => localStorage.getItem(LocalStorage.LanguageCode) != null

const getDefaultLanguageCode = () => localStorage.getItem(TranslationsLocalStorage.LanguageCode) || 'en_US'

const getLanguageCode = () => getWithDefault({
  key: LocalStorage.LanguageCode,
  parser: R.identity,
  defaultValue: 'en_US'
})

export const useLanguageFromLocalStorage = () => {
  const [languageCode, setLanguageCode] = useState(getLanguageCode)
  const language = useLanguage(languageCode)

  useEffect(() => {
    const cleanup1 = getUseEffectLocalStorageListener(
      LocalStorage.LanguageCode,
      (newLanguageCode) => setLanguageCode(newLanguageCode || getDefaultLanguageCode())
    )

    const cleanup2 = getUseEffectLocalStorageListener(
      TranslationsLocalStorage.LanguageCode,
      (newLangaugeCode) => {
        if (languageCodeIsSet()) return

        setLanguageCode(newLangaugeCode || getDefaultLanguageCode())
      }
    )

    return () => { [cleanup1, cleanup2].map(fn => fn()) }
  }, [setLanguageCode])
  return language
}

export type LanguageContext = { metadata: MetadataV1, dictionary: string[] }

export const Language = createContext<LanguageContext>({
  metadata: {
    name: '',
    locale: '',
    letterScores: {},
    letterProbabilities: {},
    isBeta: true,
    definitionUrl: ''
  },
  dictionary: []
})
