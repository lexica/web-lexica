import { normalize } from "duration-fns"
import { getIndexMatchingArrayOfLength } from "../../util"
import { splice } from "../../util/splice"
import { storage } from "../../util/storage"
import { isValidGamePath } from "../../util/url"
import { getB64DelimitedURLBoard } from "../board/hooks"
import { ScoreType } from "../score"
import { gameLocalStorage, GameLocalStorage, LocalStorage, SavedGame } from "./types"

export const getGameLocalStorageKey = (gameUrl: string, storageKey: GameLocalStorage) => `${storageKey}-${gameUrl}`

export const defaultSavedGame: SavedGame = {
  [GameLocalStorage.Board]: [],
  [GameLocalStorage.Guesses]: [],
  [GameLocalStorage.Language]: {
    definitionUrl: '',
    isBeta: true,
    letterProbabilities: {},
    letterScores: {},
    locale: '',
    name: ''
  },
  [GameLocalStorage.Timer]: 0,
  [GameLocalStorage.Score]: { remainingWords: [], foundWords: [] },
  [GameLocalStorage.Rules]: {
    boardWidth: 0,
    minimumWordLength: 0,
    score: ScoreType.Length,
    time: normalize({ seconds: 0 }),
    name: '',
    timeAttack: 0
  }
}

export const addGameToSavedGames = (url: string) => {
  const list = getSavedGameList()

  if (list.includes(url)) return

  storage.set(LocalStorage.SavedGames, [...list, url])
}

export const removeGameFromSavedGames = (url: string) => {
  const list = getSavedGameList()
  if (!list.includes(url)) return
  const index = list.indexOf(url)
  storage.set(LocalStorage.SavedGames, splice(list, index, 1))
}

export const loadGame = (gameUrl: string) => {
  type MedianType<T> = { [P in keyof T]: (key: string) => T[P] }
  type LoaderMap = MedianType<SavedGame>
  const defaultLoaders = gameLocalStorage.reduce<LoaderMap>((acc, storageKey) => ({
    ...acc,
    [storageKey]: (key: string) => storage.get({ key }) || defaultSavedGame[storageKey]
  }) , {} as any)
  const loadMap: LoaderMap = {
    ...defaultLoaders,
    [GameLocalStorage.Timer]: key => {
      const storedValue = storage.get<string>({ key, parser: a => a })
      if (!storedValue) return defaultSavedGame[GameLocalStorage.Timer]
      return parseInt(storedValue)
    },
    [GameLocalStorage.Board]: key => {
      const encodedBoard = storage.get<string>({ key, parser: a => a })
      if (!encodedBoard) return defaultSavedGame[GameLocalStorage.Board]
      return getB64DelimitedURLBoard({ board: encodedBoard, delimiter: ',' })
    }
  }

  return gameLocalStorage.reduce<SavedGame>((acc, storageKey) => ({
    ...acc,
    [storageKey]: loadMap[storageKey](getGameLocalStorageKey(gameUrl, storageKey))
  }), {} as any)
}

export const savedGameExistsForUrl = (gameUrl: string) => {
  const list = getSavedGameList()

  return list.includes(gameUrl)
}

export const clearSaveGameData = (gameUrl: string) => {
  gameLocalStorage.forEach(key => storage.remove(getGameLocalStorageKey(gameUrl, key)))
  removeGameFromSavedGames(gameUrl)
}

const isGameLocalStorageBaseKey = (maybeKey: string): maybeKey is GameLocalStorage => gameLocalStorage.includes(maybeKey as any)

const isGameLocalStorageKey = (maybeKey: string) => {
  const baseKey = maybeKey.split('-')[0]
  if (!isGameLocalStorageBaseKey(baseKey)) return false

  const path = maybeKey.replace(`${baseKey}-`, '')

  return isValidGamePath(path)
}

export const clearAllSaveGameData = () => {
  const storageKeyCount = window.localStorage.length
  const toRemove = getIndexMatchingArrayOfLength(storageKeyCount).reduce((acc, keyIndex) => {
    const key = window.localStorage.key(keyIndex)
    if (key === null) return acc
    if (isGameLocalStorageKey(key)) return [...acc, key]
    return acc
  }, [] as string[])
  
  for (const key of toRemove) {
    storage.remove(key)
  }

  storage.set(LocalStorage.SavedGames, [])
}

export const getSavedGameList = () => storage.getWithDefault({
  key: LocalStorage.SavedGames,
  defaultValue: [] as string[]
})
