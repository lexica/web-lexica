import { useContext, useEffect, useMemo, useRef, useState } from "react"
import { stringArraysAreEqual } from "../../util"
import { logger } from "../../util/logger"
import { storage, useStorage } from "../../util/storage"
import { isValidGamePath, parseURLSearch, useGamePath } from "../../util/url"
import { Board } from "../board/hooks"
import { getB64DelimitedURLBoard } from "../board/util"
import { Guess } from "../guess"
import { Language } from "../language"
import { Rules } from "../rules"
import { Score } from "../score"
import { Timer } from "../timer"
import { encodeBoard, GameParamMap } from "../url"
import type { GameURLParams } from "../url"
import { GameLocalStorage, LocalStorage } from "./types"
import type { GameLocalStorageType } from "./types"
import { getGameLocalStorageKey } from "./util"

const useLocalStorageKey = (storageKey: GameLocalStorageType) => getGameLocalStorageKey(useGamePath(), storageKey)

export const useSavedGames = () => {
  const memoizedDefault = useMemo<string[]>(() => [], [])
  const savedGames = useStorage(LocalStorage.SavedGames, memoizedDefault)

  return savedGames
}

const shouldSaveGameData = (gamePath: string, savedGames: string[], board: string[]) => {
  if (!isValidGamePath(gamePath)) return false 
  if (!savedGames.includes(gamePath)) return false
  const params = parseURLSearch<GameURLParams>(gamePath.replace(/^.*\?/, ''))
  const urlBoard = getB64DelimitedURLBoard({ board: params[GameParamMap.Board], delimiter: ',' })
  if (!stringArraysAreEqual(board, urlBoard)) return false

  return true
}

const useSaveGameWriteGuard = () => {
  const gamePath = useGamePath()
  const savedGames = useSavedGames()
  const board = useContext(Board)
  const [writeEnabled, setWriteEnabled] = useState(shouldSaveGameData(gamePath, savedGames, board))

  useEffect(() => {
    const writeEnabled = shouldSaveGameData(gamePath, savedGames, board)
    logger.debug(`Running useSaveGameWriteGuard useEffect... writeEnabled: ${writeEnabled}`, gamePath, savedGames)
    setWriteEnabled(writeEnabled)
  }, [gamePath, savedGames, board])

  return writeEnabled
}

export const useSaveLanguageMetadata = (): void => {
  const key = useLocalStorageKey(GameLocalStorage.Language)
  const shouldWrite = useSaveGameWriteGuard()
  const languageState = useContext(Language)

  useEffect(() => {
    if (!shouldWrite) return
    storage.set(key, languageState.metadata)
  }, [languageState, shouldWrite, key])
}

export const useSaveTime = () => {
  const key = useLocalStorageKey(GameLocalStorage.Timer)
  const shouldWrite = useSaveGameWriteGuard()
  const { getRemainingTime, state: { isPaused } } = useContext(Timer)
  const intervalRef = useRef<undefined | number>()
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = undefined
    }
    if (isPaused) return
    if (!shouldWrite) return
    
    const storeTime = () => {
      const remainingSeconds = Math.max(getRemainingTime(), 0)
      if (remainingSeconds === 0) return
      storage.set(key, remainingSeconds)
    }

    intervalRef.current = setInterval(storeTime, 1000) as any as number

    return () => {
      storeTime()
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = undefined
      }
    }
  }, [shouldWrite, key, getRemainingTime, isPaused, intervalRef])
  return intervalRef
}

export const useSaveGuesses = (): void => {
  const key = useLocalStorageKey(GameLocalStorage.Guesses)
  const shouldWrite = useSaveGameWriteGuard()

  const guessState = useContext(Guess)

  const guessCount = useRef(guessState?.guesses?.length || 0)

  useEffect(() => {
    if (!shouldWrite) return
    const length = guessState?.guesses?.length || 0
    if (guessCount.current === length) return
    guessCount.current = length

    storage.set(key, guessState.guesses)
  }, [shouldWrite, key, guessState, guessCount])
}

export const useSaveBoard = () => {
  const board = useContext(Board)
  const key = useLocalStorageKey(GameLocalStorage.Board)
  const shouldWrite = useSaveGameWriteGuard()

  useEffect(() => {
    if (!shouldWrite) return
    if (!board?.length) return
    const encodedBoard = encodeBoard(board)
    storage.set(key, encodedBoard)
  }, [shouldWrite, key, board])
}

export const useSaveScore = (): void => {
  const scoreState = useContext(Score)
  const key = useLocalStorageKey(GameLocalStorage.Score)
  const shouldWrite = useSaveGameWriteGuard()

  useEffect(() => {
    if (!shouldWrite) return
    if (!scoreState?.remainingWords?.length) return
    storage.set(key, scoreState)
  }, [shouldWrite, key, scoreState])
}

export const useSaveGameRuleset = (): void => {
  const rules = useContext(Rules)
  const key = useLocalStorageKey(GameLocalStorage.Rules)
  const shouldWrite = useSaveGameWriteGuard()

  useEffect(() => {
    if (!shouldWrite) return
    if (!rules.time) return
    storage.set(key, rules)
  }, [shouldWrite, key, rules])
}
