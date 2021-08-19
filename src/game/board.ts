import * as R from 'ramda'

export type Board = {
  [key: number]: {
    [key: number]: {
      letter: string,
      visited: boolean
      index: number
    }
  } & { index: number }
} & { width: number }

const splitLineAlongRows = (line: string) => {
  const width = Math.sqrt(line.length)

  if (Math.floor(width) !== width) {
    // console.log(width, line, "doesn't make a square")
    throw new Error(`${line} doesn't make a square`)
  }

  return R.splitEvery(width, line)
}


export const getBoard = (line: string): Board => {
  const board = splitLineAlongRows(line)

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

export type Coordinates = {
  row: number,
  column: number
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

  // console.log({ rows, columns, unfilteredRows, unfilteredColumns })

  const coordinates = getAllPossibleCoordinates({ rows, columns })

  return R.filter<Coordinates>(({ row: currentRow, column: currentColumn }) => !(row === currentRow && column === currentColumn), coordinates)
}

