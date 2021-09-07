import { createContext, useMemo } from 'react'
import { useLocation } from 'react-router-dom'

import { parseURLSearch } from '../util/url'

export enum ScoreType {
  Letters = 'l',
  Words = 'w'
}

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

const parseGameParameters = (urlParams: GameURLParams) => ({
  board: urlParams[GameParamMap.Board],
  language: urlParams[GameParamMap.Language],
  time: parseInt(urlParams[GameParamMap.Time]),
  score: urlParams[GameParamMap.Score],
  minimumWordLength: parseInt(urlParams[GameParamMap.MinimumWordLength]),
  minimumVersion: parseInt(urlParams[GameParamMap.MinimumVersion]),
  version: parseInt(urlParams[GameParamMap.Version])
})

export type GameRules = ReturnType<typeof parseGameParameters>


export const useRulesFromQueryString = (): GameRules => {
  const location = useLocation()
  const params = useMemo(() => parseGameParameters(parseURLSearch<GameURLParams>(location.search)), [location.search])
  return params
}

export const Rules = createContext<GameRules>(undefined as any)
