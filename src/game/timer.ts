import { Duration, sum, toSeconds } from 'duration-fns'
import {v4 as uuid } from 'uuid'
import React, {
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
  Resume = 'resume',
  AddTime = 'add-time'
}

type TimerReducerAction = {
  type: TimerAction,
  info: Date | Duration
}

const TIMER_INTERVAL = 400

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

const handleAddTime = (state: TimerState, time: Duration) => {
  const { remainingTime: oldRemainingTime } = state
  const remainingTime = toSeconds(sum({ seconds: oldRemainingTime }, time))
  return {
    ...state,
    remainingTime
  }
}

const timerReducer = (state: TimerState, action: TimerReducerAction) => {
  logger.debug('running timer reducer', JSON.stringify({ action }))
  switch (action.type) {
    case TimerAction.Pause:
      return handlePause(state, action.info as Date)
    case TimerAction.Resume:
      return handleResume(state, action.info as Date)
    case TimerAction.AddTime:
      return handleAddTime(state, action.info as Duration)
    default:
      throw new Error(`${action.type} has not been implemented yet`)
  }
}

export type UseTimer = {
  startTime: () => void,
  pauseTime: () => void,
  addTime: (time: Duration) => void,
  getRemainingTime: () => number
}

const getIntervalCallback = (state: TimerState, intervalRef: React.MutableRefObject<NodeJS.Timeout | undefined>, timeEndCallback: () => void) => {
  const id = uuid()
  return () => {
    if (state.isPaused) {
      intervalRef.current && clearInterval(intervalRef.current)
      intervalRef.current = undefined
      return
    }

    const remainingTime = state.remainingTime - secondsBetweenDates(state.startTime, new Date())
    // logger.debug(`timer interval running... remaining time: ${remainingTime}`, { id })
    if (remainingTime <= 0) {
      timeEndCallback()
      intervalRef.current && clearInterval(intervalRef.current)
      intervalRef.current = undefined
    }
  }
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
  const addTime = useCallback((time: Duration) => {
    dispatch({ type: TimerAction.AddTime, info: time })
  }, [dispatch])

  const getRemainingTime = useCallback(() => state.remainingTime - secondsBetweenDates(state.startTime, new Date()), [state])

  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const remainingTimeRef = useRef(totalTimeInSeconds)

  useEffect(() => {
    if (state.remainingTime === remainingTimeRef.current) return

    const actualRemainingTime = state.remainingTime - secondsBetweenDates(state.startTime, new Date())
    if (actualRemainingTime <= 0) return

    logger.debug('timer addTime useEffect running...', { actualRemainingTime, remainingTimeRef: remainingTimeRef.current, stateRemainingTime: state.remainingTime })
    remainingTimeRef.current = state.remainingTime

    intervalRef.current && clearInterval(intervalRef.current)
    intervalRef.current = setInterval(getIntervalCallback(state, intervalRef, memoizedTimeEndCallback), TIMER_INTERVAL)
  }, [state, intervalRef, remainingTimeRef, memoizedTimeEndCallback])

  useEffect(() => {
    const remainingTime = state.remainingTime - secondsBetweenDates(state.startTime, new Date())
    const shouldSetInterval = !state.isPaused
      && intervalRef.current === undefined
      && remainingTime > 0

    logger.debug('timer useEffect setInterval running...', JSON.stringify({ remainingTime, shouldSetInterval, state }))
    if (shouldSetInterval) {
      intervalRef.current = setInterval(getIntervalCallback(state, intervalRef, memoizedTimeEndCallback), TIMER_INTERVAL)
    }

    // interval cleanup
    return () => intervalRef.current && clearInterval(intervalRef.current)
  }, [intervalRef, state, memoizedTimeEndCallback])

  return useMemo(
    () => ({ startTime, pauseTime, getRemainingTime, addTime }),
    [startTime, pauseTime, getRemainingTime, addTime]
  )
}

export type TimerContext = UseTimer

export const Timer = createContext<TimerContext>({
  startTime: () => {},
  pauseTime: () => {},
  addTime: (_: Duration) => {},
  getRemainingTime: () => 0
})
