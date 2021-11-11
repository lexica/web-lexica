import { Duration } from 'duration-fns'
import { ScoreType } from '../score'

export type RulesContext = {
  minimumWordLength: number,
  time: Duration,
  score: ScoreType,
  boardWidth: number,
  name: string
  timeAttack?: boolean
}

export type Ruleset = RulesContext & { name: string, boardWidth: number }

export type Rulesets = {
  [key: string]: Ruleset
} & {
  [P in DefaultRulesets]: Ruleset
}

export enum LocalStorage {
  CurrentRulesetId = 'current-rule-set',
  Rulesets = 'rulesets',
  DefaultRulesets = 'default-rulesets'
}

export enum DefaultRulesets {
  Sprint = 'sprint',
  Marathon = 'marathon',
  LetterPoints = 'letter-points'
}
