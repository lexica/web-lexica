import { Reducer, useCallback, useEffect, useMemo, useReducer, useState } from 'react'

import { logger } from './logger'

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
    logger.debug('change to promise')
    p.then(val => setResolved(val))
  }, [p])

  return resolved as any
}

export const usePromiseWithMetadata = <T>(p: Promise<T>, initialValue: T): { loading: boolean, error: boolean, ready: boolean, value: T } => {
  const [state, setState] = useState<{ value: T, loading: boolean, error: boolean, ready: boolean }>({
    loading: true,
    error: false,
    ready: false,
    value: initialValue!
  })

  useEffect(() => {
    logger.debug('change to promise')
    p.then(val => setState({
      loading: false,
      error: false,
      ready: true,
      value: val
    })).catch(() => setState(previous => ({
      ...previous,
      loading: false,
      error: true,
      ready: false
    })))
  }, [p, setState])

  return state as any
}
