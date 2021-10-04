import * as R from 'ramda'

import {
  getBoard,
  deepCopyBoard,
  Board,
  Coordinates,
  getLine,
  boardReduce,
  visitNeighbors
} from './board'
import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { logger } from '../util/logger'
import { LanguageState } from './language'

const visitNeighborsCallback = (remainingWords: string[], lettersSoFar: string, board: Board) => (square: Board[number][number], coords: Coordinates): string[] => {
  const letterChain = `${lettersSoFar}${square.letter}`
  const letterChainIsWord = remainingWords.includes(letterChain)
  const wordsToFilter = letterChainIsWord ? remainingWords.filter(w => w !== letterChain) : remainingWords

  const toReturn = letterChainIsWord ? [letterChain] : [] as string[]

  const partialLetterChainMatches = wordsToFilter.filter(w => w.indexOf(letterChain) === 0)
  if (partialLetterChainMatches.length) {
    const { row, column } = coords
    const newBoard = deepCopyBoard(board)
    newBoard[row][column].visited = true

    const callback = visitNeighborsCallback(partialLetterChainMatches, letterChain, newBoard)

    const visitResults = R.flatten(visitNeighbors({ callback, onlyUnvisitedNeighbors: true}, newBoard, coords))
    return [...toReturn, ...visitResults]
  }

  return toReturn
}

const getWordsOnBoard = (board: Board, dictionary: string[], minWordLength: number) => {
  const wordsOfValidLength = dictionary.filter(w => w.length >= minWordLength)
  const { foundWords } = boardReduce(board, ({ remainingWords, foundWords }, square, coordinates) => {
    if (!remainingWords.length) return { remainingWords, foundWords }
    const { row, column } = coordinates

    // edgecase of min-lenght of words being 1...
    if (remainingWords.includes(square.letter)) {
      foundWords.push(square.letter)
      remainingWords.splice(remainingWords.indexOf(square.letter), 1)
    }

    const newBoard = deepCopyBoard(board)
    newBoard[row][column].visited = true

    const callback = visitNeighborsCallback(remainingWords, square.letter, newBoard)

    const newFoundWords = R.flatten(visitNeighbors({ callback, onlyUnvisitedNeighbors: true }, newBoard, coordinates))

    const unfoundWords = R.reject(w => newFoundWords.includes(w), remainingWords)

    return { remainingWords: unfoundWords, foundWords: [...foundWords, ...newFoundWords] }

  }, { remainingWords: wordsOfValidLength, foundWords: [] as string[] })

  return R.uniq(foundWords)
}

const resolveDictionary = (line: string[], fullDictionary: string[], minimumWordLength: number) => {
  const canUseWebWorkers = false
  if (canUseWebWorkers) {
    // do web worker stuff.... maybe.
  }
  return Promise.resolve(getWordsOnBoard(getBoard(line), fullDictionary, minimumWordLength))
}


export type DictionaryState = {
  boardDictionary: string[],
  loading: boolean
}

export const useBoardDictionary = (languageState: LanguageState, board: Board | string[], minimumWordLength: number) => {
  const [dictionary, setDictionary] = useState<DictionaryState>({
    boardDictionary: [],
    loading: true
  })

  const memoizedBoard = useMemo(() => {
    if (Array.isArray(board)) return board
    return getLine(board)
  }, [board])

  const resolveDictionaryCallback = useCallback((dictionary: string[]) => {
    return resolveDictionary(memoizedBoard, dictionary, minimumWordLength).then(R.tap(d => logger.debug(JSON.stringify(d))))
  }, [memoizedBoard, minimumWordLength])

  useEffect(() => {
    logger.debug('running dictionary useEffect')
    resolveDictionaryCallback(languageState.dictionary).then(boardDictionary => setDictionary({
      loading: boardDictionary.length === 0,
      boardDictionary
    }))
  }, [
    languageState,
    setDictionary,
    resolveDictionaryCallback
  ])

  return dictionary
}

export type DictionaryContext = DictionaryState

export const Dictionary = createContext<DictionaryContext>({ boardDictionary: [], loading: true })

export const __test = {
  getWordsOnBoard
}
