import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Dispatch, Reducer, useContext, useEffect, useMemo, useReducer } from 'react';

import { Board } from '../components/game/Board';
import { Board as BoardObject, Coordinates,  } from '../game/board/types';
import { deepCopyBoard, getBoard } from '../game/board/util'
import { GuessAction, GuessActionType, GuessState } from '../game/guess';
import { Board as BoardCtx } from '../game/board/hooks'
import Providers from './Providers';

const metadata: ComponentMeta<typeof Board> = {
  title: 'Game Board',
  component: Board,
  argTypes: {
    Contexts: {
      description: 'This component uses the following contexts: Rule, Guess, GuessDispatch, LetterScore',
      name: 'Contexts'
    }
  }
}

export default metadata

type MiniState = {
  board: BoardObject,
  clicked: boolean,
  lastLocation: Coordinates
}

const handleClick = (originalBoard: BoardObject, state: MiniState, actionClick: boolean): MiniState => {
  const { clicked, board, lastLocation } = state
  const beginClick = !clicked && actionClick
  const endClick = clicked && !actionClick

  if (beginClick) {
    const { row, column } = lastLocation

    board[row][column].visited = true

    return { board, clicked: true, lastLocation }
  }

  if (endClick) return { board: deepCopyBoard(originalBoard), clicked: false, lastLocation }

  return state
}

const handleHover = (state: MiniState, info: Coordinates): MiniState => {
  const { board, clicked } = state

  if (clicked) {
    const { row, column } = info

    board[row][column].visited = true

    return { ...state, board, clicked, lastLocation: info }
  }

  return { ...state, lastLocation: info }
}
const useMiniReducer = (originalBoard: BoardObject): [BoardObject, Dispatch<GuessActionType<GuessAction>>] => {
  const [{ board: state }, dispatch] = useReducer<Reducer<MiniState, GuessActionType<GuessAction>>>(
    (state, action) => {switch (action.type) {
      case GuessAction.BeginGuess:
        return handleClick(originalBoard, state, true)
      case GuessAction.EndGuess:
        return handleClick(originalBoard, state, false)
      case GuessAction.EnterLetter:
        return handleHover(state, action.info as Coordinates)
      default:
        throw new Error(`${action.type} not implemented...`)
    }},
    { board: deepCopyBoard(originalBoard), clicked: false, lastLocation: { row: 0, column: 0 } }
  )

  return [state, dispatch]
}

export const Template: ComponentStory<typeof Board> = () => {
  const boardCtx = useContext(BoardCtx)
  const [board, dispatch] = useMiniReducer(getBoard(boardCtx))

  const letterScores = { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 }

  useEffect(() => {
    // force board update...
    dispatch({ type: GuessAction.BeginGuess } as GuessActionType<GuessAction.BeginGuess>)
    dispatch({ type: GuessAction.EndGuess } as GuessActionType<GuessAction.EndGuess>)
  }, [dispatch])

  const guessState = useMemo<GuessState>(() => ({
    board,
    currentGuess: '',
    currentLetter: { row: 0, column: 0 },
    guesses: [],
    isGuessing: false
  }), [board])

  return <Providers {...{
    guessDispatch: dispatch,
    guess: guessState,
    letterScores
  }}>
      <Board />
  </Providers>
};
