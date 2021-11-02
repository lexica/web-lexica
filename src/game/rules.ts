import { createContext, useEffect, useMemo, useState } from 'react'
import { Duration, normalize } from 'duration-fns'
import { v4 as uuid } from 'uuid'

import { ScoreType } from './score'
import { useGameUrlParameters } from './url'
import { getUseEffectLocalStorageListener } from '../util/local-storage'

export type RulesContext = {
  minimumWordLength: number,
  time: Duration,
  score: ScoreType,
  boardWidth: number,
  name: string
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
  Sprint = 'sprit',
  Marathon = 'marathon',
  LetterPoints = 'letter-points'
}

const defaultRulesets: { [P in DefaultRulesets]: Ruleset } = {
  [DefaultRulesets.Sprint]: {
    name: 'Sprint',
    time: { minutes: 3 } as Duration,
    boardWidth: 4,
    score: ScoreType.Words,
    minimumWordLength: 3
  },
  [DefaultRulesets.Marathon]: {
    name: 'Marathon',
    time: { minutes: 30 } as Duration,
    boardWidth: 6,
    score: ScoreType.Words,
    minimumWordLength: 5
  },
  [DefaultRulesets.LetterPoints]: {
    name: 'Letter Points',
    time: { minutes: 3 } as Duration,
    boardWidth: 5,
    score: ScoreType.Letters,
    minimumWordLength: 4
  }
}

const seedDefaultRulesets = () => {
  const defaults = JSON.stringify(defaultRulesets)
  localStorage.setItem(LocalStorage.DefaultRulesets, defaults)
  localStorage.setItem(LocalStorage.Rulesets, defaults)
}

export const getRulesets = (): Rulesets => {
  const rulesetsString = localStorage.getItem(LocalStorage.Rulesets)
  if (!rulesetsString) {
    seedDefaultRulesets()
  }
  const rules = rulesetsString ? JSON.parse(rulesetsString) as Rulesets : defaultRulesets
  return rules
}

export const getRuleset = (id: string): Ruleset => {
  const rulesets = getRulesets()
  return rulesets[id]
}

export const addRuleset = (ruleset: Ruleset) => {
  const rulesets = getRulesets()
  const stringified = JSON.stringify({
    ...rulesets,
    [uuid()]: ruleset
  })
  localStorage.setItem(LocalStorage.Rulesets, stringified)
}

export const setCurrentRuleset = (id: string) => {
  const ruleset = getRuleset(id)
  const idToSet = ruleset ? id : DefaultRulesets.Sprint
  localStorage.setItem(LocalStorage.CurrentRulesetId, idToSet)
}

export const useRulesFromStorage = (): RulesContext => {
  const [id, setId] = useState(localStorage.getItem(LocalStorage.CurrentRulesetId) || DefaultRulesets.Sprint)

  useEffect(() => getUseEffectLocalStorageListener(
    LocalStorage.CurrentRulesetId,
    (val: string | null) => setId(val || DefaultRulesets.Sprint)
  ), [setId])

  return useMemo(() => getRuleset(id), [id])
}

export const useRulesFromQueryString = (board: string[]): RulesContext => {
  const params = useGameUrlParameters()

  return useMemo(() => {
    return {
      minimumWordLength: params.minimumWordLength,
      time: normalize({ seconds: params.time }),
      score: params.score,
      boardWidth: Math.floor(Math.sqrt(board.length)),
      name: 'Shared with you'
    } as RulesContext
  }, [params, board])
}

export const useDefaultRules = (): RulesContext => {
  return useMemo(() => getRuleset(DefaultRulesets.Sprint), [])
}

export const Rules = createContext<RulesContext>(getRuleset(DefaultRulesets.Sprint))
