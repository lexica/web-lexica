import axios from 'axios'
import { type ReactNode, useContext, useMemo } from 'react'
import type { WithChildren } from '../../util/types'
import { Language, type MetadataV1, useLanguageFromLocalStorage } from '../../game/language'
import { ValidAnswers } from '../../game/lexicle/score'
import { usePromiseWithMetadata } from '../../util/hooks'

const baseUrl = ["localhost", "127.0.0.1"].includes(window.location.hostname) ? "" : "/web-lexica"

const getMetadata = () => axios.get<MetadataV1>(`${baseUrl}/api/wordle-en-US/metadata.json`).then(({ data }) => data)
const getValidWords = () => axios.get<string[]>(`${baseUrl}/api/wordle-en-US/valid-words.json`).then(({ data }) => data)
const getAnswers = () => axios.get<string[]>(`${baseUrl}/api/wordle-en-US/dictionary.json`).then(({ data }) => data)

const Loading = () => <div>Loading...</div>

export const WithWordleWords = ({ children }: { children: ReactNode }): JSX.Element => {
  const metadataPromise = useMemo(getMetadata, [])
  const validWordsPromise = useMemo(getValidWords, [])
  const answersPromise = useMemo(getAnswers, [])
  const memoizedEmptyArray = useMemo(() => [], [])
  const defaultLanguage = useContext(Language)
  const metadataState = usePromiseWithMetadata(metadataPromise, defaultLanguage.metadata)
  const validWordsState = usePromiseWithMetadata(validWordsPromise, memoizedEmptyArray)
  const answersState = usePromiseWithMetadata(answersPromise, memoizedEmptyArray)

  const loading = useMemo(
    () => [metadataState, validWordsState, answersState].map(s => s.loading).includes(true),
    [metadataState, validWordsState, answersState]
  )

  const dictionary = useMemo(
    () => loading ? [] : [...validWordsState.value, ...answersState.value],
    [loading, validWordsState, answersState]
  )

  const language = useMemo(
    () => loading ? defaultLanguage : { loading, error: false, dictionary, metadata: metadataState.value },
    [loading, metadataState, dictionary, defaultLanguage]
  )

  return loading ? <Loading/> : <>
    <Language.Provider value={language}>
      <ValidAnswers.Provider value={answersState.value}>
        {children}
      </ValidAnswers.Provider>
    </Language.Provider>
  </>
}

export const WithLexicaWords = ({ children }: WithChildren) => {
  const language = useLanguageFromLocalStorage()
  const validAnswers = useMemo(() => language.dictionary, [language])
  return language.loading ? <Loading/> : <>
    <Language.Provider value={language}>
      <ValidAnswers.Provider value={validAnswers}>
        {children}
      </ValidAnswers.Provider>
    </Language.Provider>
  </>
}
