import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Dispatch, Reducer, useContext, useEffect, useMemo, useReducer } from 'react';

import { Board } from '../components/Board';
import { Board as BoardObject, Coordinates, deepCopyBoard, getBoard } from '../game/board';
import { Guess, GuessAction, GuessActionType, GuessDispatch, GuessState } from '../game/guess';
import { useLanguage } from '../game/language';
import { Rules } from '../game/rules';
import Providers from './Providers';

const metadata: ComponentMeta<typeof Board> = {
  title: 'Game Board',
  component: Board,
  argTypes: {
    GuessContext: {
      description: 'the Guess context is required by this component.',
      name: 'Guess Context'
    }
  },
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
        return handleHover(state, action.info)
      default:
        throw new Error(`${action.type} not implemented...`)
    }},
    { board: deepCopyBoard(originalBoard), clicked: false, lastLocation: { row: 0, column: 0 } }
  )

  return [state, dispatch]
}

export const Template: ComponentStory<typeof Board> = (args) => {
  const rules = useContext(Rules)
  const [board, dispatch] = useMiniReducer(getBoard(rules.board))

  const letterScores = { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 }

  useEffect(() => {
    // force board update...
    dispatch({ type: GuessAction.BeginGuess } as GuessActionType<GuessAction.BeginGuess>)
    dispatch({ type: GuessAction.EndGuess } as GuessActionType<GuessAction.EndGuess>)
  }, [rules, dispatch])

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
