import * as R from 'ramda'

import {
  getBoard,
  deepCopyBoard,
  boardReduce,
  visitNeighbors
} from './board/util'
import { Board, Coordinates } from './board/types'
import { createContext, useEffect, useMemo, useState } from 'react'
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
  return getWordsOnBoard(getBoard(line), fullDictionary, minimumWordLength)
}


export type DictionaryState = {
  boardDictionary: string[],
  loading: boolean
}

export const useBoardDictionary = (languageState: LanguageState, board: string[], minimumWordLength: number) => {
  const [loading, setLoading] = useState(true)
  const [boardDictionary, setDictionary] = useState<string[]>([])

  useEffect(() => {
    logger.debug('running dictionary useEffect')
    setLoading(true)
    const dictionary = resolveDictionary(board, languageState.dictionary, minimumWordLength)
    setLoading(false)

    setDictionary(dictionary)
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

export const __test = {
  getWordsOnBoard
}
