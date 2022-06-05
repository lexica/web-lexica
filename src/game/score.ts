import * as R from 'ramda'
import { createContext, Reducer, useCallback, useEffect, useReducer } from 'react'
import { logger } from '../util/logger'

export type ScoreState = {
  foundWords: string[],
  remainingWords: string[]
}

export enum ScoreAction {
  AddGuess = 'add-guess'
}

export enum ScoreType {
  Letters = 'l',
  Length = 'w'
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
  if (state.foundWords.length) return state
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

export const useScore = (
  boardDictionaryState: { boardDictionary: string[] },
  { foundWords, remainingWords }: ScoreState = { foundWords: [], remainingWords: [] }
): [ScoreState, (guess: string) => void] => {
  const [state, dispatch] = useReducer<Reducer<ScoreState, InternalScoreReducerAction<ScoreAction | InternalScoreAction>>>(scoreReducer, {
    foundWords,
    remainingWords
  })

  const dispatchScoreUpdate = useCallback((guess: string) => {
    dispatch({ type: ScoreAction.AddGuess, info: guess })
  }, [dispatch])


  // const lastGuess = useMemo(() => guessState.guesses[guessState.guesses.length - 1], [guessState])

  // useEffect(() => {
  //   logger.debug('running score useEffect, dispatch score update...')
  //   logger.debug(`Last Guess: ${lastGuess}`)
  //   dispatch({ type: ScoreAction.AddGuess, info: lastGuess })
  // }, [lastGuess, dispatch])

  useEffect(() => {
    logger.debug('running second useScore use effect... update dictionary')
    dispatch({ type: InternalScoreAction.UpdateDictionary, info: boardDictionaryState.boardDictionary })
  }, [boardDictionaryState, dispatch])

  return [state, dispatchScoreUpdate]
}

export type ScoreContext = ScoreState

export const Score = createContext<ScoreContext>({
  foundWords: [],
  remainingWords: []
})
