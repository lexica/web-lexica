import axios from 'axios'
import * as R from 'ramda'
import { Dispatch, Reducer, useEffect, useMemo, useReducer, useState } from 'react'
import { Board } from './board'
import {
  GameAction,
  gameReducer,
  GameReducerInitializerArgument,
  GameState as InternalGameState,
  getInitialState
} from './context'
import { loadDictionary } from './dictionary'
import { GameRules, ScoreType } from './rules'

import scores from './scores.json'

const alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'qu', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'] as const
type Alphabet = typeof alphabet[number]


export type Language = keyof typeof scores
export type Letter = keyof typeof scores[Language]

export const getLetterScore = (letter: string, language: string) => scores[language as Language][letter as Letter]

export const scoreWord = (word: string, _scoreType: ScoreType = ScoreType.Letters, language: string = 'en_US') => R.pipe<string, Alphabet[], number>(
  R.splitEvery(1) as (a: string) => Alphabet[],
  R.reduce<Alphabet, number>((acc, letter) => acc + scores[language as any as keyof typeof scores][(letter as string) === 'q' ? 'qu' : letter], 0)
)(word)

export const orderByWordScore = (dictionary: string[], scoreType: ScoreType = ScoreType.Letters) => R.sortWith(
  [R.descend<string>((word) => scoreWord(word, scoreType)), R.ascend<string>(R.identity)],
  dictionary
)


export type GameState = {
  currentLetterChain: string,
  board: Board,
  foundWords: string[],
  remainingWords: string[],
  guessedWords: string[]
}


export const useGame = (rules: GameRules, dictionary: string[]): [GameState, Dispatch<GameAction>] => {
  const forceUpdate = useReducer((x: number) => x+1, 0)[1]
  const [state, dispatch] = useReducer<
    Reducer<InternalGameState, GameAction>,
    GameReducerInitializerArgument
  >(gameReducer, {
    totalTime: rules.time,
    forceUpdate,
    dictionary,
    ...rules
  }, getInitialState)

  const { board, foundWords, remainingWords, guessedWords, currentLetterChain } = state

  const exportedState = { board, foundWords, remainingWords, guessedWords, currentLetterChain }
  return [exportedState, dispatch]
}

type UseLanguageDictionaryReturnValue = {
  dictionary: string[],
  loading: boolean,
  error: boolean
}

const useLanguageDictionary = (language: string) => {
  const url = useMemo(
    () => `https://raw.githubusercontent.com/lexica/lexica/master/assets/dictionaries/dictionary.${language}.txt`,
    [language]
  )
  const [dictionary, updateDictionary] = useState<UseLanguageDictionaryReturnValue>({
    dictionary: [],
    loading: true,
    error: false
  })

  useEffect(() => {
    if (url.indexOf('..') === -1) {
      axios.get<string>(url).then(({ data }) => {
        const dict = data.split('\n')
        updateDictionary({
          loading: false,
          error: false,
          dictionary: dict
        })
      }).catch(err => {
        updateDictionary({
          loading: false,
          error: true,
          dictionary: []
        })
        return err
      })
    }
  }, [url, updateDictionary])

  return dictionary
}

const resolveDictionary = (dictionary: string[], board: string, minimumWordLength: number): Promise<string[]> => {
  const canUseWebWorkers = false
  if (canUseWebWorkers) {
    // do the web workers stuff here.... not sure how to do that quite yet
  }
  return Promise.resolve(loadDictionary(board, dictionary, minimumWordLength))
}

export const useDictionary = (gameRules: GameRules): UseLanguageDictionaryReturnValue => {
  const completeDictionary = useLanguageDictionary(gameRules.language)
  const [boardDictionary, updateBoardDictionary] = useState(completeDictionary)

  useEffect(() => {
    const { dictionary, loading, error } = completeDictionary
    const { board, minimumWordLength } = gameRules
    if (!loading && !error) {
      resolveDictionary(dictionary, board, minimumWordLength)
        .then(boardDictionary => updateBoardDictionary({
          dictionary: boardDictionary,
          loading: false,
          error: false
        }))
        .catch(err => {
          updateBoardDictionary({
            dictionary,
            loading: false,
            error: true
          })
          return err
        })
    }
  }, [completeDictionary, gameRules])

  return boardDictionary
}
