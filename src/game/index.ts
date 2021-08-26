import * as R from 'ramda'
import { Dispatch, Reducer, useMemo, useReducer } from 'react'
import { useLocation } from 'react-router'
import { parseURLSearch } from '../util/url'
import { Board } from './board'
import {
  GameAction,
  gameReducer,
  GameReducerInitializerArgument,
  GameState as InternalGameState,
  getInitialState
} from './context'

import scores from './scores.json'

const alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'qu', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'] as const
type Alphabet = typeof alphabet[number]

export enum ScoreType {
  Letters = 'l',
  Words = 'w'
}

export const scoreWord = (word: string, _scoreType: ScoreType = ScoreType.Letters) => R.pipe<string, Alphabet[], number>(
  R.splitEvery(1) as (a: string) => Alphabet[],
  R.reduce<Alphabet, number>((acc, letter) => acc + scores[(letter as string) === 'q' ? 'qu' : letter], 0)
)(word)

export const orderByWordScore = (dictionary: string[], scoreType: ScoreType = ScoreType.Letters) => R.sortWith(
  [R.descend<string>((word) => scoreWord(word, scoreType)), R.ascend<string>(R.identity)],
  dictionary
)

export type GameURLParams = {
  b: string,
  l: string,
  t: string,
  s: ScoreType,
  m: string,
  mv: string,
  v: string
}

enum GameParamMap {
  Board = 'b',
  Language = 'l',
  Time = 't',
  Score = 's',
  MinimumWordLength = 'm',
  MinimumVersion = 'mv',
  Version = 'v'
}

export const parseGameParameters = (urlParams: GameURLParams) => ({
  board: urlParams[GameParamMap.Board],
  language: urlParams[GameParamMap.Language],
  time: parseInt(urlParams[GameParamMap.Time]),
  score: urlParams[GameParamMap.Score],
  minimumWordLength: parseInt(urlParams[GameParamMap.MinimumWordLength]),
  minimumVersion: parseInt(urlParams[GameParamMap.MinimumVersion]),
  version: parseInt(urlParams[GameParamMap.Version])
})

export type GameParameters = ReturnType<typeof parseGameParameters>

export type GameState = {
  currentLetterChain: string,
  board: Board,
  foundWords: string[],
  remainingWords: string[],
  guessedWords: string[]
}

export const useGameParameters = () => {
  const location = useLocation()
  const params = useMemo(() => parseGameParameters(parseURLSearch<GameURLParams>(location.search)), [location.search])
  return params
}

export const useGame = (urlParams: GameURLParams): [GameState, Dispatch<GameAction>, GameParameters] => {
  const gameParams = parseGameParameters(urlParams)

  const forceUpdate = useReducer((x: number) => x+1, 0)[1]
  const [state, dispatch] = useReducer<
    Reducer<InternalGameState, GameAction>,
    GameReducerInitializerArgument
  >(gameReducer, {
    totalTime: gameParams.time,
    forceUpdate,
    ...gameParams
  }, getInitialState)

  const { board, foundWords, remainingWords, guessedWords, currentLetterChain } = state

  const exportedState = { board, foundWords, remainingWords, guessedWords, currentLetterChain }
  return [exportedState, dispatch, gameParams]
}

