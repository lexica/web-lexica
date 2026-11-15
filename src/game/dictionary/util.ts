import * as R from "ramda"
import { deepCopyBoard, visitNeighbors, boardReduce } from "../board/util"
import type { Board, Coordinates } from "../board/types"
import type { BoardType } from "../board"


const visitNeighborsCallback = (remainingWords: string[], lettersSoFar: string, board: Board) =>
  (square: Board[number][number], coords: Coordinates): string[] => {
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

export const getWordsOnBoard = (board: Board, dictionary: string[], minWordLength: number) => {
  const wordsOfValidLength = dictionary.filter(w => w.length >= minWordLength)
  const { foundWords } = boardReduce(board, ({ remainingWords, foundWords }, square, coordinates) => {
    if (!remainingWords.length) return { remainingWords, foundWords }
    const { row, column } = coordinates

    // edge-case of min-length of words being 1...
    if (remainingWords.includes(square.letter)) {
      foundWords.push(square.letter)
      remainingWords.splice(remainingWords.indexOf(square.letter), 1)
    }

    const newBoard = deepCopyBoard(board)
    newBoard[row][column].visited = true

    const callback = visitNeighborsCallback(remainingWords, square.letter, newBoard)

    const newFoundWords = R.flatten(visitNeighbors({ callback, onlyUnvisitedNeighbors: true }, newBoard, coordinates))

    const undiscoveredWords = R.reject((w: unknown) => newFoundWords.includes(w as any), remainingWords)

    return { remainingWords: undiscoveredWords, foundWords: [...foundWords, ...newFoundWords] }

  }, { remainingWords: wordsOfValidLength, foundWords: [] as string[] })

  return R.uniq(foundWords)
}

const combineValuesByKeys = <T extends { [key: string]: any[] }>(...objects: T[]): T => {
  const allKeys = R.uniq(R.flatten(objects.map(Object.keys)))
  return allKeys.reduce((acc, k) => {
    const values = objects.reduce((vals, obj) => {
      if (obj[k] !== undefined) return [...vals, ...obj[k].filter(v => vals.includes(v) === false)] as T[string]
      else return vals
    }, [] as any as T[string])
    return { ...acc, [k]: values }
  }, {} as T)
}

const visitNeighborsForHintsCallback = (validWords: string[], lettersSoFar: string, board: Board, pathSoFar: string[] = []) =>
  (square: Board[number][number], coords: Coordinates): { [words: string]: string[] } => {
    const letterChain = `${lettersSoFar}${square.letter}`
    const letterChainIsWord = validWords.includes(letterChain)

    const toReturn = letterChainIsWord ? { [letterChain] : [...pathSoFar, stringifyCoordinate(coords)]} : {} as { [word: string]: string[] }

    const partialLetterChainMatches = validWords.filter(w => w.indexOf(letterChain) === 0)
    if (partialLetterChainMatches.length) {
      const { row, column } = coords
      const newBoard = deepCopyBoard(board)
      newBoard[row][column].visited = true

      const callback = visitNeighborsForHintsCallback(partialLetterChainMatches, letterChain, newBoard, [...pathSoFar, stringifyCoordinate(coords)])

      const visitResults = visitNeighbors({ callback, onlyUnvisitedNeighbors: true }, newBoard, coords)
      return combineValuesByKeys(toReturn, ...visitResults)
    }

    return toReturn
  }

/** To save time, should only be called with words already found on board */
export const getHintsForBoard = (board: Board, wordsOnBoard: string[]) => {
  const hints = boardReduce(board, (acc, square, coordinates) => {
    const { row, column } = coordinates

    const accSoFar = wordsOnBoard.includes(square.letter)
      ? combineValuesByKeys(acc, { [square.letter]: [stringifyCoordinate(coordinates)] })
      : acc

    const newBoard = deepCopyBoard(board)
    newBoard[row][column].visited = true

    const callback = visitNeighborsForHintsCallback(wordsOnBoard, square.letter, newBoard, [stringifyCoordinate(coordinates)])

    return combineValuesByKeys(accSoFar, ...visitNeighbors({ callback, onlyUnvisitedNeighbors: true }, newBoard, coordinates))

  }, {} as {[word: string]: string[]})

  return hints
}

const stringifyCoordinate = (coord: Coordinates): string => `${coord.row}-${coord.column}`

export const getLetterHints = (hints: { [word: string]: string[] }, board: BoardType): { [coords: string]: number } => {
  return Object.keys(hints).reduce((coordHints, word) => {
    const coords = hints[word]
    return coords.reduce((coordHints2, coordKey) => {
      const existingCount = coordHints2[coordKey] || 0
      return {
        ...coordHints2,
        [coordKey]: existingCount + 1,
      }
    }, coordHints)
  }, boardReduce(board, (acc, _, coords) => ({ ...acc, [stringifyCoordinate(coords)]: 0 }), {}) as { [stringifiedCoordinate: string]: number })
}
