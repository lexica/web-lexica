import {
  createContext,
  Reducer,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef
} from 'react'
import { logger } from '../util/logger'

type TimerState = {
  remainingTime: number,
  isPaused: boolean,
  startTime: Date,
}

enum TimerAction {
  Pause = 'pause',
  Resume = 'resume'
}

type TimerReducerAction = {
  type: TimerAction,
  info: Date
}

const secondsBetweenDates = (start: Date, end: Date) => Math.round((end.getTime() - start.getTime()) / 1000)

const handlePause = (state: TimerState, pauseTime: Date) => {
  const { isPaused, remainingTime, startTime } = state
  if (isPaused) return state

  return {
    ...state,
    isPaused: true,
    remainingTime: remainingTime - secondsBetweenDates(startTime, pauseTime)
  }
}

const handleResume = (state: TimerState, resumeTime: Date) => {
  const { isPaused } = state
  if (!isPaused) return state

  return {
    ...state,
    startTime: resumeTime,
    isPaused: false
  }
}

const timerReducer = (state: TimerState, action: TimerReducerAction) => {
  logger.debug('running timer reducer', JSON.stringify({ action }))
  switch (action.type) {
    case TimerAction.Pause:
      return handlePause(state, action.info)
    case TimerAction.Resume:
      return handleResume(state, action.info)
    default:
      throw new Error(`${action.type} has not been implemented yet`)
  }
}

export type UseTimer = {
  startTime: () => void,
  pauseTime: () => void,
  getRemainingTime: () => number
}

export const useTimer = (totalTimeInSeconds: number, timeEndCallback: () => void): UseTimer => {
  const [state, dispatch] = useReducer<Reducer<TimerState, TimerReducerAction>>(timerReducer, {
    remainingTime: totalTimeInSeconds,
    isPaused: true,
    startTime: new Date()
  })

  const memoizedTimeEndCallback = useCallback(timeEndCallback, [timeEndCallback])

  const startTime = useCallback(() => {
    dispatch({ type: TimerAction.Resume, info: new Date() })
  }, [dispatch])
  const pauseTime = useCallback(() => {
    dispatch({ type: TimerAction.Pause, info: new Date() })
  }, [dispatch])

  const getRemainingTime = useCallback(() => state.remainingTime - secondsBetweenDates(state.startTime, new Date()), [state])

  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined)

  useEffect(() => {
    const remainingTime = state.remainingTime - secondsBetweenDates(state.startTime, new Date())
    const shouldSetInterval = !state.isPaused
      && intervalRef.current === undefined
      && remainingTime > 0

    logger.debug('timer useEffect setInterval running...', JSON.stringify({ remainingTime, shouldSetInterval, state }))
    if (shouldSetInterval) {
      intervalRef.current = setInterval(() => {
        if (state.isPaused) {
          intervalRef.current && clearInterval(intervalRef.current)
          intervalRef.current = undefined
          return
        }

        const remainingTime = state.remainingTime - secondsBetweenDates(state.startTime, new Date())
        logger.debug(`timer interval running... remaining time: ${remainingTime}`)
        if (remainingTime <= 0) {
          memoizedTimeEndCallback()
          intervalRef.current && clearInterval(intervalRef.current)
          intervalRef.current = undefined
        }

      }, 400)
    }

    // interval cleanup
    return () => intervalRef.current && clearInterval(intervalRef.current)
  }, [intervalRef, state, memoizedTimeEndCallback])

  return useMemo(() => ({ startTime, pauseTime, getRemainingTime }), [startTime, pauseTime, getRemainingTime])
}

export type TimerContext = UseTimer

export const Timer = createContext<TimerContext>({
  startTime: () => {},
  pauseTime: () => {},
  getRemainingTime: () => 0
})
