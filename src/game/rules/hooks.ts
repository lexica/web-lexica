import { createContext, useEffect, useMemo, useState } from 'react'
import { normalize } from 'duration-fns'
import * as R from 'ramda'

import { DefaultRulesets, LocalStorage } from './types.ts'
import type { RulesContext, Rulesets } from './types.ts'
import { defaultRulesets, getRuleset } from './util'

import { useGameUrlParameters } from '../url'
import { useStorage } from '../../util/storage'

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
      name: 'Shared with you',
      timeAttack: params.timeAttack
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

export const SavedRulesets = createContext<Rulesets>(defaultRulesets)
