import { useEffect, useRef } from 'react'
import { normalize } from 'duration-fns'

import { scoreWord } from '.'
import { Ruleset } from './rules'
import { ScoreContext, ScoreType } from './score'
import { TimerContext } from './timer'
import { logger } from '../util/logger'

const TIME_MULTIPLIER = 5

export const useTimeAttack = (rules: Ruleset, timer: TimerContext, score: ScoreContext) => {
  // const [foundWordCount, dispatch] = useReducer<Reducer<number, FoundWordCountAction>>(foundWordCountReducer, 0)
  const foundWordCountRef = useRef(0)
  useEffect(() => {
    logger.debug('running useTimeAttack useEffect...', { foundWordLength: score.foundWords.length, count: foundWordCountRef.current })
    if (rules.timeAttack !== true || score.foundWords.length === 0) return

    const lastWordFound = score.foundWords[score.foundWords.length - 1]
    if (foundWordCountRef.current === score.foundWords.length) return


    logger.debug('adding time...', { foundWordLength: score.foundWords.length, count: foundWordCountRef.current })


    foundWordCountRef.current += 1
    const timeToAdd = normalize({ seconds: scoreWord(lastWordFound, ScoreType.Words, {}) * TIME_MULTIPLIER })

    timer.addTime(timeToAdd)
  }, [rules, score, timer, foundWordCountRef])
}
