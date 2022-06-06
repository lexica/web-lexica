import { Duration, toSeconds } from 'duration-fns'
import * as R from 'ramda'
import { v4 as uuid } from 'uuid'

import { DefaultRulesets, LocalStorage, Ruleset, Rulesets } from './types'
import { ScoreType } from '../score'
import { GameStorage } from '../../util/storage'

export const defaultRulesets: { [P in DefaultRulesets]: Ruleset } = {
  [DefaultRulesets.Sprint]: {
    name: 'Sprint',
    time: { minutes: 3 } as Duration,
    boardWidth: 4,
    score: ScoreType.Length,
    minimumWordLength: 3
  },
  [DefaultRulesets.Marathon]: {
    name: 'Marathon',
    time: { minutes: 30 } as Duration,
    boardWidth: 6,
    score: ScoreType.Length,
    minimumWordLength: 5
  },
  [DefaultRulesets.LetterPoints]: {
    name: 'Letter Points',
    time: { minutes: 3 } as Duration,
    boardWidth: 5,
    score: ScoreType.Letters,
    minimumWordLength: 4
  },
  [DefaultRulesets.TimeAttack]: {
    name: 'Time Attack',
    time: { minutes: 1 } as Duration,
    boardWidth: 6,
    score: ScoreType.Length,
    minimumWordLength: 3,
    timeAttack: 2
  }
}

const rulesetStorage = new GameStorage<Rulesets>({
  key: LocalStorage.Rulesets,
  initialValueIfNull: defaultRulesets
})

const currentRulesetIdStorage = new GameStorage<string>({
  key: LocalStorage.CurrentRulesetId,
  initialValueIfNull: DefaultRulesets.Sprint,
  serializer: R.identity,
  parser: R.identity
})

export const getRulesets = (): Rulesets => {
  return rulesetStorage.get()
}

export const getRuleset = (id: string): Ruleset => {
  const rulesets = getRulesets()
  return rulesets[id]
}

export const addRuleset = (ruleset: Ruleset) => {
  const id = uuid()
  const rulesets = rulesetStorage.get()
  rulesetStorage.set({
    ...rulesets,
    [id]: ruleset
  })
  return id
}

export const setCurrentRuleset = (id: string) => {
  currentRulesetIdStorage.set(id)
}

const rulesetsAreEquivalent = (a: Ruleset, b: Ruleset) => {
  return a.boardWidth === b.boardWidth
    && a.minimumWordLength === b.minimumWordLength
    && a.score === b.score
    && toSeconds(a.time) === toSeconds(b.time)
    && a.timeAttack === b.timeAttack
}

export const findRulesetId = (rulesets: Rulesets, rules: Ruleset) => {
  const keys = Object.keys(rulesets)
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    const toCompare = rulesets[key]
    if (rulesetsAreEquivalent(toCompare, rules)) return key
  }
}
