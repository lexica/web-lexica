import type { GuessContext } from "../guess"
import type { LanguageContext, MetadataV1 } from "../language"
import type { RulesContext, Ruleset } from "../rules"
import type { ScoreContext, ScoreState } from "../score"
import type { TimerContext } from "../timer"


export type UseSaveGameOnBlurArguments = {
  board: string[],
  rules: Ruleset,
  language: LanguageContext,
  score: ScoreContext,
  guess: GuessContext,
  timer: TimerContext,
  url: string
}

export const LocalStorage = {
  SavedGames : 'saved-games'
} as const

export const GameLocalStorage = {
  Score: 'score',
  Timer: 'timer',
  Guesses: 'guesses',
  Board: 'board',
  Rules: 'rules',
  Language: 'language'
} as const

export type GameLocalStorageType = typeof GameLocalStorage[keyof typeof GameLocalStorage]

export const gameLocalStorage = [
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

export type UseSaveGameState = {
  onGameFinishCallback: () => void
}
