import { useMemo } from "react"
import { useLocation } from "react-router"
import { parseURLSearch } from "../../util/url"
import { getB64DelimitedURLBoard } from "../board/util"

const UrlParam = {
  Board: 'b',
  WordIndex: 'w',
  Language: 'l'
} as const

type UrlParamType = typeof UrlParam[keyof typeof UrlParam]

type UrlParamMap = {
  [P in UrlParamType]: string
}

export type GameConfig = {
  encodedBoard: string,
  wordIndex: number,
  useWordleWords: boolean,
  wordOfTheDay: boolean,
  language: string
}

export const useGameConfigFromUrl = () => {
  const location = useLocation()
  const useWordleWords = location.pathname.includes('with-wordle-words')
  const wordOfTheDay = location.pathname.includes('word-of-the-day')
  const searchParams = useMemo(() => parseURLSearch<UrlParamMap>(location.search), [location])

  const config: GameConfig = useMemo(() => ({
    encodedBoard: searchParams.b,
    language: searchParams.l,
    useWordleWords,
    wordIndex: parseInt(searchParams.w),
    wordOfTheDay
  }), [useWordleWords, searchParams, wordOfTheDay])

  return config
}

export const useEncodedBoard = (gameConfig: { encodedBoard: string }) => {
  return useMemo(() => getB64DelimitedURLBoard({ board: gameConfig.encodedBoard, delimiter: ',' }), [gameConfig])
}


export type GetGameUrlParameters = GameConfig & {
  host: string
}

export const getGameUrl = ({ wordIndex, wordOfTheDay, encodedBoard, language, useWordleWords, host }: GetGameUrlParameters) => {
  const gameTypeSegment = wordOfTheDay ? '/word-of-the-day' : '/random'
  const wordleSegment = useWordleWords ? '/with-wordle-words' : ''
  const url = `${host}/web-lexica/lexicle/shared${wordleSegment}${gameTypeSegment}`
  const params: UrlParamMap = {
    [UrlParam.Board]: encodedBoard,
    [UrlParam.Language]: language,
    [UrlParam.WordIndex]: `${wordIndex}`
  }
  const searchString = Object.entries(params).map(([key, value]) => `${key}=${value}`).join('&')

  return `${url}?${searchString}`
}
