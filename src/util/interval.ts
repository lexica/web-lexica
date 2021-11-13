import { useEffect, useRef, useState } from 'react'
import { v4 as uuid } from 'uuid'

// eslint-disable-next-line import/no-webpack-loader-syntax
import IntervalWorker from 'worker-loader!./interval.worker.ts'

const intervalWorker = window.Worker ? new IntervalWorker() : undefined

export const useInterval = <T extends any>(callback: (...args: any[]) => T, interval: number, initialValue?: T): T/* [T, () => void] */ => {
  const [value, setValue] = useState<T | undefined>(initialValue)
  const intervalIdRef = useRef(uuid())
  const callbackRef = useRef(callback)

  useEffect(() => {
    const messageHandler = ({ data: id }: MessageEvent<string>) => {
      if (id !== intervalIdRef.current) return
      intervalWorker?.postMessage(id)
      setValue(callbackRef.current())
    }

    intervalWorker!.addEventListener('message', messageHandler)

    return () => intervalWorker!.removeEventListener('message', messageHandler)
  }, [callbackRef, intervalIdRef, setValue])

  useEffect(() => {
    intervalIdRef.current = uuid()
    callbackRef.current = callback
    intervalWorker?.postMessage({ id: intervalIdRef.current, interval })
  }, [interval, callback, callbackRef, intervalIdRef])

  // const dispatch = useReducer(intervalReducer, {
  //   intervalReference: setInterval(() => setValue(callback()), interval),
  //   interval,
  //   callback: () => setValue(callback())
  // })[1]

  // const stopInterval = useCallback(() => dispatch('stop'), [dispatch])

  // useEffect(() => {
  //   logger.debug('running useInterval useEffect...')

  //   dispatch({
  //     callback: () => setValue(callback()),
  //     interval,
  //     intervalReference: undefined
  //   })
  // }, [callback, interval, dispatch, setValue])

  return value as T/* [value as T, stopInterval] */
}

