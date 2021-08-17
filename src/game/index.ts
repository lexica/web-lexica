import * as R from 'ramda'

import scores from './scores.json'

export const makeBoardFromString = (line: string) => {
  const width = Math.sqrt(line.length)

  if (Math.floor(width) !== width) {
    console.log(width, line, "doesn't make a square")
    throw new Error(`${line} doesn't make a square`)
  }

  return R.splitEvery(width, line)
}

const getOrderedLine = (line: string, dedupe: boolean = false) => {
  const orderedLine = R.pipe<string, string[], string[], string>(
    R.splitEvery(1) as any as (a: string) => string[],
    R.sort((a: string, b: string) => a.charCodeAt(0) - b.charCodeAt(0)),
    R.join('')
  )(line)

  const removeDuplicates = R.pipe<string, string[], string[], string>(
    R.splitEvery(1) as any as (a: string) => string[],
    R.uniq as (a: string[]) => string[],
    R.join('')
  )

  return dedupe ? removeDuplicates(orderedLine) : orderedLine
}

export const removeImpossibleWords = (line: string, dictionary: string[], wordLength: number) => {
  const orderedLine = getOrderedLine(line, true)

  return R.filter((word: string) => {
    if (word.length < wordLength) return false
    const missingLetters: string = R.filter((letter: string) => !orderedLine.includes(letter), word as any) as any
    if (missingLetters.length > 0) return false

    return true
  }, dictionary)
}

type LetterCount = {
  [key: string]: number
}

const getLetterCounts = (word: string) => {
  const ordered = getOrderedLine(word)
  let currentChar = '\0'


  return R.reduce((acc: LetterCount, letter: string) => {
    if (letter !== currentChar) {
      currentChar = letter
      return { ...acc, [letter]: 1 }
  }

    return { ...acc, [letter]: acc[letter] + 1 }
  }, {}, R.splitEvery(1, ordered))
}

export const removeWordsThatRequireMoreLetters = (line: string, dictionary: string[]) => {
  const lineLetterCount = getLetterCounts(line)

  console.log(lineLetterCount)

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

type Board = {
  [key: number]: {
    [key: number]: {
      letter: string,
      visited: boolean
      index: number
    }
  } & { index: number }
} & { width: number }


const getBoard = (board: string[]): Board => {
  type Row = Omit<Board[number], 'index'>

  const getColumns = R.pipe<string, string[], Board[number][number][], Row>(
    R.splitEvery(1) as (a: string) => string[],
    R.addIndex<string, Board[number][number]>(R.map)((letter: string, index: number) => ({
      letter,
      visited: false,
      index
    })),
    R.reduce<Board[number][number], Row>((acc: Row, column: Board[number][number]) => ({
      ...acc,
      [column.index]: column
    }), {})
  )
  const getRows = R.addIndex<string, Board[number]>(R.map)((row: string, index: number) => ({
    ...getColumns(row),
    index
  }))

  return { ...getRows(board), width: board.length }
}

export const removeWordsThatCantBeSpelledOnBoard = (board: string[], dictionary: string[]) => {
  const getFreshBoard = () => deepCopyBoard(R.once(() => getBoard(board))())

  const allSquares = getAllPossibleCoords({
    rows: R.times(R.identity, board.length),
    columns: R.times(R.identity, board.length)
  })

  type TraverseBoardAcc = {
    foundWords: string[],
    remainingDictionary: string[]
  }

  const { foundWords } = R.reduce<Coords, TraverseBoardAcc>((acc, { row, column }) => {
    const foundWords = recursiveTraverseBoard({ row, column, wordSoFar: '', board: getFreshBoard(), foundWords: acc.foundWords, dictionary: acc.remainingDictionary })

    const remainingDictionary = R.filter(word => !foundWords.includes(word), acc.remainingDictionary)

    return { foundWords, remainingDictionary }
  }, { foundWords: [], remainingDictionary: dictionary }, allSquares)

  return R.sort(R.ascend<string>(R.identity), R.uniq(foundWords))
}

type RecursiveTraverseBoard = {
  row: number,
  column: number,
  wordSoFar: string,
  board: Board,
  foundWords: string[]
  dictionary: string[]
}

const deepCopyBoard = (board: Board) => {
  const { width } = board
  const copy = { width } as Board
  for(let row = 0; row < width; row++) {
    copy[row] = { index: row }
    for(let column = 0; column < width; column++) {
      copy[row][column] = { ...board[row][column] }
    }
  }
  return copy
}

type Coords = {
  row: number,
  column: number
}

const getAllPossibleCoords = ({ rows, columns }: { rows: number[], columns: number[]}) => R.reduce<number, Coords[]>(
  (acc: Coords[], row: number) => [
    ...acc,
    ...R.map<number, Coords>((column: number) => ({ row, column }), columns)
  ],
  [],
  rows
)

const getPossibleDirections = ({ row, column, width }: { row: number, column: number, width: number}) => {
  const rows = R.filter((potentialRow: number) => potentialRow >= 0 && potentialRow < width, [row - 1, row, row + 1])
  const columns = R.filter((potentialColumn: number) => potentialColumn >= 0 && potentialColumn < width, [column - 1, column, column + 1])

  return getAllPossibleCoords({ rows, columns })
}

const recursiveTraverseBoard = ({ row, column, wordSoFar, board, foundWords, dictionary }: RecursiveTraverseBoard): string[] => {
  const boardCopy = deepCopyBoard(board)
  boardCopy[row][column].visited = true
  const { letter } = boardCopy[row][column]
  const maybeWord = `${wordSoFar}${letter}`
  const index = wordSoFar.length

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


  const possibleDirections: Coords[] = getPossibleDirections({ row, column, width: boardCopy.width })

  const untraveledDirections = R.filter(({ row, column }: Coords) => {
    return !boardCopy[row][column].visited
  }, possibleDirections)

  if (untraveledDirections.length === 0) return foundWords 

  return R.reduce((acc: string[], coords: Coords) => recursiveTraverseBoard({
      ...coords,
      board: boardCopy,
      dictionary: narrowedDictionary,
      foundWords: acc,
      wordSoFar: maybeWord,
    })
 , foundWords, untraveledDirections)
}

export const loadDictionary = (line: string, fullDictionary: string[], wordLength: number) => {
  const narrowedDictionary = removeImpossibleWords(line, fullDictionary, wordLength)
  const narrowerDictionary = removeWordsThatRequireMoreLetters(line, narrowedDictionary)
  const board = makeBoardFromString(line)

  const dictionary = removeWordsThatCantBeSpelledOnBoard(board, narrowerDictionary)

  return dictionary
}

export enum PointModes {
  Letters = 'letters',
  Length = 'length'
}

const alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'qu', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'] as const
type Alphabet = typeof alphabet[number]

export const scoreWord = (word: string, _pointMode: PointModes = PointModes.Letters) => R.pipe<string, Alphabet[], number>(
  R.splitEvery(1) as (a: string) => Alphabet[],
  R.reduce<Alphabet, number>((acc, letter) => acc + scores[(letter as string) === 'q' ? 'qu' : letter], 0)
)(word)

export const orderByWordScore = (dictionary: string[]) => R.sortWith([R.descend<string>(scoreWord), R.ascend<string>(R.identity)], dictionary)
