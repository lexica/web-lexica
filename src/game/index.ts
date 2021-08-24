import * as R from 'ramda'
import { Dispatch, Reducer, useReducer } from 'react'
import { GameAction, gameReducer, GameReducerInitializerArgument, GameState, getInitialState } from './context'

import scores from './scores.json'

export enum PointModes {
  Letters = 'letters',
  Length = 'length'
}

const alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'qu', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'] as const
type Alphabet = typeof alphabet[number]

export const scoreWord = (word: string, _pointMode: PointModes = PointModes.Letters) => R.pipe<string, Alphabet[], number>(
  R.splitEvery(1) as (a: string) => Alphabet[],
  R.reduce<Alphabet, number>((acc, letter) => acc + scores[(letter as string) === 'q' ? 'qu' : letter], 0)
)(word)

export const orderByWordScore = (dictionary: string[]) => R.sortWith([R.descend<string>(scoreWord), R.ascend<string>(R.identity)], dictionary)

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

enum ScoreType {
  Letters = 'l',
  Words = 'w'
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

export const useGame = (urlParams: GameURLParams): [GameState, Dispatch<GameAction>, GameParameters] => {
  const gameParams = parseGameParameters(urlParams)

  const forceUpdate = useReducer((x: number) => x+1, 0)[1]
  const [state, dispatch] = useReducer<
    Reducer<GameState, GameAction>,
    GameReducerInitializerArgument
  >(gameReducer, {
    totalTime: gameParams.time,
    forceUpdate,
    ...gameParams
  }, getInitialState)
  return [state, dispatch, gameParams]
}

