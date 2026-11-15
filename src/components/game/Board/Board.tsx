import type React from 'react'
import { useCallback, useContext } from 'react'
import * as R from 'ramda'

import './Board.css'
import { ConfirmationEffect } from './hooks'

import { getPointOnGridInfo, } from '../../../util/touch'
import type { GetPointOnGridInfoArguments } from '../../../util/touch'
import { getLetterScore, LetterScores,  } from '../../../game'
import { HintTypeMap, Rules } from '../../../game/rules'
import { ScoreType } from '../../../game/score'
import { Guess, GuessAction, GuessDispatch } from '../../../game/guess'
import type { GuessActionType } from '../../../game/guess'
import { makeClasses } from '../../../util/classes'
import type { WithChildren } from '../../../util/types'
import { LetterHints } from '../../../game/letterHints'
import { Direction, Directions, type DirectionT } from './types'

type LetterProps = {
  row: number,
  column: number,
  x: number,
  y: number,
  letter: string,
  visited: boolean,
}

const Letter: React.FC<LetterProps> = ({
  row,
  column,
  x,
  y,
  letter,
  visited,
}) => {
  const useConfirmationEffect = useContext(ConfirmationEffect)
  const feedbackClasses = useConfirmationEffect(visited, letter)

  const guessDispatch = useContext(GuessDispatch)

  const { score: scoreType, hints = [] } = useContext(Rules)

  const letterScores = useContext(LetterScores)
  const letterHints = useContext(LetterHints)

  const classes = makeClasses('spacer', { condition: visited, name: 'visited' }, feedbackClasses)

  const dispatchMoveEvent = () => guessDispatch({ type: GuessAction.EnterLetter, info: { row: x, column: y } })

  const showScore = scoreType === ScoreType.Letters || undefined
  const showNumberHints = hints.includes(HintTypeMap.Number)

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
    {showNumberHints ? <div className="board-letter-hints">{letterHints[`${row}-${column}`]}</div> : ''}
  </div>
}

const Row = ({ row, children }: WithChildren<{ row: number }>) => <div className="row" key={row} >{children}</div>

type enumerable = { [key: number]: any }

type ArrayLike<T extends enumerable = any> = (T[number] extends infer X ? { [key: number]: X } : never) & { length: number }
function getLast<T extends ArrayLike>(items: T): T[number] { 
  const { length } = items
  return items[length - 1]
}


export type BoardProps = { rotation?: DirectionT }

export const Board = (props: BoardProps): React.JSX.Element => {
  const {
    rotation = Direction.North,
  } = props

  const dispatch = useContext(GuessDispatch)

  const { board } = useContext(Guess)

  const handleClick = (clicked: boolean) => {
    clicked
      ? dispatch({ type: GuessAction.BeginGuess } as GuessActionType<typeof GuessAction["BeginGuess"]>)
      : dispatch({ type: GuessAction.EndGuess } as GuessActionType<typeof GuessAction["EndGuess"]>)
  }

  const boardWidth = board.width

  const getRotatedCoords = useCallback((x: number, y: number, unRotate: boolean = false) => {
    const reflect = Directions[(Directions.indexOf(rotation) + 2) % Directions.length]
    const directionsToReflect: DirectionT[] = [Direction.East, Direction.West]
    const realRotation = unRotate && directionsToReflect.includes(rotation) ? reflect : rotation
    const [mirrorX, mirrorY] = [boardWidth - 1 - x, boardWidth - 1 - y]
    switch (realRotation) {
      case Direction.North:
        return [x, y]
      case Direction.East:
        return [y, mirrorX]
      case Direction.South:
        return [mirrorX, mirrorY]
      case Direction.West:
        return [mirrorY, x]
    }
  }, [rotation, boardWidth])

  const getUnRotatedCoords = useCallback((rotX: number, rotY: number) => getRotatedCoords(rotX, rotY, true), [getRotatedCoords])

  const makeColumn = (row: number) => (column: number) => {
    const [rotRow, rotCol] = getRotatedCoords(row, column)
    return (<Letter {...{
      row,
      column,
      x: rotRow,
      y: rotCol,
      ...board[rotRow][rotCol],
      key: `letter-${row}-${column}`
    }}/>)
  }

  const makeRows = (row: number) => <Row row={row} key={`row-${row}`}>{R.times(makeColumn(row), boardWidth)}</Row>

  const maybeDispatchMove = useCallback(({ clientX, clientY }: React.Touch, acceptableDistance: number) => {
    const board = document.getElementsByClassName('board')[0]
    const { top, bottom, left } = board.getBoundingClientRect()
    const divisionAmount = (bottom-top)/boardWidth

    const gridOrigin = { x: left, y: top }
    const point = { x: clientX, y: clientY }
    const squareDimensions = { x: divisionAmount, y: divisionAmount }
    const boundingBox = { min: { x: 0, y: 0 }, max: { x: boardWidth - 1, y: boardWidth - 1 }}
    const options: GetPointOnGridInfoArguments = { gridOrigin, point, squareDimensions, useBoundingBox: true, boundingBox }

    const { residingSquare, pointDistanceFromCenterOfSquare } = getPointOnGridInfo(options)
    const { x, y } = residingSquare

    if (pointDistanceFromCenterOfSquare <= acceptableDistance) {
      const [row, column] = getUnRotatedCoords(x, y)
      dispatch({ type: GuessAction.EnterLetter, info: { row, column } })
    }
  }, [getUnRotatedCoords])

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
