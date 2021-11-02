import { useMemo } from 'react'
import { useLocation } from 'react-router'
import { parseURLSearch } from '../util/url'
import { ScoreType } from './score'

enum GameParamMap {
  Board = 'b',
  Language = 'l',
  Time = 't',
  Score = 's',
  MinimumWordLength = 'm',
  MinimumVersion = 'mv',
  Version = 'v'
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

const parseGameParameters = (urlParams: GameURLParams) => {
  const language = urlParams[GameParamMap.Language]
  const minimumVersion = parseInt(urlParams[GameParamMap.MinimumVersion])


  return {
    board: urlParams[GameParamMap.Board],
    language,
    time: parseInt(urlParams[GameParamMap.Time]),
    score: urlParams[GameParamMap.Score],
    minimumWordLength: parseInt(urlParams[GameParamMap.MinimumWordLength]),
    minimumVersion,
    version: parseInt(urlParams[GameParamMap.Version])
  }
}

export const useGameUrlParameters = () => {
  const location = useLocation()
  return useMemo(() => parseGameParameters(parseURLSearch<GameURLParams>(location.search)), [location.search])
}
