import * as R from 'ramda'
import { Board, Coordinates, Letter } from '../game/board/types'

import './StaticBoard.css'

const makeLetter = ({ row, column }: Coordinates, { letter }: Letter) => {
  return <div className={`static-board-letter static-board-letter-${row}-${column}`}>{letter.toLocaleUpperCase()}</div>
}

const makeRow = (row: Board[number], width: number) => {
  return <div className='static-board-row' key={row.index}>{
    R.times(column => makeLetter({ row: row.index, column }, row[column]), width)
  }</div>
}

const StaticBoard = ({ board }: { board: Board }): JSX.Element => {
  return <div className="static-board">{R.times((row) => makeRow(board[row], board.width), board.width)}</div>
}

export default StaticBoard
