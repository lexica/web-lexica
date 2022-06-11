import { useCallback, useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router"
import { getB64DelimitedURLBoard } from "../game/board/hooks"
import { GameParamMap, GameURLParams } from "../game/url"

export const parseURLSearch = <T = any>(search: string): T => {
  const keyValuePairs = search.replace('?', '').split('&')
  return keyValuePairs.reduce((acc: Partial<T>, keyValuePair: string) => {
    const [key, value] = keyValuePair.split('=')
    return {
      ...acc,
      [decodeURI(key) as keyof T]: decodeURI(value) as unknown as T[keyof T]
    }
  }, {} as Partial<T>) as T
}

export type Location = {
  hostname: string,
  port: string,
  protocol: string,
  pathname: string,
  search: string,
}

export const getBaseUrl = ({ hostname, port, protocol }: Location = window.location) => {
  const usePort = !(`${port}` === '443' || `${port}` === '80' || `${port}` === '')
  return `${protocol}//${hostname}${usePort ? `:${port}` : ''}`
}

export const getGamePath = ({ pathname, search }: { pathname: string, search: string } = window.location) => {
  const withoutBasepath = pathname.replace(/^\/?web-lexica/, '')
  return `${withoutBasepath}${search}`
}

export const useGamePath = () => {
  const location = useLocation()
  const [gamePath, setGamePath] = useState(getGamePath(location))

  useEffect(() => {
    const newPath = getGamePath(location)
    if (newPath === gamePath) return

    setGamePath(newPath)
  }, [setGamePath, location, gamePath])

  return gamePath
}

/**
 * Navigates back unless doing so would result in leaving the app.
 * If that would be the case, will navigate to the root url instead.
 * @returns {() => void}
 */
export const useSafeNavigateBack = () => {
  const navigate = useNavigate()
  return useCallback(() => {
    if (!window?.history?.state?.idx) {
      navigate('/')
      return
    }
    navigate(-1)
  }, [navigate])
}

const basePathRegex = /^(?:\/?web-lexica)?/

// Careful, check the tests before using this.
const stripBasepathFromPath = (path: string) => path
  .replace(basePathRegex, '')
  .replace(/^\//, '')
  .replace(/\/$/, '')

/**
 * Validates a game url, will return false if it doesn't match
 *  what a normal url should have:
 *  `/singleplayer?b=...wl=...` etc
 *
 * Also validates the contents of the queary string to make sure
 * nothing is missing, and that the board is a standard shape
 * 
 * Not picky about including or excluding `/web-lexica/` or `web-lexica/`
 *
 * @param gamePath the path to validate
 * @returns {boolean}
 */
export const isValidGamePath = (gamePath: string) => {
  const segments = gamePath.split('?')
  if (segments.length !== 2) return false
  const [basePath, queryString] = segments

  const path = stripBasepathFromPath(basePath)
  if (!['singleplayer', 'multiplayer'].includes(path)) return false

  const params = parseURLSearch<GameURLParams>(queryString)
  if (!params?.b?.length) return false
  if (!params[GameParamMap.Language]) return false
  if (!params[GameParamMap.MinimumWordLength]) return false
  if (!params[GameParamMap.Score]) return false
  if (!params[GameParamMap.Time]) return false

  const board = getB64DelimitedURLBoard({ board: params[GameParamMap.Board], delimiter: ',' })
  if (![4*4, 5*5, 6*6].includes(board.length)) return false
  return true

}

export const __test = {
  basePathRegex,
  stripBasepathFromPath
}
