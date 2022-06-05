import { normalize } from 'duration-fns'
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

import { Guess, GuessContext } from './guess'
import { Language, LanguageContext, MetadataV1 } from './language'
import { Rules, RulesContext, Ruleset } from './rules'
import { Score, ScoreContext, ScoreState, ScoreType } from './score'
import { Timer, TimerContext } from './timer'
import { storage, useStorage } from '../util/storage'
import { splice } from '../util/splice'
import { parseURLSearch, useGamePath } from '../util/url'
import { encodeBoard, GameURLParams } from './url'
import { Board, getB64DelimitedURLBoard } from './board/hooks'
import { usePageVisibility, VisibilityState } from '../util/page-visibility-api'

export type UseSaveGameOnBlurArguments = {
  board: string[],
  rules: Ruleset,
  language: LanguageContext,
  score: ScoreContext,
  guess: GuessContext,
  timer: TimerContext,
  url: string
}

export enum LocalStorage {
  SavedGames  = 'saved-games'
}

export enum GameLocalStorage {
  Score = 'score',
  Timer = 'timer',
  Guesses = 'guesses',
  Board = 'board',
  Rules = 'rules',
  Language = 'language'
}

const gameLocalStorage = [
  GameLocalStorage.Score,
  GameLocalStorage.Timer,
  GameLocalStorage.Guesses,
  GameLocalStorage.Board,
  GameLocalStorage.Rules,
  GameLocalStorage.Language
] as const

export type SavedGame = {
  [GameLocalStorage.Score]: ScoreState,
  [GameLocalStorage.Timer]: number,
  [GameLocalStorage.Guesses]: string[],
  [GameLocalStorage.Board]: string[],
  [GameLocalStorage.Rules]: RulesContext,
  [GameLocalStorage.Language]: MetadataV1
}

const getGameLocalStorageKey = (gameUrl: string, storageKey: GameLocalStorage) => `${storageKey}-${gameUrl}`

export const keyIsInvalid = (key: string) => {
  if (!key.includes('?')) return true
  const params = parseURLSearch<GameURLParams>(key.replace(/^.*\?/, ''))
  if (!params?.b?.length) return true
  return false
}

const loadGame = (gameUrl: string) => {
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

export type SavedGames = string[]

export const getSavedGameList = () => storage.getWithDefault({
  key: LocalStorage.SavedGames,
  defaultValue: [] as SavedGames
})

const addGameToSavedGames = (url: string) => {
  const list = getSavedGameList()

  if (list.includes(url)) return

  storage.set(LocalStorage.SavedGames, [...list, url])
}

const removeGameFromSavedGames = (url: string) => {
  const list = getSavedGameList()
  if (!list.includes(url)) return
  const index = list.indexOf(url)
  storage.set(LocalStorage.SavedGames, splice(list, index, 1))
}

export const savedGameExistsForUrl = (gameUrl: string) => {
  const list = getSavedGameList()

  return list.includes(gameUrl)
}

export const clearSaveGameData = (gameUrl: string) => {
  gameLocalStorage.forEach(key => storage.remove(getGameLocalStorageKey(gameUrl, key)))
  removeGameFromSavedGames(gameUrl)
}

const useLocalStorageKey = (storageKey: GameLocalStorage) => getGameLocalStorageKey(useGamePath(), storageKey)

const useSaveLanguageMetadata = (): void => {
  const key = useLocalStorageKey(GameLocalStorage.Language)
  const languageState = useContext(Language)

  useEffect(() => {
    if (keyIsInvalid(key)) return
    storage.set(key, languageState.metadata)
  }, [languageState, key])
}

const useSaveTime = () => {
  const key = useLocalStorageKey(GameLocalStorage.Timer)
  const { getRemainingTime, state: { isPaused } } = useContext(Timer)
  const intervalRef = useRef<undefined | number>()
  useEffect(() => {
    if (isPaused) return
    if (keyIsInvalid(key)) return
    
    const storeTime = () => {
      const remainingSeconds = Math.max(getRemainingTime(), 0)
      storage.set(key, remainingSeconds)
    }

    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(storeTime, 1000) as any as number

    return () => {
      storeTime()
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = undefined
      }
    }
  }, [key, getRemainingTime, isPaused, intervalRef])
  return intervalRef
}

