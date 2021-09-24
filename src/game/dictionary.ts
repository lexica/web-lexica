import * as R from 'ramda'

import {
  getLetterCounts,
  LetterCount,
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

const orderBoardLine = R.pipe(
  R.sortWith<string>([
    R.descend(R.prop('length')),
    R.ascend(R.identity)
  ]),
  R.uniq
)

const hasMissingLetters = (boardLine: string[], word: string) => {
  let w = word
  while (w.length) {
    let foundLetter = false
    for (const letter in boardLine) {
      if (w.indexOf(letter) === 0) {
        foundLetter = true
        w = w.substring(letter.length)
        break
      }
    }
    if (!foundLetter) return true
  }

  return false
}

const removeImpossibleWords = (line: string[], dictionary: string[], wordLength: number) => {
  const orderedLine = orderBoardLine(line)

  return R.filter((word: string) => {
    if (word.length < wordLength) return false
    if (hasMissingLetters(orderedLine, word)) return false

    return true
  }, dictionary)
}

const getBoardLineLetterCounts = (line: string[]) => {
  const ordered = orderBoardLine(line)
  let currentChar = '\0'


  return R.reduce((acc: LetterCount, letter: string) => {
    if (letter !== currentChar) {
      currentChar = letter
      return { ...acc, [letter]: 1 }
  }

    return { ...acc, [letter]: acc[letter] + 1 }
  }, {}, ordered)
}

const removeWordsThatRequireMoreLetters = (line: string[], dictionary: string[]) => {
  const lineLetterCount = getBoardLineLetterCounts(line)

  const boardLetters = orderBoardLine(line)

  return R.filter((word: string) => {
    if (word.length > line.length) return false

    const wordLetterCount = getLetterCounts(word, boardLetters)
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

const removeWordsThatCantBeSpelledOnBoard = (line: string[], dictionary: string[]) => {
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

const loadDictionary = (line: string[], fullDictionary: string[], minimumWordLength: number) => {
  const narrowedDictionary = removeImpossibleWords(line, fullDictionary, minimumWordLength)
  const narrowerDictionary = removeWordsThatRequireMoreLetters(line, narrowedDictionary)

  const dictionary = removeWordsThatCantBeSpelledOnBoard(line, narrowerDictionary)

  return dictionary
}

const resolveDictionary = (line: string[], fullDictionary: string[], minimumWordLength: number) => {
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
