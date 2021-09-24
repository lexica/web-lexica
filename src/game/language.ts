import axios from 'axios'
import { createContext, useEffect, useState } from 'react'
import { logger } from '../util/logger'

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

const getBaseUrl = () => `${window.location.protocol}//${window.location.host}`

export const getLanguageMetadata = (languageCode: string) => axios.get<MetadataV1>(
  `${getBaseUrl()}/lexica/api/v1/language/${languageCode}/metadata.json`
).then(({ data }) => data)

const getDictionary = (languageCode: string) => axios.get<string[]>(
  `${getBaseUrl()}/lexica/api/v1/language/${languageCode}/metadata.json`
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
