import React, { createContext } from 'react'
import * as R from 'ramda'

import { Board, Coordinates, getBoard, getPossibleTravelDirections, deepCopyBoard } from './board'
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

// class Game {
//   public possibleWords: string[]
//   public foundWords: string[]
//   public board: Board

//   private fullDictionary: string[]
//   private boardDictionary: string[]
//   private mouseIsClicked: boolean
//   private wordSoFar: string
//   private currentCoordinate: Coordinates

//   constructor() {
//     this.fullDictionary = englishDictionary
//     this.boardDictionary = []
//     this.possibleWords = []
//     this.foundWords = []
//     this.mouseIsClicked = false
//     this.board = { width: 0 }
//     this.wordSoFar = ''
//     this.currentCoordinate = { row: 0, column: 0 }
//   }

//   public startGame = (boardLine: string, wordLength: number) => {
//     this.boardDictionary = loadDictionary(boardLine, this.fullDictionary, wordLength)
//     this.possibleWords = [...this.boardDictionary]
//     this.foundWords = []
//     this.board = getBoard(boardLine)
//   }

//   private resetBoard = () => {
//     for(let x = 0; x < this.board.width; x++) {
//       for(let y = 0; y < this.board.width; y++) {
//         this.board[x][y].visited = false
//       }
//     }
//   }

//   private filterOutFoundWords = (dictionary: string[]) => {
//     return R.filter<string>(word => !this.foundWords.includes(word), dictionary)
//   }

//   private isInReachableLocation = (coordinates: Coordinates) => {
//     const possibleTravelDirections = getPossibleTravelDirections({ ...this.currentCoordinate, width: this.board.width })

//     console.log('checking coordinates:', coordinates)

//     if (!possibleTravelDirections.filter(cw => coordinates.column === cw.column && coordinates.row === cw.row).length) {
//       console.log('non-accessible', { currentCoordinates: this.currentCoordinate, targetCoordinates: coordinates, possibleTravelDirections })
//       return false
//     }

//     const { row, column } = coordinates
//     if (this.board[row][column].visited) {
//       console.log('letter is visited')
//       return false
//     }
//   }

//   private updateWordStatus = (coordinates: Coordinates) => {
//     const { row, column } = coordinates

//     this.possibleWords = possibleWordsGivenBoard({
//       ...coordinates,
//       dictionary: this.filterOutFoundWords(this.possibleWords),
//       board: this.board,
//       wordSoFar: this.wordSoFar
//     })

//     this.wordSoFar = `${this.wordSoFar}${this.board[row][column].letter}`
//     this.board[row][column].visited = true

//     console.log(this.wordSoFar)
//   }

//   private buildWord = (coordinates: Coordinates) => {
//     if (!this.isInReachableLocation(coordinates)) return
//     console.log('updating coordinates')
//     this.currentCoordinate = coordinates
//     this.updateWordStatus(coordinates)
//   }

//   public updateCoordinates = (row: number, column: number) => {
//     console.log('mouse clicked:', this.mouseIsClicked)

//     if (this.mouseIsClicked) return this.buildWord({ row, column })

//     this.currentCoordinate = { row, column }
//   }

//   private mouseClickBegin = () => {
//     this.mouseIsClicked = true
//     this.updateWordStatus(this.currentCoordinate)
//   }

//   private mouseClickEnd = () => {
//     this.mouseIsClicked = false
//     if (this.possibleWords.includes(this.wordSoFar)) {
//       this.foundWords.push(this.wordSoFar)
//     }
//     this.possibleWords = [...this.boardDictionary]
//     this.wordSoFar = ''
//     this.resetBoard()
//   }

//   public handleMouseClickEvent = (mouseIsClicked: boolean) => {
//     if (this.mouseIsClicked === mouseIsClicked) return
//     if (mouseIsClicked) return this.mouseClickBegin()

//     return this.mouseClickEnd()
//   }
// }

export type GameState = {
  board: GameBoard,
  foundWords: string[],
  possibleWordsGivenLetterChain: string[],
  remainingWords: string[],
  currentLetter: Coordinates,
  currentLetterChain: string,
  mouseIsClicked: boolean
}

export type GameReducerInitializerArgument = {
  board: string,
  wordLength: number
}

export const getInitialState = ({ board, wordLength }: GameReducerInitializerArgument): GameState => {
  const remainingWords = loadDictionary(board, englishDictionary, wordLength)
  return {
    board: getBoard(board),
    currentLetter: { row: 0, column: 0 },
    currentLetterChain: '',
    foundWords: [],
    mouseIsClicked: false,
    possibleWordsGivenLetterChain: remainingWords,
    remainingWords
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

const handleLetterChainUpdate = (state: GameState): GameState => {
  const {
    possibleWordsGivenLetterChain,
    currentLetter,
    foundWords,
    board,
    currentLetterChain
  } = state
  const { row, column } = currentLetter

  console.log({ currentLetter })

  const newPossibleWords = possibleWordsGivenBoard({
    ...currentLetter,
    dictionary: R.filter(word => !foundWords.includes(word), possibleWordsGivenLetterChain),
    board,
    wordSoFar: currentLetterChain
  })

  const newCurrentLetterChain = `${currentLetterChain}${board[row][column].letter}`
  board[row][column].visited = true

  console.log({ currentLetterChain, newCurrentLetterChain })
  return {
    ...state,
    possibleWordsGivenLetterChain: newPossibleWords,
    currentLetterChain: newCurrentLetterChain
  }
}

const handleStartClick = (state: GameState): GameState => {
  return handleLetterChainUpdate(state)
}

const handleFinishClick = (state: GameState): GameState => {
  console.log('finishing a click')
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
  return {
    ...state,
    foundWords: newFoundWords,
    remainingWords: newRemainingWords,
    possibleWordsGivenLetterChain: newPossibleWords,
    currentLetterChain: newLetterChain,
    board: newBoard
  }
}

const handleClick = (state: GameState, { clicked }: ClickInfo) => {
  if (clicked === state.mouseIsClicked) return state

  state.mouseIsClicked = clicked

  return clicked ? handleStartClick(state) : handleFinishClick(state)
}

const isValidMove = ({ board, currentLetter }: GameState, newCoords: Coordinates) => {
    const possibleTravelDirections = getPossibleTravelDirections({ ...currentLetter, width: board.width })

    if (!possibleTravelDirections.filter(cw => newCoords.column === cw.column && newCoords.row === cw.row).length) {
      console.log('non-accessible coords', { currentCoordinates: currentLetter, targetCoordinates: newCoords, possibleTravelDirections })
      return false
    }

    const { row, column } = newCoords
    if (board[row][column].visited) {
      console.log('letter is visited', { targetCoordinates: newCoords })
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
  if (shouldUpdate) return handleLetterChainUpdate({ ...state, currentLetter: coordinates })
  return state
}

const handleHover = (state: GameState, { coordinates }: HoverInfo): GameState => {
  if (state.mouseIsClicked) return handleClickedHover(state, coordinates)
  return {
    ...state,
    currentLetter: coordinates
  }
}

export const gameReducer = (state: GameState, action: GameAction) => {
  console.log(JSON.stringify(state, null, 2))
  if (action.type === click) return handleClick(state, action.info as ClickInfo)
  if (action.type === hover) return handleHover(state, action.info as HoverInfo)

  return state
}

export const GameContext = createContext<React.Dispatch<GameAction>>(null as any)
