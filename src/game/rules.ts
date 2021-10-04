import { createContext, useMemo } from 'react'
import { useLocation } from 'react-router-dom'

import { getLanguageMetadata } from './language'
import { splitWordIntoLetters } from './words'
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

const getB64DelimitedBoard = ({ board, delimiter }: { board: string, delimiter: string }) => {
  const decoded = atob(board)
  return decoded.split(delimiter)
}

const getLanguageLetters = (language: string) => getLanguageMetadata(language)
  .then(({ letterScores }) => Object.keys(letterScores))

const getUndelimitedBoard = async ({ board, language }: { board: string, language: string }) => {
  const letters = await getLanguageLetters(language)

  return splitWordIntoLetters(board, letters)
}

type GetBoardParams = {
  minimumVersion: number,
  board: string,
  language: string
}

const getBoard = ({ minimumVersion, board, language }: GetBoardParams) => {
  if (minimumVersion >= 20017) return Promise.resolve(getB64DelimitedBoard({ board, delimiter: ',' }))
  return getUndelimitedBoard({ board, language })
}

const parseGameParameters = async (urlParams: GameURLParams) => {
  const language = urlParams[GameParamMap.Language]
  const minimumVersion = parseInt(urlParams[GameParamMap.MinimumVersion])
  const getBoardParams: GetBoardParams = {
    board: urlParams[GameParamMap.Board],
    language,
    minimumVersion
  }

  const board = await getBoard(getBoardParams)

  return {
    board,
    language,
    time: parseInt(urlParams[GameParamMap.Time]),
    score: urlParams[GameParamMap.Score],
    minimumWordLength: parseInt(urlParams[GameParamMap.MinimumWordLength]),
    minimumVersion,
    version: parseInt(urlParams[GameParamMap.Version])
  }
}

type PromiseReturnType<T extends (...args: any[]) => Promise<any>> = ReturnType<T> extends Promise<infer X> ? X : never

export type GameRules = PromiseReturnType<typeof parseGameParameters>


export const useRulesFromQueryString = (): Promise<GameRules> => {
  const location = useLocation()
  const params = useMemo(() => parseGameParameters(parseURLSearch<GameURLParams>(location.search)), [location.search])
  return params
}

export const useDummyRules = () => {
  const location = useLocation()
  const { l: language } = useMemo(
    () => parseURLSearch<GameURLParams>(location.search),
    [location.search]
  )

  return {
    board: [''],
    language,
    minimumVersion: 0,
    minimumWordLength: 0,
    score: ScoreType.Words,
    time: 0,
    version: 0
  }
}

export const Rules = createContext<GameRules>(undefined as any)
