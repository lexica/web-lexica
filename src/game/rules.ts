import { createContext, useEffect, useMemo, useState } from 'react'
import * as R from 'ramda'
import { Duration, normalize } from 'duration-fns'
import { v4 as uuid } from 'uuid'

import { ScoreType } from './score'
import { useGameUrlParameters } from './url'
import { GameStorage, useStorage } from '../util/storage'

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
  Sprint = 'sprint',
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
  const rulesets = rulesetStorage.get()
  rulesetStorage.set({
    ...rulesets,
    [uuid()]: ruleset
  })
}

export const setCurrentRuleset = (id: string) => {
  currentRulesetIdStorage.set(id)
}

export const useRulesFromStorage = (): [context: RulesContext, id: string] => {
  const id = useStorage(LocalStorage.CurrentRulesetId, DefaultRulesets.Sprint as string, R.identity)

  const [ruleset, setRuleset] = useState(getRuleset(id))

  useEffect(() => {
    setRuleset(getRuleset(id))
  }, [setRuleset, id])


  return [ruleset, id]
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

export const useRulesets = (): Rulesets => {
  const rulesets = useStorage(LocalStorage.Rulesets, defaultRulesets)
  return rulesets
}

export const Rules = createContext<RulesContext>(getRuleset(DefaultRulesets.Sprint))