const useSaveGuesses = (): void => {
  const key = useLocalStorageKey(GameLocalStorage.Guesses)

  const guessState = useContext(Guess)

  const guessCount = useRef(guessState?.guesses?.length || 0)

  useEffect(() => {
    if (keyIsInvalid(key)) return
    const length = guessState?.guesses?.length || 0
    if (guessCount.current === length) return
    guessCount.current = length

    storage.set(key, guessState.guesses)
  }, [key, guessState, guessCount])
}

const useSaveBoard = () => {
  const board = useContext(Board)
  const key = useLocalStorageKey(GameLocalStorage.Board)

  useEffect(() => {
    if (keyIsInvalid(key)) return
    if (!board?.length) return
    const encodedBoard = encodeBoard(board)
    storage.set(key, encodedBoard)
  }, [key, board])
}

const useSaveScore = (): void => {
  const scoreState = useContext(Score)
  const key = useLocalStorageKey(GameLocalStorage.Score)
  useEffect(() => {
    if (keyIsInvalid(key)) return
    if (!scoreState?.remainingWords?.length) return
    storage.set(key, scoreState)
  }, [key, scoreState])
}

const useSaveGameRuleset = (): void => {
  const rules = useContext(Rules)
  const key = useLocalStorageKey(GameLocalStorage.Rules)
  useEffect(() => {
    if (keyIsInvalid(key)) return
    if (!rules.time) return
    storage.set(key, rules)
  }, [key, rules])
}

export const usePauseGameOnBlur = (timer: TimerContext) => {
  const [isPaused, setIsPaused] = useState(false)
  const visibility = usePageVisibility()

  useEffect(() => {
    const visibilityStateHandlerMap = {
      [VisibilityState.Hidden]: () => {
        timer.pauseTime()
        setIsPaused(true)
      },
      [VisibilityState.Visible]: () => {
        setIsPaused(false)
        if (!timer.state.isPaused) return

        timer.startTime()
      }
    }

    const handler = visibilityStateHandlerMap[visibility]
    handler()
  }, [timer, setIsPaused, visibility])

  return isPaused
}

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

export const useResumedGame = (url: string): SavedGame => {
  const gameData = useMemo(() => loadGame(url), [url])

  return gameData
}

export const useSavedGameList = () => {
  const defaultList = useMemo<SavedGames>(() => [], [])
  const list = useStorage<SavedGames>(LocalStorage.SavedGames, defaultList)
  return list
}

// This tries to dynamically save portions of a game as they occure instead of just saving a game
// when the page isn't visible.
export const useSaveGame = () => {
  const [gameFinishCalled, setGameFinishCalled] = useState(false)
  const gamePath = useGamePath()
  useSaveBoard()
  useSaveGameRuleset()
  useSaveScore()
  const saveTimeIntervalRef = useSaveTime()
  useSaveLanguageMetadata()
  useSaveGuesses()

  const score = useContext(Score)

  useEffect(() => {
    if (gameFinishCalled) return
    if (keyIsInvalid(gamePath)) return
    if (!score?.foundWords?.length && !score?.remainingWords?.length) return
    addGameToSavedGames(gamePath)
  }, [score, gameFinishCalled, gamePath])

  const onGameFinishCallback = useCallback(() => {
    if (saveTimeIntervalRef.current) {
      clearInterval(saveTimeIntervalRef.current)
      saveTimeIntervalRef.current = undefined
    }
    setGameFinishCalled(true)
    clearSaveGameData(gamePath)
    removeGameFromSavedGames(gamePath)
  }, [gamePath, saveTimeIntervalRef, setGameFinishCalled])
  return onGameFinishCallback
}

