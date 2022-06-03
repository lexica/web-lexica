import * as R from 'ramda'
import { Board, Coordinates, Letter, Row } from '../game/board/types'

import './StaticBoard.css'

const StaticLetter = ({ row, column, letter }: Coordinates & { letter: string }) => <div
  className={`static-board-letter static-board-letter-${row}-${column}`}
>
  {letter.toLocaleUpperCase()}
</div>

const makeLetter = ({ row, column }: Coordinates, { letter }: Letter) => <StaticLetter
  {...{ row, column, letter}}
  key={`static-letter-${row}-${column}`}
/>

const StaticRow = ({ index, width, ...columns  }: Row & { width: number }): JSX.Element => {
  return <div className='static-board-row'>{
    R.times(column => makeLetter({ row: index, column }, columns[column]), width)
  }</div>
}

const makeRow = (row: Row, width: number) => <StaticRow {...row} width={width} key={`static-row-${row.index}`}/>

const StaticBoard = ({ board }: { board: Board }): JSX.Element => {
  return <div className="static-board">{R.times((row) => makeRow(board[row], board.width), board.width)}</div>
}

export default StaticBoard
