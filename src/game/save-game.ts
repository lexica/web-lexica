import { DurationInput, normalize } from 'duration-fns'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { v4 as uuid } from 'uuid'

import { GuessContext } from './guess'
import { LanguageContext, MetadataV1 } from './language'
import { Ruleset } from './rules'
import { ScoreContext, ScoreType } from './score'
import { TimerContext } from './timer'
import { logger } from '../util/logger'
import { storage, useStorage } from '../util/storage'
import { splice } from '../util/splice'

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

export type SavedGames = {
  gameId: string,
  url: string
}[]

export type SavedGame = {
  board: string[],
  rules: Ruleset,
  languageMetadata: MetadataV1,
  remainingTime: DurationInput,
  gameUrl: string,
  guesses: string[],
  foundWords: string[],
  remainingWords: string[]
}

const getSavedGameList = () => storage.getWithDefault({
  key: LocalStorage.SavedGames,
  defaultValue: [] as SavedGames
})

const removeIdFromSavedGames = (id: string) => {
  const list = getSavedGameList()

  const index = list.findIndex(({ gameId }) => gameId === id)
  if (index < 0) return

  const listWithoutGame = splice(list, index, 1)

  storage.set(LocalStorage.SavedGames, listWithoutGame )
}

const removeGameFromStorage = (id: string) => storage.remove(id)

const removeGame = (id: string) => {
  removeIdFromSavedGames(id)
  removeGameFromStorage(id)
}

const addGameToSavedGames = (id: string, url: string) => {
  const list = getSavedGameList()

  if (list.find(({ gameId }) => gameId === id)) return

  storage.set(LocalStorage.SavedGames, [...list, { gameId: id, url }])
}

const saveGame = (id: string, game: SavedGame) => {
  storage.set(id, game)

  addGameToSavedGames(id, game.gameUrl)
}

export const getSavedGamesWithUrl = (gameUrl: string) => {
  const list = getSavedGameList()

  return list.filter(({ url }) => gameUrl === url)
}

export const useSaveGameOnBlur = ({
  board,
  rules,
  language,
  score,
  guess,
  timer,
  url
}: UseSaveGameOnBlurArguments) => {
  const [isPaused, setIsPaused] = useState(false)
  const [gameId] = useState(uuid())

  const saveGameCallback = useCallback(() => {
    logger.debug('saving game')
    saveGame(gameId, {
      board,
      rules,
      languageMetadata: language.metadata,
      remainingTime: normalize({ seconds: timer.getRemainingTime() }),
      gameUrl: url,
      guesses: guess.guesses,
      ...score
    } as SavedGame)

    setIsPaused(true)
    timer.pauseTime()

  }, [
    board,
    rules,
    language,
    score,
    guess,
    timer,
    url,
    setIsPaused,
    gameId
  ])

  useEffect(() => {
    logger.debug('running useSaveGameOnBlur useEffect...')
    const focusCallback = () => {
      timer.startTime()
      setIsPaused(false)
      removeGame(gameId)
    }

    window.addEventListener('blur', saveGameCallback)
    window.addEventListener('focus', focusCallback)
    return () => {
      logger.debug('running cleanup for useSaveGameOnBlur')
      window.removeEventListener('blur', saveGameCallback)
      window.removeEventListener('focus', focusCallback)
    }
  }, [saveGameCallback, timer, setIsPaused, gameId])

  return isPaused
}

const defaultGame: SavedGame = {
  board: [],
  foundWords: [],
  gameUrl: '',
  guesses: [],
  languageMetadata: {
    definitionUrl: '',
    isBeta: true,
    letterProbabilities: {},
    letterScores: {},
    locale: '',
    name: ''
  },
  remainingTime: { seconds: 0 },
  remainingWords: [],
  rules: {
    boardWidth: 0,
    minimumWordLength: 0,
    name: '',
    score: ScoreType.Length,
    time: normalize({ seconds: 0 }),
    timeAttack: 0
  }
}

export const useSavedGame = (id: string): SavedGame => {
  const game = useMemo(() => storage.get<SavedGame>({ key: id }), [id])
  removeGame(id)
  return game || defaultGame
}

export const useSavedGameList = () => {
  const list = useStorage<SavedGames>(LocalStorage.SavedGames, [])
  return list
}

