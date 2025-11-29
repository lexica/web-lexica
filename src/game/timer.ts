import { sum, toSeconds, normalize } from 'duration-fns'
import type { Duration } from 'duration-fns'
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState
} from 'react'
import type  { Reducer } from 'react'
import { logger } from '../util/logger'

type TimerState = {
  remainingTime: number,
  isPaused: boolean,
  startTime: Date,
}

const TimerAction = {
  Pause: 'pause',
  Resume: 'resume',
  AddTime: 'add-time',
  Reset: 'reset',
} as const

type TimerActionType = typeof TimerAction[keyof typeof TimerAction]

type TimerReducerAction = {
  type: TimerActionType,
  info: Date | Duration
}

const TIMER_INTERVAL = 400

export const secondsBetweenDates = (start: Date, end: Date) => Math.round((end.getTime() - start.getTime()) / 1000)

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

const handleResetTime = (state: TimerState, time: Duration) => {
  const remainingTime = toSeconds(time)
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
    case TimerAction.Reset:
      return handleResetTime(state, action.info as Duration)
    default:
      throw new Error(`${action.type} has not been implemented yet`)
  }
}

export type UseTimer = {
  startTime: () => void,
  pauseTime: () => void,
  addTime: (time: Duration) => void,
  addTimerEndCallback: (callback: () => void ) => void,
  removeTimerEndCallback: (callback: () => void) => void,
  getRemainingTime: () => number,
  state: TimerState
}

const getIntervalCallback = (state: TimerState, intervalRef: React.MutableRefObject<number | undefined>, timeEndCallbacks: (() => void)[]) => {
  // const id = uuid()
  return () => {
    if (state.isPaused) {
      intervalRef.current && clearInterval(intervalRef.current)
      intervalRef.current = undefined
      return
    }

    const remainingTime = state.remainingTime - secondsBetweenDates(state.startTime, new Date())
    // logger.debug(`timer interval running... remaining time: ${remainingTime}`, { id })
    if (remainingTime <= 0) {
      timeEndCallbacks.forEach(cb => cb())
      while (timeEndCallbacks.length) {
        timeEndCallbacks.pop()
      }
      intervalRef.current && clearInterval(intervalRef.current)
      intervalRef.current = undefined
    }
  }
}

export const useTimer = (totalTimeInSeconds: number): UseTimer => {
  const [state, dispatch] = useReducer<Reducer<TimerState, TimerReducerAction>>(timerReducer, {
    remainingTime: totalTimeInSeconds,
    isPaused: true,
    startTime: new Date()
  })
  const [callbacks, setCallbacks] = useState<(() => void)[]>([])

  const addTimerEndCallback = useCallback((callback: () => void) => setCallbacks(callbacks => {
    if (callbacks.includes(callback)) return callbacks
    callbacks.push(callback)
    return callbacks
  }), [setCallbacks])
  const removeTimerEndCallback = useCallback((callback: () => void) => setCallbacks(callbacks => {
    const callbackIndex = callbacks.indexOf(callback)
    if (callbackIndex < 0) return callbacks
    callbacks.splice(callbackIndex, 1)
    return callbacks
  }), [setCallbacks])
  // const memoizedTimeEndCallback = useCallback(timeEndCallback, [timeEndCallback])

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

  const intervalRef = useRef<number | undefined>(undefined)
  const remainingTimeRef = useRef(totalTimeInSeconds)

  useEffect(() => {
    logger.debug(`running useTimer reset totalTimeInSeconds useEffect... new time: ${totalTimeInSeconds}`)
    const duration = normalize({ seconds: totalTimeInSeconds })
    dispatch({ type: TimerAction.Reset, info: duration })
  }, [totalTimeInSeconds, dispatch])

  useEffect(() => {
    if (state.remainingTime === remainingTimeRef.current) return

    const actualRemainingTime = state.remainingTime - secondsBetweenDates(state.startTime, new Date())
    if (actualRemainingTime <= 0) return

    logger.debug('timer addTime useEffect running...', { actualRemainingTime, remainingTimeRef: remainingTimeRef.current, stateRemainingTime: state.remainingTime })
    remainingTimeRef.current = state.remainingTime

    intervalRef.current && clearInterval(intervalRef.current)
    intervalRef.current = setInterval(getIntervalCallback(state, intervalRef, callbacks), TIMER_INTERVAL)
  }, [state, intervalRef, remainingTimeRef, callbacks])

  useEffect(() => {
    const remainingTime = state.remainingTime - secondsBetweenDates(state.startTime, new Date())
    const shouldSetInterval = !state.isPaused
      && intervalRef.current === undefined
      && remainingTime > 0

    logger.debug('timer useEffect setInterval running...', JSON.stringify({ remainingTime, shouldSetInterval, state }))
    if (shouldSetInterval) {
      intervalRef.current = setInterval(getIntervalCallback(state, intervalRef, callbacks), TIMER_INTERVAL)
    }

    // interval cleanup
    return () => { intervalRef.current && clearInterval(intervalRef.current) }
  }, [intervalRef, state, callbacks])

  return useMemo(
    () => ({
      startTime,
      pauseTime,
      getRemainingTime,
      addTimerEndCallback,
      removeTimerEndCallback,
      addTime,
      state
      }),
    [startTime,
    pauseTime,
    getRemainingTime,
    addTime,
    state,
    addTimerEndCallback,
    removeTimerEndCallback
    ]
  )
}

export type TimerContext = UseTimer

export const Timer = createContext<TimerContext>({
  startTime: () => {},
  pauseTime: () => {},
  addTime: (_: Duration) => {},
  addTimerEndCallback: (_: any) => undefined,
  removeTimerEndCallback: (_: any) => undefined,
  getRemainingTime: () => 0,
  state: {
    isPaused: true,
    startTime: new Date(),
    remainingTime: 0
  }
})
