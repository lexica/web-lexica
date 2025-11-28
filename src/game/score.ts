import * as R from 'ramda'
import { createContext, useCallback, useEffect, useReducer } from 'react'
import type { Reducer } from 'react'
import { logger } from '../util/logger'

export type ScoreState = {
  foundWords: string[],
  remainingWords: string[]
}

export const ScoreAction = {
  AddGuess: 'add-guess'
} as const

type ScoreActionType = typeof ScoreAction[keyof typeof ScoreAction]

export const ScoreType = {
  Letters: 'l',
  Length: 'w'
} as const

export type ScoreTypeType = typeof ScoreType[keyof typeof ScoreType]

const InternalScoreAction = {
  UpdateDictionary: 'update-dictionary'
} as const

type InternalScoreActionType = typeof InternalScoreAction[keyof typeof InternalScoreAction]

export type ScoreReducerAction<A extends ScoreActionType> = {
  type: A,
  info: A extends (typeof ScoreAction)["AddGuess"] ? string : never
}

type InternalScoreReducerAction<A extends InternalScoreActionType | ScoreActionType> = {
  type: A,
  info: A extends (typeof ScoreAction)["AddGuess"]
    ? string
    : A extends (typeof InternalScoreAction)["UpdateDictionary"]
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

const scoreReducer = <A extends ScoreActionType | InternalScoreActionType>(state: ScoreState, action: InternalScoreReducerAction<A>): ScoreState => {
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
  const [state, dispatch] = useReducer<Reducer<ScoreState, InternalScoreReducerAction<ScoreActionType | InternalScoreActionType>>>(scoreReducer, {
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
