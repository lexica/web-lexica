import { toSeconds } from 'duration-fns'
import { useContext, useEffect, useMemo, useReducer, useState } from 'react'
import { LetterScores, LetterScoresContext, scoreWord } from '.'
import { logger } from '../util/logger'
import { storage, useStorage } from '../util/storage'
import { Rules, RulesContext, Ruleset, Rulesets, useRulesets } from './rules'
import { Score, ScoreContext } from './score'

export enum LocalStorage {
  HighScores = 'high-scores'
}

export type HighScores = { [key: string]: number }

export const getHighScores = () => storage.getWithDefault<HighScores>({ key: LocalStorage.HighScores, defaultValue: {} })


export const getHighScore = (id: string) => {
  const scores = getHighScores()
  if (scores[id]) return scores[id]

  return 0
}

export const setHighScore = (id: string, score: number) => {
  const scores = getHighScores()
  storage.set(LocalStorage.HighScores, { ...scores, [id]: score })
}

const rulesetsAreEquivalent = (a: Ruleset, b: Ruleset) => {
  return a.boardWidth === b.boardWidth
    && a.minimumWordLength === b.minimumWordLength
    && a.score === b.score
    && toSeconds(a.time) === toSeconds(b.time)
    && a.timeAttack === b.timeAttack
}

const findRulesetId = (rulesets: Rulesets, rules: Ruleset) => {
  const keys = Object.keys(rulesets)
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    const toCompare = rulesets[key]
    logger.debug('comparing rulesets', { toCompare, compareAgainst: rules })
    if (rulesetsAreEquivalent(toCompare, rules)) return key
  }
}

const useMemoizedComputedScore = (score: ScoreContext, rules: RulesContext, letterScores: LetterScoresContext) => {
  const [scoredWords, setScoredWords] = useState(0)
  const [computedScore, dispatchComputedScore] = useReducer((state: number, action: number) => state + action, 0)

  useEffect(() => {
    if (scoredWords === score.foundWords.length) return
    let additionalScore = 0
    for (let i = scoredWords; i < score.foundWords.length; i++) {
      additionalScore += scoreWord(score.foundWords[i], rules.score, letterScores)
    }

    dispatchComputedScore(additionalScore)
    setScoredWords(score.foundWords.length)
  }, [scoredWords, setScoredWords, dispatchComputedScore, score, letterScores, rules])

  return computedScore
}

export const useHighScore = (id: string) => {
  const highScores = useStorage(LocalStorage.HighScores, {} as HighScores)
  if (highScores[id] !== undefined) return highScores[id]

  return 0
}

export const useUpdateHighScore = () => {
  const rules = useContext(Rules)
  const score = useContext(Score)
  const rulesets = useRulesets()
  const letterScores = useContext(LetterScores)

  const currentId = useMemo(() => findRulesetId(rulesets, rules), [rulesets, rules])

  const computedScore = useMemoizedComputedScore(score, rules, letterScores)

  useEffect(() => {
    logger.debug('running useUpdateHighScore useEffect...')
    if (!currentId) {
      logger.debug('no ruleset id... early exit')
      return
    }
    const lastHighScore = getHighScore(currentId)
    if (lastHighScore < computedScore)
      setHighScore(currentId, computedScore)
  }, [computedScore, currentId])

  return currentId ? getHighScore(currentId) : 0
}
