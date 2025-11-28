import * as R from "ramda"
import { deepCopyBoard, visitNeighbors, boardReduce } from "../board/util"
import type { Board, Coordinates } from "../board/types"


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
