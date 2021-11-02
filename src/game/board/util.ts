import * as R from 'ramda'
import { Function as F } from 'ts-toolbelt'

import { Board, Letter, Coordinates } from './types'

const splitLineAlongRows = (line: string[]) => {
  const width = Math.sqrt(line.length)

  if (Math.floor(width) !== width) {
    // logger.debug(width, line, "doesn't make a square")
    throw new Error(`${line} doesn't make a square`)
  }

  return R.splitEvery(width, line)
}


export const getBoard = (line: string[]): Board => {
  const board = splitLineAlongRows(line)

  type Row = Omit<Board[number], 'index'>

  const getColumns = R.pipe<string[], Board[number][number][], Row>(
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
  const getRows = R.addIndex<string[], Board[number]>(R.map)((row: string[], index: number) => ({
    ...getColumns(row),
    index
  }))

  return { ...getRows(board), width: board.length }
}

const boardMap = <T>(board: Board, callback: (letter: Letter, coordinates: Coordinates) => T): T[] => {
  const { width } = board
  let response: T[] = []
  for(let row = 0; row < width; row++) {
    for(let column = 0; column < width; column++) {
      response.push(callback(board[row][column], { row, column }))
    }
  }
  return response
}

type VisitNeighbors<T> = (options: VisitNeighborsOptions<T>, board: Board, coordinates: Coordinates) => T[]

const visitNeighbors_ = <T>({ callback, onlyUnvisitedNeighbors }: VisitNeighborsOptions<T>, board: Board, coordinates: Coordinates): T[] => {
  const neighbors = getPossibleTravelDirections({
    ...coordinates,
    width: board.width
  })

  class VisitedNeighbor {}

  const results = R.map<Coordinates, VisitedNeighbor | T>(
    ({ row, column }) => {
      const envokeCallback = () => callback(board[row][column], { row, column })

      if (onlyUnvisitedNeighbors) return board[row][column].visited ? new VisitedNeighbor() : envokeCallback()

      return envokeCallback()
    }, neighbors)

  return results.filter(val => !(val instanceof VisitedNeighbor)) as T[]
}

export type VisitNeighborsCallback<T> = (neighbor: Letter, coordinates: Coordinates) => T

export type VisitNeighborsOptions<T> = {
  callback: VisitNeighborsCallback<T>,
  onlyUnvisitedNeighbors?: boolean
}

export function visitNeighbors<T>(options: VisitNeighborsOptions<T>): F.Curry<(board: Board, coordinates: Coordinates) => T[]>
export function visitNeighbors<T>(options: VisitNeighborsOptions<T>, board: Board): F.Curry<(coordinates: Coordinates) => T[]>
export function visitNeighbors<T>(options: VisitNeighborsOptions<T>, board: Board, coordinates: Coordinates): T[]
export function visitNeighbors<T>(options: VisitNeighborsOptions<T>, board?: any, coordinates?: any) {
  const curried = R.curryN(3, visitNeighbors_ as VisitNeighbors<T>)(options)

  return board
    ? coordinates
      ? curried(board as Board, coordinates as Coordinates)
      : curried(board as Board)
    : curried
}


export const boardReduce = <Acc>(
  board: Board,
  callback: (acc: Acc, letter: Letter, coordinates: Coordinates) => Acc,
  initialValue: Acc
) => {
  const { width } = board
  let acc = initialValue

  for(let row = 0; row < width; row++) {
    for(let column = 0; column < width; column++) {
      acc = callback(acc, board[row][column], { row, column })
    }
  }
  return acc
}

export const getLine = (board: Board) => {
  return boardMap(board, ({ letter }) => letter)
}

export const deepCopyBoard = (board: Board) => {
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

export const getUnvisitedBoard = (board: Board) => {
  const copy = deepCopyBoard(board)
  const { width } = copy

  for(let row = 0; row < width; row++) {
    for(let column = 0; column < width; column++) {
      copy[row][column].visited = false
    }
  }

  return copy
}

export const getAllPossibleCoordinates = ({ rows, columns }: { rows: number[], columns: number[]}) => R.reduce<number, Coordinates[]>(
  (acc: Coordinates[], row: number) => [
    ...acc,
    ...R.map<number, Coordinates>((column: number) => ({ row, column }), columns)
  ],
  [],
  rows
)

export const getPossibleTravelDirections = ({ row, column, width }: { row: number, column: number, width: number}) => {
  const unfilteredRows = [row - 1, row, row + 1]
  const rows = R.filter((potentialRow: number) => potentialRow >= 0 && potentialRow < width, unfilteredRows)
  const unfilteredColumns = [column - 1, column, column + 1]
  const columns = R.filter((potentialColumn: number) => potentialColumn >= 0 && potentialColumn < width, unfilteredColumns)

  const coordinates = getAllPossibleCoordinates({ rows, columns })

  return R.filter<Coordinates>(({ row: currentRow, column: currentColumn }) => !(row === currentRow && column === currentColumn), coordinates)
}

