import * as R from 'ramda'

import { Dictionary, DictionaryContext, DictionaryState } from '../game/dictionary'
import { Guess, GuessContext, GuessDispatch, GuessDispatchContext, GuessState } from '../game/guess'
import { Language, LanguageContext, LanguageState } from '../game/language'
import { Score, ScoreContext, ScoreState } from '../game/score'
import { Timer, TimerContext } from '../game/timer'
import { getBoard } from '../game/board/util'
import { logger } from '../util/logger'
import { LetterScores, LetterScoresContext } from '../game'
import type { WithChildren } from '../util/types'

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends (infer X)[] ? X[] : DeepPartial<T[P]>
}

type RequiredProviderProps = {
  language: LanguageContext,
  dictionary: DictionaryContext,
  guess: GuessContext,
  guessDispatch: GuessDispatchContext,
  score: ScoreContext,
  timer: TimerContext,
  letterScores: LetterScoresContext
}

export type ProvidersProps = {
  language: DeepPartial<LanguageContext>,
  letterScores: LetterScoresContext,
  dictionary: Partial<DictionaryContext>,
  guess: Partial<GuessContext>,
  guessDispatch: Partial<GuessDispatchContext>,
  score: Partial<ScoreContext>
  timer: TimerContext
}

const languageDefaults: LanguageState = {
  dictionary: [],
  error: false,
  loading: true,
  metadata: { definitionUrl: '', isBeta: true, letterProbabilities: {}, letterScores: {}, locale: '', name: '' }
}
const dictionaryDefaults: DictionaryState = {
  boardDictionary: [],
  loading: true
}
const guessDefaults: GuessState = {
  board: getBoard('aaaabbbbccccdddd'.split('')),
  currentGuess: '',
  isGuessing: false,
  currentLetter: { row: 0, column: 0 },
  guesses: []
}
const scoreDefaults: ScoreState = {
  foundWords: [],
  remainingWords: []
}

const Providers = (props: WithChildren<Partial<ProvidersProps>>) => {
  const { children } = props

  const evolved: Partial<RequiredProviderProps> = R.evolve({
    language: (overrides: DeepPartial<LanguageState>): LanguageState => ({
      ...languageDefaults,
      ...overrides,
      metadata: {
        ...languageDefaults.metadata ,
        ...(overrides.metadata ? overrides.metadata as LanguageState['metadata']: {})
      }
    }),
    dictionary: (overrides: DeepPartial<DictionaryState>): DictionaryState => ({
      ...dictionaryDefaults,
      ...overrides,
    }),
    guess: (overrides: DeepPartial<GuessState>): GuessState => ({
      ...guessDefaults,
      ...overrides as GuessState,
    }),
    guessDispatch: (override: DeepPartial<GuessDispatchContext>): GuessDispatchContext => override as GuessDispatchContext,
    score: (overrides: Partial<ScoreState>): ScoreState => ({
      ...scoreDefaults,
      ...overrides
    }),
  }, props)

  logger.debug(JSON.stringify(R.omit(['children'], evolved)))

  const {
    language,
    dictionary,
    guess,
    guessDispatch,
    score,
    timer,
    letterScores
  } = evolved

  const t = timer ? <Timer.Provider children={children} value={timer}/> : children
  const s = score ? <Score.Provider children={t} value={score}/> : t
  const gd = guessDispatch ? <GuessDispatch.Provider children={s} value={guessDispatch}/> : s
  const g = guess ? <Guess.Provider children={gd} value={guess}/> : gd
  const d = dictionary ? <Dictionary.Provider children={g} value={dictionary}/> : g
  const ls = letterScores ? <LetterScores.Provider children={d} value={letterScores}/> : d
  const l = language ? <Language.Provider children={ls} value={language}/> : ls


  return <>{l}</>
}

export default Providers
