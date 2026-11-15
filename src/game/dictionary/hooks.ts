import { createContext, useEffect, useMemo, useState } from 'react'

import { getHintsForBoard, getWordsOnBoard } from './util'
import { type ToWorkerMessage, WorkerRequest } from './types'

import { getBoard } from '../board/util'
import type { LanguageState } from '../language'

import { logger } from '../../util/logger'
import { promisifyWorker } from '../../util/web-worker'

import Worker from './dictionary.worker.ts?worker'

const worker = window.Worker ? new Worker() : undefined

const resolveDictionary = (line: string[], fullDictionary: string[], minimumWordLength: number) => {
  if (window.Worker) {
    const info = {
      board: getBoard(line),
      dictionary: fullDictionary,
      minWordLength: minimumWordLength
    }
    return promisifyWorker<ToWorkerMessage, string[]>(worker!, { requestType: WorkerRequest.ResolveBoardDictionary, info })
  }
  return Promise.resolve(getWordsOnBoard(getBoard(line), fullDictionary, minimumWordLength))
}

const resolveHints = (line: string[], wordsOnBoard: string[]) => {
  if (window.Worker) {
    const info = {
      board: getBoard(line),
      wordsOnBoard,
    }
    return promisifyWorker<ToWorkerMessage, HintContext['hints']>(worker!, { requestType: WorkerRequest.ResolveBoardHints, info })
  }
  return Promise.resolve(getHintsForBoard(getBoard(line), wordsOnBoard))
}


export type DictionaryState = {
  boardDictionary: string[],
  loading: boolean
}

export type HintState = {
  hints: { [word: string]: string[] }
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

export const useBoardHints = (wordsOnBoard: string[], board: string[]) => {
  const [loading, setLoading] = useState(true)
  const [hints, setHints] = useState<HintState['hints']>({})

  useEffect(() => {
    logger.debug('running dictionary useEffect')
    setLoading(true)
    resolveHints(board, wordsOnBoard).then(resolvedHints => {
      setHints(resolvedHints)
      setLoading(false)
    })

  }, [
    board,
    wordsOnBoard
  ])

  return useMemo(() => ({ hints, loading }), [hints, loading])
}


export type DictionaryContext = DictionaryState
export type HintContext = HintState

export const Dictionary = createContext<DictionaryContext>({ boardDictionary: [], loading: true })
export const Hints = createContext<HintContext>({ hints: {}, loading: true })

