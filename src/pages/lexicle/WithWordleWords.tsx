import axios from 'axios'
import { ReactNode, useContext, useMemo } from 'react'
import { Language, MetadataV1 } from '../../game/language'
import { ValidAnswers } from '../../game/lexicle/score'
import { usePromiseWithMetadata } from '../../util/hooks'

const getMetadata = () => axios.get<MetadataV1>('/web-lexica/api/wordle-en-US/metadata.json').then(({ data }) => data)
const getValidWords = () => axios.get<string[]>('/web-lexica/api/wordle-en-US/valid-words.json').then(({ data }) => data)
const getAnswers = () => axios.get<string[]>('/web-lexica/api/wordle-en-US/dictionary.json').then(({ data }) => data)

const Loading = () => <div>Loading...</div>

const WithWordleWords = ({ children }: { children: ReactNode }): JSX.Element => {
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

export default WithWordleWords
