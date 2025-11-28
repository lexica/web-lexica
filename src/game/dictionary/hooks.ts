import { createContext, useEffect, useMemo, useState } from 'react'

import { getWordsOnBoard } from './util'
import type { ToWorkerMessage } from './types'

import { getBoard } from '../board/util'
import type { LanguageState } from '../language'

import { logger } from '../../util/logger'
import { promisifyWorker } from '../../util/web-worker'

import Worker from './dictionary.worker.ts?worker'

const worker = window.Worker ? new Worker() : undefined

const resolveDictionary = (line: string[], fullDictionary: string[], minimumWordLength: number) => {
  if (window.Worker) {
    const toSend = {
      board: getBoard(line),
      dictionary: fullDictionary,
      minWordLength: minimumWordLength
    }
    return promisifyWorker<ToWorkerMessage, string[]>(worker!, toSend)
  }
  return Promise.resolve(getWordsOnBoard(getBoard(line), fullDictionary, minimumWordLength))
}


export type DictionaryState = {
  boardDictionary: string[],
  loading: boolean
}

export const useCustomDictionaryWithBoard = (dictionary: string[], board: string[], minimumWordLength: number) => {
  const [loading, setLoading] = useState(true)
  const [boardDictionary, setDictionary] = useState<string[]>([])

  useEffect(() => {
    logger.debug('running dictionary useEffect')
    setLoading(true)
    resolveDictionary(board, dictionary, minimumWordLength).then(dict => {
      setDictionary(dict)
      setLoading(false)
    })

  }, [
    board,
    dictionary,
    setDictionary,
    setLoading,
    minimumWordLength
  ])

  return useMemo(() => ({ boardDictionary, loading }), [boardDictionary, loading])
}

export const useBoardDictionary = (languageState: LanguageState, board: string[], minimumWordLength: number) => {
  const [loading, setLoading] = useState(true)
  const [boardDictionary, setDictionary] = useState<string[]>([])

  useEffect(() => {
    logger.debug('running dictionary useEffect')
    setLoading(true)
    resolveDictionary(board, languageState.dictionary, minimumWordLength).then(dict => {
      setDictionary(dict)
      setLoading(false)
    })

  }, [
    board,
    languageState,
    setDictionary,
    setLoading,
    minimumWordLength
  ])

  return useMemo(() => ({ boardDictionary, loading }), [boardDictionary, loading])
}

export type DictionaryContext = DictionaryState

export const Dictionary = createContext<DictionaryContext>({ boardDictionary: [], loading: true })

