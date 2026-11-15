import type { Duration } from 'duration-fns'
import type { ScoreTypeType } from '../score'

export const HintTypeMap = {
  Color: 'c',
  Number: 'n',
} as const

export type HintType = typeof HintTypeMap[keyof typeof HintTypeMap]

export type RulesContext = {
  minimumWordLength: number,
  time: Duration,
  score: ScoreTypeType,
  boardWidth: number,
  name: string
  timeAttack?: number
  hints?: HintType[]
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
