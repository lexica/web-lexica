import { useCallback, useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router"

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
  const usePort = !(port === '443' || port === '80')
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
