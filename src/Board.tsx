import React, { useContext } from 'react'
import * as R from 'ramda'

import { GameAction, GameBoard, GameContext } from './game/context'
import './Board.css'

type LetterProps = {
  row: number,
  column: number,
  letter: string,
  visited: boolean
}

const Letter: React.FC<LetterProps> = ({
  row,
  column,
  letter,
  visited,
}) => {
  const dispatch = useContext(GameContext)
  const classes = ['letter']

  if (visited) classes.push('visited')

  return <div className="spacer" key={`spacer-${row}-${column}`}>
    <div
      className={classes.join(' ')}
      onMouseOver={() => { dispatch({ type: 'hover', info: { coordinates: { row, column } } }); console.log(`${row}-${column} hover`) }}
    >
      {letter}
    </div>
  </div>
}

const Row: React.FC<{ row: number }> = ({ row, children }) => <div className="row" >{children}</div>


export const Board: React.FC<{ board: GameBoard }> = ({ board }) => {
  const dispatch = useContext(GameContext)

  const handleClick = (clicked: boolean) => dispatch({ type: 'click', info: { clicked } })

  const boardWidth = board.width

  const makeColumn = (row: number) => (column: number) => <Letter {...{
    row,
    column,
    ...board[row][column],
    key: `letter-${row}-${column}`
  }}/>

  const makeRows = (row: number) => <Row row={row} key={`row-${row}`}>{R.times(makeColumn(row), boardWidth)}</Row>

  return <div
    className="board"
    onMouseDown={() => { handleClick(true); console.log('start click') }}
    onMouseUp={() => { handleClick(false); console.log('end click') }}
  >
    {R.times(makeRows, boardWidth)}
  </div>
}

const Wrapped: React.FC<{ board: GameBoard, context: React.Dispatch<GameAction> }> = ({ board, context }) => (
  <GameContext.Provider value={context}><Board board={board}/></GameContext.Provider>
)

export default Wrapped
