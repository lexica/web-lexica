import { Reducer, useEffect, useReducer, useRef } from 'react'
import { normalize } from 'duration-fns'

import { scoreWord } from '.'
import { Ruleset } from './rules'
import { ScoreContext, ScoreType } from './score'
import { TimerContext } from './timer'
import { logger } from '../util/logger'

const TIME_MULTIPLIER = 10

enum FoundWordCountAction {
  Add = 'add',
  Reset = 'reset'
}

const foundWordCountReducer = (state: number, action: FoundWordCountAction) => {
  logger.debug({ action, state })
  switch (action) {
    case FoundWordCountAction.Add:
      return state + 1
    case FoundWordCountAction.Reset:
      return 0
    default:
      return state
  }
}

export const useTimeAttack = (rules: Ruleset, timer: TimerContext, score: ScoreContext) => {
  // const [foundWordCount, dispatch] = useReducer<Reducer<number, FoundWordCountAction>>(foundWordCountReducer, 0)
  const foundWordCountRef = useRef(0)
  useEffect(() => {
    logger.debug('running useTimeAttack useEffect...', { foundWordLength: score.foundWords.length, count: foundWordCountRef.current })
    if (rules.timeAttack !== true) return

    const lastWordFound = score.foundWords[score.foundWords.length - 1]
    if (foundWordCountRef.current === score.foundWords.length) return


    logger.debug('adding time...', { foundWordLength: score.foundWords.length, count: foundWordCountRef.current })

    // if (foundWordCount > 0 && score.foundWords.length === 0) {
    //   logger.debug('useTimeAttack: Force resetting...')
    //   dispatch(FoundWordCountAction.Reset)
    //   return
    // }


    foundWordCountRef.current += 1
    const timeToAdd = normalize({ seconds: scoreWord(lastWordFound, ScoreType.Words, {}) * TIME_MULTIPLIER })

    timer.addTime(timeToAdd)
  }, [rules, score, timer, foundWordCountRef])
}
