import axios from 'axios'
import * as R from 'ramda'
import { createContext, useEffect, useMemo, useState } from 'react'
import { usePromise } from '../util/hooks'

import { logger } from '../util/logger'
import { storage, useStorage } from '../util/storage'

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

const getAvailableLanguages = () => axios.get<string[]>(
  `${getBaseUrl()}/lexica/api/v1/languages.json`
).then(({ data }) => data)

const getAllMetadata = () => axios.get<MetadataV1[]>(
  `${getBaseUrl()}/lexica/api/v1/metadata.json`
).then(({ data }) => data)

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

export const setLanguageInLocalStorage = (languageCode: string) => {
  storage.set(LocalStorage.LanguageCode, languageCode)
}

const languageCodeDefault = () => storage.getWithDefault({
  key: LocalStorage.LanguageCode,
  parser: R.identity,
  defaultValue: 'en_US'
})

export const useLanguageCodeFromLocalStorage = () => {
  const code = useStorage<string>(LocalStorage.LanguageCode, languageCodeDefault(), R.identity)
  useEffect(() => {
    logger.debug('updated language code:', code)
  }, [code])
  return code
}

export const useLanguageFromLocalStorage = () => {
  const languageCode = useLanguageCodeFromLocalStorage()
  const language = useLanguage(languageCode)
  return language
}

export type LanguageContext = {
  metadata: MetadataV1,
  dictionary: string[],
  loading: boolean,
  error: boolean
}

export const Language = createContext<LanguageContext>({
  metadata: {
    name: '',
    locale: '',
    letterScores: {},
    letterProbabilities: {},
    isBeta: true,
    definitionUrl: ''
  },
  dictionary: [],
  loading: true,
  error: false
})

export const useAvailableLanguageCodes = () => {
  const languages = usePromise(getAvailableLanguages(), [])

  return {
    languages,
    loading: languages.length === 0
  }
}

type MLMRState = {
  [key: string]: MetadataV1
}

export const useMultipleLanguageMetadata = () => {
  const [loading, setLoading] = useState(true)
  const [metadata, setMetadata] = useState<MLMRState>({})

  useEffect(() => {
    getAllMetadata().then(metadatas => {
      const reduced = metadatas.reduce((acc, metadata) => ({ ...acc, [metadata.name]: metadata }), {} as MLMRState)
      setMetadata(reduced)
      setLoading(false)
    })

  }, [setMetadata, setLoading])

  return useMemo(() => ({ loading, metadata }), [loading, metadata])
}
