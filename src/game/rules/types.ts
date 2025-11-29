import type { Duration } from 'duration-fns'
import type { ScoreTypeType } from '../score'

export type RulesContext = {
  minimumWordLength: number,
  time: Duration,
  score: ScoreTypeType,
  boardWidth: number,
  name: string
  timeAttack?: number
}

export type Ruleset = RulesContext & { name: string, boardWidth: number }

export type Rulesets = {
  [key: string]: Ruleset
} & {
  [P in DefaultRulesetsType]: Ruleset
}

export const LocalStorage = {
  CurrentRulesetId: 'current-rule-set',
  Rulesets: 'rulesets',
  DefaultRulesets: 'default-rulesets'
} as const

export type LocalStorageType = typeof LocalStorage[keyof typeof LocalStorage]

export const DefaultRulesets = {
  Sprint: 'sprint',
  Marathon: 'marathon',
  LetterPoints: 'letter-points',
  TimeAttack: 'time-attack'
} as const

export type DefaultRulesetsType = typeof DefaultRulesets[keyof typeof DefaultRulesets]
