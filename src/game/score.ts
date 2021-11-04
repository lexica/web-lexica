import * as R from 'ramda'
import { createContext, Reducer, useEffect, useMemo, useReducer } from 'react'
import { logger } from '../util/logger'
import { GuessState } from './guess'

export type ScoreState = {
  foundWords: string[],
  remainingWords: string[]
}

export enum ScoreAction {
  AddGuess = 'add-guess'
}

export enum ScoreType {
  Letters = 'l',
  Words = 'w'
}

enum InternalScoreAction {
  UpdateDictionary = 'update-dictionary'
}

export type ScoreReducerAction<A extends ScoreAction> = {
  type: A,
  info: A extends ScoreAction.AddGuess ? string : never
}

type InternalScoreReducerAction<A extends InternalScoreAction | ScoreAction> = {
  type: A,
  info: A extends ScoreAction.AddGuess
    ? string
    : A extends InternalScoreAction.UpdateDictionary
    ? string[]
    : never
}

const handleAddGuess = (state: ScoreState, guess: string): ScoreState => {
  const { foundWords, remainingWords } = state
  if(remainingWords.includes(guess)) {
    return {
      foundWords: [...foundWords, guess],
      remainingWords: R.filter(word => word !== guess, remainingWords)
    }
  }

  return state
}

const handleUpdateDictionary = (state: ScoreState, dictionary: string[]): ScoreState => {
  return {
    foundWords: [],
    remainingWords: dictionary
  }
}

const scoreReducer = <A extends ScoreAction | InternalScoreAction>(state: ScoreState, action: InternalScoreReducerAction<A>): ScoreState => {
  switch (action.type) {
    case ScoreAction.AddGuess:
      return handleAddGuess(state, action.info as string)
    case InternalScoreAction.UpdateDictionary:
      return handleUpdateDictionary(state, action.info as string[])
    default:
      throw new Error(`${action.type} action has not been implemented!`)
  }
}

export const useScore = (guessState: GuessState, boardDictionaryState: { boardDictionary: string[] }) => {

  const [state, dispatch] = useReducer<Reducer<ScoreState, InternalScoreReducerAction<ScoreAction | InternalScoreAction>>>(scoreReducer, {
    foundWords: [],
    remainingWords: []
  })

  const lastGuess = useMemo(() => guessState.guesses[guessState.guesses.length - 1], [guessState])

  useEffect(() => {
    logger.debug('running score useEffect, dispatch score update...')
    logger.debug(`Last Guess: ${lastGuess}`)
    dispatch({ type: ScoreAction.AddGuess, info: lastGuess })
  }, [lastGuess, dispatch])

  useEffect(() => {
    logger.debug('running second useScore use effect... update dictonary')
    dispatch({ type: InternalScoreAction.UpdateDictionary, info: boardDictionaryState.boardDictionary })
  }, [boardDictionaryState, dispatch])

  return state
}

export type ScoreContext = ScoreState

export const Score = createContext<ScoreContext>({
  foundWords: [],
  remainingWords: []
})
