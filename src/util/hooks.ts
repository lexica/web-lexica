import { Reducer, useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { v4 as uuid } from 'uuid'

import { logger } from './logger'

// enum IntervalAction {
//   Reset = 'reset'
// }

type IntervalState = {
  intervalReference: NodeJS.Timeout | undefined,
  callback: (...args: any[]) => void,
  interval: number
}

type IntervalAction = IntervalState

const intervalReducer = (state: IntervalState, action: IntervalAction | string) => {
  state.intervalReference && clearInterval(state.intervalReference)
  if (typeof action === 'string') {
    const newState = { ...state, intervalReference: undefined }
    return newState
  }
  const id = uuid()
  action.intervalReference = setInterval(() => { logger.debug('running interval...', { id }); action.callback() }, action.interval)
  return action
}

export const useInterval = <T extends any>(callback: (...args: any[]) => T, interval: number, initialValue?: T): [T, () => void] => {
  const [value, setValue] = useState<T | undefined>(initialValue)
  const dispatch = useReducer(intervalReducer, {
    intervalReference: setInterval(() => setValue(callback()), interval),
    interval,
    callback: () => setValue(callback())
  })[1]

  const stopInterval = useCallback(() => dispatch('stop'), [dispatch])

  useEffect(() => {
    logger.debug('running useInterval useEffect...')

    dispatch({
      callback: () => setValue(callback()),
      interval,
      intervalReference: undefined
    })
  }, [callback, interval, dispatch, setValue])

  return [value as T, stopInterval]
}

export enum ElementIdentifier {
  Class = 'class',
  Id = 'id',
  Type = 'type'
}

const getElementBasedOnIdentifier = (type: ElementIdentifier, identifier: string) => {
  switch (type) {
    case ElementIdentifier.Class:
      return document.getElementsByClassName(identifier)[0]
    case ElementIdentifier.Id:
      return document.getElementById(identifier) as HTMLElement
    case ElementIdentifier.Type:
      return document.getElementsByTagName(identifier)[0]
  }
}

export type ElementSizeInfo = {
  location: {
    top: number,
    right: number,
    bottom: number,
    left: number
  },
  size: {
    width: number,
    height: number
  }
}

export const useElementSize = (identifierType: ElementIdentifier, identifier: string) => {
  const { elementName, elementNameType } = useMemo(
    () => ({ elementName: identifier, elementNameType: identifierType }),
    [identifier, identifierType]
  )
  const [element, setElement] = useState<Element | undefined>()
  const [size, setSize] = useState<ElementSizeInfo>({
    location: { top: 0, right: 0, bottom: 0, left: 0 },
    size: { width: 0, height: 0 }
  })

  const resizeCallback = useCallback((el: Element | undefined = element) => {
    if (el) {
      const {
        top, right, bottom, left
      } = el.getBoundingClientRect()
      setSize({
        location: { top, right, bottom, left },
        size: { width: right - left, height: bottom - top }
      })
    }
  }, [element])
  useEffect(() => {
    logger.debug('getting element...')
    const element = getElementBasedOnIdentifier(elementNameType, elementName)
    setElement(element)
    resizeCallback(element)
  }, [setElement, resizeCallback, elementName, elementNameType])


  useEffect(() => {
    logger.debug('running element size 2nd useEffect...')
    const eventListener = () => resizeCallback()
    window.addEventListener('resize', eventListener)
    return () => window.removeEventListener('resize', eventListener)
  }, [resizeCallback])

  return size
}

export const useScreenSize = () => {
  const [size, setSize] = useState({
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight
  })

  useEffect(() => {
    const callback = () => setSize({
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight
    })

    window.addEventListener('resize', callback)

    return () => window.removeEventListener('resize', callback)
  }, [setSize])

  return size
}

export enum ScreenOrientation {
  Landscape = 'landscape',
  Portrait = 'portrait'
}

type OrientationAction = { width: number, height: number }

export const useOrientation = () => {
  const { size } = useElementSize(ElementIdentifier.Type, 'body')

  const [orientation, setOrientation] = useReducer<Reducer<ScreenOrientation, OrientationAction>>(
    ((state, { width, height}) => {
      const newOrientation = height >= width
        ? ScreenOrientation.Portrait
        : ScreenOrientation.Landscape
      if (newOrientation !== state) {
        return newOrientation
      }
      return state
    }),
    ScreenOrientation.Landscape
  )

  useEffect(() => {
    logger.debug('updating orientation')
    setOrientation(size)
  }, [size, setOrientation])
  return orientation
}

export const usePromise = <T>(p: Promise<T>, initialValue?: T): typeof initialValue extends undefined ? T | undefined : T => {
  const [resolved, setResolved] = useState<T>(initialValue!)

  useEffect(() => {
    p.then(val => setResolved(val))
  }, [p])

  return resolved as any
}
