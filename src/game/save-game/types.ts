import { GuessContext } from "../guess"
import { LanguageContext, MetadataV1 } from "../language"
import { RulesContext, Ruleset } from "../rules"
import { ScoreContext, ScoreState } from "../score"
import { TimerContext } from "../timer"


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
