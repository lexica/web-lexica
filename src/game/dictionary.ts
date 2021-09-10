import * as R from 'ramda'

import {
  getLetterCounts,
  orderWordAlphabetically
} from './words'
import {
  getBoard,
  deepCopyBoard,
  getAllPossibleCoordinates,
  getPossibleTravelDirections,
  Board,
  Coordinates,
  getLine
} from './board'
import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { logger } from '../util/logger'
import { LanguageState } from './language'

const removeImpossibleWords = (line: string, dictionary: string[], wordLength: number) => {
  const orderedLine = orderWordAlphabetically(line, true)

  return R.filter((word: string) => {
    if (word.length < wordLength) return false
    const missingLetters: string = R.filter((letter: string) => !orderedLine.includes(letter), word as any) as any
    if (missingLetters.length > 0) return false

    return true
  }, dictionary)
}

const removeWordsThatRequireMoreLetters = (line: string, dictionary: string[]) => {
  const lineLetterCount = getLetterCounts(line)

  return R.filter((word: string) => {
    if (word.length > line.length) return false

    const wordLetterCount = getLetterCounts(word)
    const letters: string[] = Object.keys(wordLetterCount)

    const tooManyOfOneLetter = R.reduce((acc, letter) => {
      if (acc) return acc
      return wordLetterCount[letter] > lineLetterCount[letter]
    }, false, letters)

    if (tooManyOfOneLetter) return false

    return true
  }, dictionary)
}

type RecursiveTraverseBoard = {
  row: number,
  column: number,
  wordSoFar: string,
  board: Board,
  foundWords: string[]
  dictionary: string[]
}

const recursiveTraverseBoard = ({ row, column, wordSoFar, board, foundWords, dictionary }: RecursiveTraverseBoard): string[] => {
  const boardCopy = deepCopyBoard(board)
  boardCopy[row][column].visited = true
  const { letter } = boardCopy[row][column]
  const maybeWord = `${wordSoFar}${letter}`
  // logger.debug(`working with word chain: ${maybeWord}`)
  const index = wordSoFar.length
  // logger.debug(JSON.stringify({ maybeWord, wordSoFar }))

  const narrowedDictionary = R.filter((word) => {
    if (word[index] === maybeWord[index]) {
      if (word.length === maybeWord.length) {
        foundWords.push(word)
        return false
      }
      return true
    }
    return false
  }, dictionary)

  if (narrowedDictionary.length === 0) return foundWords


  const possibleDirections: Coordinates[] = getPossibleTravelDirections({ row, column, width: boardCopy.width })

  const untraveledDirections = R.filter(({ row, column }: Coordinates) => {
    return !boardCopy[row][column].visited
  }, possibleDirections)

  if (untraveledDirections.length === 0) return foundWords 

  return R.reduce((acc: string[], coords: Coordinates) => recursiveTraverseBoard({
      ...coords,
      board: boardCopy,
      dictionary: narrowedDictionary,
      foundWords: acc,
      wordSoFar: maybeWord,
    })
 , foundWords, untraveledDirections)
}

const removeWordsThatCantBeSpelledOnBoard = (line: string, dictionary: string[]) => {
  const getFreshBoard = () => deepCopyBoard(R.once(() => getBoard(line))())

  const board = getFreshBoard()

  const allSquares = getAllPossibleCoordinates({
    rows: R.times(R.identity, board.width),
    columns: R.times(R.identity, board.width)
  })

  type TraverseBoardAcc = {
    foundWords: string[],
    remainingDictionary: string[]
  }

  const { foundWords } = R.reduce<Coordinates, TraverseBoardAcc>((acc, { row, column }) => {
    const foundWords = recursiveTraverseBoard({ row, column, wordSoFar: '', board: getFreshBoard(), foundWords: acc.foundWords, dictionary: acc.remainingDictionary })

    const remainingDictionary = R.filter(word => !foundWords.includes(word), acc.remainingDictionary)

    return { foundWords, remainingDictionary }
  }, { foundWords: [], remainingDictionary: dictionary }, allSquares)

  return R.sort(R.ascend<string>(R.identity), R.uniq(foundWords))
}

const loadDictionary = (line: string, fullDictionary: string[], minimumWordLength: number) => {
  const narrowedDictionary = removeImpossibleWords(line, fullDictionary, minimumWordLength)
  const narrowerDictionary = removeWordsThatRequireMoreLetters(line, narrowedDictionary)

  const dictionary = removeWordsThatCantBeSpelledOnBoard(line, narrowerDictionary)

  return dictionary
}

const resolveDictionary = (line: string, fullDictionary: string[], minimumWordLength: number) => {
  const canUseWebWorkers = false
  if (canUseWebWorkers) {
    // do web worker stuff.... maybe.
  }
  return Promise.resolve(loadDictionary(line, fullDictionary, minimumWordLength))
}

export type DictionaryState = {
  boardDictionary: string[],
  loading: boolean
}

export const useBoardDictionary = (languageState: LanguageState, board: Board | string, minimumWordLength: number) => {
  const [dictionary, setDictionary] = useState<DictionaryState>({
    boardDictionary: [],
    loading: true
  })

  const memoizedBoard = useMemo(() => {
    if (typeof board === 'string') return board
    return getLine(board)
  }, [board])

  const resolveDictionaryCallback = useCallback((dictionary: string[]) => {
    return resolveDictionary(memoizedBoard, dictionary, minimumWordLength)
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
