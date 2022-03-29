import React, { useContext, } from 'react'
import * as R from 'ramda'

import './Board.css'
import { ConfirmationEffect } from './hooks'

import { getPointOnGridInfo, GetPointOnGridInfoArguments } from '../../../util/touch'
import { getLetterScore, LetterScores,  } from '../../../game'
import { Rules } from '../../../game/rules'
import { ScoreType } from '../../../game/score'
import { Guess, GuessAction, GuessActionType, GuessDispatch } from '../../../game/guess'
import { makeClasses } from '../../../util/classes'

type LetterProps = {
  row: number,
  column: number,
  letter: string,
  visited: boolean,
}

const Letter: React.FC<LetterProps> = ({
  row,
  column,
  letter,
  visited,
}) => {
  const useConfirmationEffect = useContext(ConfirmationEffect)
  const feedbackClasses = useConfirmationEffect(visited, letter)

  const guessDispatch = useContext(GuessDispatch)

  const { score: scoreType } = useContext(Rules)

  const letterScores = useContext(LetterScores)

  const classes = makeClasses('spacer', { condition: visited, name: 'visited' }, feedbackClasses)

  const dispatchMoveEvent = () => guessDispatch({ type: GuessAction.EnterLetter, info: { row, column } })

  const showScore = scoreType === ScoreType.Letters || undefined

  return <div
    className={classes}
    key={`spacer-${row}-${column}`}
  >
    <div
      className="activator"
      onMouseOver={dispatchMoveEvent}
      onTouchStart={e => e.preventDefault()}
    >
      <div className="letter">{letter.toUpperCase()}</div>
    </div>
    {showScore && <div className="board-letter-score">{getLetterScore(letter, letterScores)}</div>}
  </div>
}

const Row: React.FC<{ row: number }> = ({ row, children }) => <div className="row" key={row} >{children}</div>

type enumerable = { [key: number]: any }

type ArrayLike<T extends enumerable = any> = (T[number] extends infer X ? { [key: number]: X } : never) & { length: number }
function getLast<T extends ArrayLike>(items: T): T[number] { 
  const { length } = items
  return items[length - 1]
}


export const Board: React.FC = () => {
  const dispatch = useContext(GuessDispatch)

  const { board } = useContext(Guess)

  const handleClick = (clicked: boolean) => {
    clicked
      ? dispatch({ type: GuessAction.BeginGuess } as GuessActionType<GuessAction.BeginGuess>)
      : dispatch({ type: GuessAction.EndGuess } as GuessActionType<GuessAction.EndGuess>)
  }

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
      dispatch({ type: GuessAction.EnterLetter, info: { row, column } })
    }
  }

  return <div
    className="board"
    onMouseDown={() => { handleClick(true); /* logger.debug('start click') */ }}
    onMouseUp={() => { handleClick(false); /* logger.debug('end click') */ }}
    onTouchStart={(e) => {
      // Should prevent accidental triggering of ios swipe to go back
      e.preventDefault()

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

export default Board
