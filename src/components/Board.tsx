import React, { useContext } from 'react'
import * as R from 'ramda'

import { GameAction, GameBoard, GameContext } from '../game/context'
import './Board.css'
import { getPointOnGridInfo, GetPointOnGridInfoArguments } from '../util/touch'

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
  const classes = ['spacer']

  if (visited) classes.push('visited')
  const dispatchMoveEvent = () => { dispatch({ type: 'hover', info: { coordinates: { row, column } } }); console.log(`${row}-${column} hover`) }

  return <div
    className={classes.join(' ')}
    key={`spacer-${row}-${column}`}
  >
    <div
      className="letter"
      onMouseOver={dispatchMoveEvent}
    >
      {letter.toUpperCase()}
    </div>
  </div>
}

const Row: React.FC<{ row: number }> = ({ row, children }) => <div className="row" key={row} >{children}</div>

type enumerable = { [key: number]: any }

type ArrayLike<T extends enumerable = any> = (T[number] extends infer X ? { [key: number]: X } : never) & { length: number }
function getLast<T extends ArrayLike>(items: T): T[number] { 
  const { length } = items
  return items[length - 1]
}


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

  const maybeDispatchMove = ({ clientX, clientY }: React.Touch, acceptableDistance: number) => {
    const board = document.getElementsByClassName('board')[0]
    const { top, bottom, left } = board.getBoundingClientRect()
    const divisionAmount = (bottom-top)/boardWidth

    const gridOrigin = { x: left, y: top }
    const point = { x: clientX, y: clientY }
    const squareDimensions = { x: divisionAmount, y: divisionAmount }
    const boundingBox = { min: { x: 0, y: 0 }, max: { x: boardWidth - 1, y: boardWidth - 1 }}
    const options: GetPointOnGridInfoArguments = { gridOrigin, point, squareDimensions, useBoundingBox: true, boundingBox }

    const { residingSquare, pointDistanceFromCenterOfSquare } = getPointOnGridInfo(options)
    const { x: column, y: row } = residingSquare

    if (pointDistanceFromCenterOfSquare <= acceptableDistance) {
      dispatch({ type: 'hover', info: { coordinates: { row, column } } })
    }
  }

  return <div
    className="board"
    onMouseDown={() => { handleClick(true); console.log('start click') }}
    onMouseUp={() => { handleClick(false); console.log('end click') }}
    onTouchStart={(e) => {
      const lastTouch = getLast(e.touches)
      maybeDispatchMove(lastTouch, 1)
      handleClick(true)
    }}
    onTouchMove={(e) => {
      const lastTouch = getLast(e.touches)
      maybeDispatchMove(lastTouch, .5)
    }}
    onTouchEnd={() => handleClick(false)}
  >
    {R.times(makeRows, boardWidth)}
  </div>
}

const Wrapped: React.FC<{ board: GameBoard, context: React.Dispatch<GameAction> }> = ({ board, context }) => (
  <GameContext.Provider value={context}><Board board={board}/></GameContext.Provider>
)

export default Wrapped
