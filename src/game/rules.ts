import { createContext, useEffect, useMemo, useState } from 'react'
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

const parseGameParameters = (urlParams: GameURLParams) => {
  const language = urlParams[GameParamMap.Language]
  const minimumVersion = parseInt(urlParams[GameParamMap.MinimumVersion])
  const getBoardParams: GetBoardParams = {
    board: urlParams[GameParamMap.Board],
    language,
    minimumVersion
  }

  const board = getBoard(getBoardParams)

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

type ParseGameParameters = ReturnType<typeof parseGameParameters>
export type GameRules = Omit<ParseGameParameters, 'board'> & { board: string[] }


export const useRulesFromQueryString = (): GameRules => {
  const location = useLocation()
  const params = useMemo(() => parseGameParameters(parseURLSearch<GameURLParams>(location.search)), [location.search])

  const [rules, setRules] = useState({
    ...params,
    board: ['']
  })

  useEffect(() => {
    params.board.then(board => {
      setRules({
        ...params,
        board
      })
    })
  }, [params])

  return rules
}

export const Rules = createContext<GameRules>(undefined as any)
