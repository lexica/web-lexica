import { createContext, Dispatch, Reducer, useMemo, useReducer } from 'react'
import { logger } from '../util/logger'
import { Board, Coordinates, deepCopyBoard, getBoard, getPossibleTravelDirections, getUnvisitedBoard } from './board'

export enum GuessAction {
  EnterLetter = 'enter-letter',
  BeginGuess = 'begin-guess',
  EndGuess = 'end-guess'
}

export type GuessActionType<A extends GuessAction> = {
  type: A
  info: A extends GuessAction.EnterLetter ? Coordinates : never
}

export type GuessState = {
  currentGuess: string,
  guesses: string[],
  isGuessing: boolean,
  currentLetter: Coordinates,
  board: Board
}

const handleBeginGuess = (state: GuessState): GuessState => {
  const {
    currentLetter: { row, column },
    board
  } = state

  const newBoard = deepCopyBoard(board)

  logger.debug('handling begin guess...')

  newBoard[row][column].visited = true

  const newState = {
    ...state,
    isGuessing: true,
    currentGuess: board[row][column].letter,
    board: newBoard
  }

  logger.debug(`updating state... newState === state: ${Object.is(state, newState)}`)
  return newState
}

const handleEndGuess = (state: GuessState): GuessState => {
  const {
    board,
    currentGuess,
    guesses
  } = state

  const newBoard = getUnvisitedBoard(board)

  return {
    ...state,
    currentGuess: '',
    board: newBoard,
    guesses: [...guesses, currentGuess],
    isGuessing: false
  }
}

const isValidMove = ({ board, currentLetter }: GuessState, newCoords: Coordinates) => {
    const possibleTravelDirections = getPossibleTravelDirections({ ...currentLetter, width: board.width })

    if (!possibleTravelDirections.filter(cw => newCoords.column === cw.column && newCoords.row === cw.row).length) {
      return false
    }

    const { row, column } = newCoords
    if (board[row][column].visited) {
      return false
    }

    return true
}

const areSameCoordinates = (a: Coordinates, b: Coordinates) => {
  return a.row === b.row && a.column === b.column
}

const handleEnterLetterWhileGuessing = (state: GuessState, coordinates: Coordinates): GuessState => {
  const { currentLetter } = state

  const noUpdatesNeeded = areSameCoordinates(currentLetter, coordinates) || !isValidMove(state, coordinates)

  if (noUpdatesNeeded) return state

  const { currentGuess, board } = state

  const { row, column } = coordinates

  const boardCopy = deepCopyBoard(board)

  const toAppend = boardCopy[row][column].letter

  boardCopy[row][column].visited = true

  return {
    ...state,
    currentGuess: `${currentGuess}${toAppend}`,
    board: boardCopy,
    currentLetter: { ...coordinates },
  }
}

const handleEnterLetter = (state: GuessState, coordinates: Coordinates): GuessState => {
  if (state.isGuessing) return handleEnterLetterWhileGuessing(state, coordinates)

  // save on screen rendering by returning same state object, even though mutation is usually not good
  state.currentLetter = coordinates

  return state
}

export const guessReducer = <A extends GuessAction>(state: GuessState, action: GuessActionType<A>) => {
  logger.debug(`Guess reducer called... action type: ${action.type}`)
  switch (action.type) {
    case GuessAction.EnterLetter:
      return handleEnterLetter(state, action.info)
    case GuessAction.BeginGuess:
      return handleBeginGuess(state)
    case GuessAction.EndGuess:
      return handleEndGuess(state)
    default:
      throw new Error(`${action.type} action has not been implemented!`)
  }
}

type GuessReducer = Reducer<GuessState, GuessActionType<GuessAction>>

export const useGuesses = (board: Board | string) => {
  const memoizedBoard = useMemo(() => {
    if (typeof board === 'string') return getBoard(board)
    return getUnvisitedBoard(board)
  }, [board])

  return useReducer<GuessReducer>(guessReducer, {
    board: memoizedBoard,
    currentGuess: '',
    guesses: [],
    currentLetter: { row: 0, column: 0 },
    isGuessing: false
  })
}

export type GuessContext = GuessState

export const Guess = createContext<GuessContext>({
  board: { width: 0 },
  currentGuess: '',
  currentLetter: { row: 0, column: 0 },
  guesses: [],
  isGuessing: false
})

export type GuessDispatchContext = Dispatch<GuessActionType<GuessAction>>

export const GuessDispatch = createContext<GuessDispatchContext>(() => {})
