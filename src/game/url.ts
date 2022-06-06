import { Duration, toSeconds } from 'duration-fns'
import { useMemo } from 'react'
import { useLocation } from 'react-router'
import { utf8ToB64 } from '../util/base-64'
import { HighestSupportedMinimumVersion } from '../util/compatibility-android'
import { parseURLSearch } from '../util/url'
import { ScoreType } from './score'

export enum GameParamMap {
  Board = 'b',
  Language = 'l',
  Time = 't',
  Score = 's',
  MinimumWordLength = 'm',
  MinimumVersion = 'mv',
  Version = 'v',
  TimeAttack = 'ta'
}

export const encodeBoard = (board: string[]): string => {
  const stringified = board.join(',')

  return utf8ToB64(stringified).replace(/=+$/, '')
}

export type GetSearchStringArgs = {
  board: string[],
  language: string,
  time: Duration,
  score: ScoreType,
  minimumWordLength: number
  timeAttack?: number
}

export const getSearchString = ({
  board: boardArray,
  language,
  time: duration,
  score,
  minimumWordLength,
  timeAttack
}: GetSearchStringArgs) => {
  const board = encodeBoard(boardArray)
  const time = toSeconds(duration)

  const keyValuePairs: ([string, string | number])[] = [
    [GameParamMap.Board, board],
    [GameParamMap.Language, language],
    [GameParamMap.Time, time],
    [GameParamMap.Score, score],
    [GameParamMap.MinimumWordLength, minimumWordLength],
    [GameParamMap.MinimumVersion, HighestSupportedMinimumVersion],
    [GameParamMap.Version, HighestSupportedMinimumVersion]
  ]

  timeAttack && keyValuePairs.push([GameParamMap.TimeAttack, timeAttack])

  return `?${keyValuePairs.map(kv => kv.join('=')).join('&')}`
}

export type GameURLParams = {
  b: string,
  l: string,
  t: string,
  s: ScoreType,
  m: string,
  mv: string,
  v: string,
  ta?: string
}

const parseGameParameters = (urlParams: GameURLParams) => {
  const language = urlParams[GameParamMap.Language]
  const minimumVersion = parseInt(urlParams[GameParamMap.MinimumVersion])
  const timeAttack = urlParams?.ta && parseInt(urlParams.ta)

  return {
    board: urlParams[GameParamMap.Board],
    language,
    time: parseInt(urlParams[GameParamMap.Time]),
    score: urlParams[GameParamMap.Score],
    minimumWordLength: parseInt(urlParams[GameParamMap.MinimumWordLength]),
    minimumVersion,
    version: parseInt(urlParams[GameParamMap.Version]),
    timeAttack
  }
}

export const useGameUrlParameters = () => {
  const location = useLocation()
  return useMemo(() => parseGameParameters(parseURLSearch<GameURLParams>(location.search)), [location.search])
}
