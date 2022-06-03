import { createContext, Dispatch, Reducer, useEffect, useReducer, useState } from 'react'
import { logger } from '../util/logger'
import { deepCopyBoard, getBoard, getPossibleTravelDirections, getUnvisitedBoard } from './board/util'
import { Board, Coordinates } from './board/types'

export enum GuessAction {
  EnterLetter = 'enter-letter',
  BeginGuess = 'begin-guess',
  EndGuess = 'end-guess',
  __UpdateBoard = 'updateBoard'
}

export type GuessActionType<A extends GuessAction> = {
  type: A
  info: A extends GuessAction.EnterLetter
    ? Coordinates
    : A extends GuessAction.__UpdateBoard
    ? Board
    : never
}

export type GuessState = {
  currentGuess: string,
  guesses: string[],
  isGuessing: boolean,
  currentLetter: Coordinates,
  board: Board
}

const handleBeginGuess = (state: GuessState): GuessState => {
  logger.debug('[Guess] beginning guess...')

  const {
    currentLetter: { row, column },
    board
  } = state

  const newBoard = deepCopyBoard(board)

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
  logger.debug('[Guess] ending guess...')
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

const handleUpdateBoard = (state: GuessState, board: Board): GuessState => ({
  ...state,
  board: deepCopyBoard(board)
})

export const guessReducer = <A extends GuessAction>(state: GuessState, action: GuessActionType<A>) => {
  // logger.debug(`Guess reducer called... action type: ${action.type}`)
  switch (action.type) {
    case GuessAction.__UpdateBoard:
      return handleUpdateBoard(state, action.info as Board)
    case GuessAction.EnterLetter:
      return handleEnterLetter(state, action.info as Coordinates)
    case GuessAction.BeginGuess:
      return handleBeginGuess(state)
    case GuessAction.EndGuess:
      return handleEndGuess(state)
    default:
      throw new Error(`${action.type} action has not been implemented!`)
  }
}

type GuessReducer = Reducer<GuessState, GuessActionType<GuessAction>>

export const useGuesses = (board: string[], preexistingGuesses: string[] = []) => {
  const [stateBoard] = useState(getBoard(board))

  const reducer = useReducer<GuessReducer>(guessReducer, {
    board: stateBoard,
    currentGuess: '',
    guesses: preexistingGuesses,
    currentLetter: { row: 0, column: 0 },
    isGuessing: false
  })

  const dispatch = reducer[1]

  useEffect(() => {
    logger.debug('running useGuesses useEffect....')
    dispatch({ info: getBoard(board), type: GuessAction.__UpdateBoard })

  }, [board, dispatch])

  return reducer
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
