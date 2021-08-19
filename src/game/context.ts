import React, { createContext } from 'react'
import * as R from 'ramda'

import { Coordinates, getBoard, getPossibleTravelDirections, deepCopyBoard } from './board'
import englishDictionary from './dict.json'
import { loadDictionary, possibleWordsGivenBoard } from './dictionary'

export type GameBoard = {
  [key: number]: {
    [key: number]: {
      letter: string,
      visited: boolean,
      index: number
    }
  } & { index: number }
} & { width: number }

export type GameContextType = {
  board: GameBoard,
  notifyOfLetterHover: (row: number, column: number) => void,
  notifyOfMouseClick: (isClicked: boolean) => void,
  possibleWords: string[],
  foundWords: string[]
}

export type GameState = {
  board: GameBoard,
  foundWords: string[],
  possibleWordsGivenLetterChain: string[],
  remainingWords: string[],
  currentLetter: Coordinates,
  currentLetterChain: string,
  mouseIsClicked: boolean,
  guessedWords: string[]
  shouldUpdate: boolean
  forceUpdate: React.DispatchWithoutAction
}

export type GameReducerInitializerArgument = {
  board: string,
  wordLength: number,
  forceUpdate: React.DispatchWithoutAction
}

export const getInitialState = ({ board, wordLength, forceUpdate }: GameReducerInitializerArgument): GameState => {
  const remainingWords = loadDictionary(board, englishDictionary, wordLength)
  return {
    board: getBoard(board),
    currentLetter: { row: 0, column: 0 },
    currentLetterChain: '',
    foundWords: [],
    mouseIsClicked: false,
    possibleWordsGivenLetterChain: remainingWords,
    remainingWords,
    guessedWords: [],
    shouldUpdate: false,
    forceUpdate
  }
}

const actionTypes = ['hover', 'click'] as const

const hover = actionTypes[0]
const click = actionTypes[1]

type ActionTypes = typeof actionTypes[number]

type HoverInfo = {
  coordinates: Coordinates
}

type ClickInfo = {
  clicked: boolean
}

export type GameAction = {
  type: ActionTypes
  info: HoverInfo | ClickInfo
}

const changeCurrentLetter = (state: GameState, newLetter: Coordinates) => {
  state.currentLetter.row = newLetter.row
  state.currentLetter.column = newLetter.column
  return state
}


const handleLetterChainUpdate = (state: GameState): GameState => {
  const {
    possibleWordsGivenLetterChain,
    currentLetter,
    foundWords,
    board,
    currentLetterChain
  } = state
  const { row, column } = currentLetter

  // console.log(JSON.stringify({ currentLetter, currentLetterChain }))

  const newPossibleWords = possibleWordsGivenBoard({
    ...currentLetter,
    dictionary: R.filter(word => !foundWords.includes(word), possibleWordsGivenLetterChain),
    board,
    wordSoFar: `${currentLetterChain}${board[row][column].letter}`
  })

  const wordsRemoved = R.filter<string>(word => !newPossibleWords.includes(word), state.possibleWordsGivenLetterChain)

  // console.log(JSON.stringify({ wordsRemoved }))

  // console.log(`${state.possibleWordsGivenLetterChain.length - newPossibleWords.length} impossible words removed`)

  board[row][column].visited = true

  state.possibleWordsGivenLetterChain = newPossibleWords
  state.currentLetterChain += board[row][column].letter

  return state
}

const handleStartClick = (state: GameState): GameState => {
  return handleLetterChainUpdate(state)
}

const handleFinishClick = (state: GameState): GameState => {
  // console.log('finishing a click')
  const {
    currentLetterChain,
    remainingWords,
    foundWords,
    board
  } = state

  const foundAWord = remainingWords.includes(currentLetterChain)

  const newFoundWords = foundAWord ? [...foundWords, currentLetterChain] : foundWords
  const newRemainingWords = foundAWord ? R.filter(word => word !== currentLetterChain, remainingWords) : remainingWords

  const newPossibleWords = newRemainingWords
  const newLetterChain = ''
  const newBoard = deepCopyBoard(board)

    for(let x = 0; x < board.width; x++) {
      for(let y = 0; y < board.width; y++) {
        newBoard[x][y].visited = false
      }
    }
  state.foundWords = newFoundWords
  state.remainingWords = newRemainingWords
  state.possibleWordsGivenLetterChain = newPossibleWords
  state.currentLetterChain = newLetterChain
  state.board = newBoard
  currentLetterChain.length && state.guessedWords.push(`${currentLetterChain}`)
  return state
}

const handleClick = (state: GameState, { clicked }: ClickInfo) => {
  if (clicked === state.mouseIsClicked) return state

  state.mouseIsClicked = clicked

  state.shouldUpdate = true

  // console.log(`is clicked: ${state.mouseIsClicked}`)

  return clicked ? handleStartClick(state) : handleFinishClick(state)
}

const isValidMove = ({ board, currentLetter }: GameState, newCoords: Coordinates) => {
    const possibleTravelDirections = getPossibleTravelDirections({ ...currentLetter, width: board.width })

    if (!possibleTravelDirections.filter(cw => newCoords.column === cw.column && newCoords.row === cw.row).length) {
      // console.log('non-accessible coords', JSON.stringify({ currentCoordinates: currentLetter, targetCoordinates: newCoords, possibleTravelDirections }))
      return false
    }

    const { row, column } = newCoords
    if (board[row][column].visited) {
      // console.log('letter is visited', JSON.stringify({ targetCoordinates: newCoords }))
      return false
    }

    return true
}

const areSameCoordinates = (a: Coordinates, b: Coordinates) => {
  return a.row === b.row && a.column === b.column
}

const handleClickedHover = (state: GameState, coordinates: Coordinates): GameState => {
  const { currentLetter } = state
  const shouldUpdate = !areSameCoordinates(currentLetter, coordinates) && isValidMove(state, coordinates)
  // console.log(`same coordinates on hover, not updating: ${JSON.stringify({ currentLetter, coordinates })}`)
  if (shouldUpdate) {
    state.shouldUpdate = true
    changeCurrentLetter(state, coordinates)
    // console.log(`These should match: ${JSON.stringify({ currentLetter: state.currentLetter,  coordinates })}`)
    return handleLetterChainUpdate(state)
  }
  return state
}

const handleHover = (state: GameState, { coordinates }: HoverInfo): GameState => {
  if (state.mouseIsClicked) return handleClickedHover(state, coordinates)
  state.currentLetter = coordinates
  return state
}

export const gameReducer = (state: GameState, action: GameAction) => {
  state.shouldUpdate = false
  let toReturn = state
  if (action.type === click) toReturn = handleClick(state, action.info as ClickInfo)
  if (action.type === hover) toReturn = handleHover(state, action.info as HoverInfo)

  if (state.shouldUpdate) {
    // console.log('forcing update...')
    toReturn.forceUpdate()
  }

  return toReturn
}

export const GameContext = createContext<React.Dispatch<GameAction>>(null as any)
