import { useCallback, useEffect, useMemo, useState } from 'react'

export const useInterval = <T extends any>(callback: (...args: any[]) => T, interval: number, initialValue?: T): [T, () => void] => {
  const [value, setValue] = useState<T | undefined>(initialValue)
  const [intervalValue] = useState(setInterval(() => setValue(callback), interval))

  const stopInterval = () => clearInterval(intervalValue)

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
    console.log('getting element...')
    const element = getElementBasedOnIdentifier(elementNameType, elementName)
    setElement(element)
    resizeCallback(element)
  }, [setElement, resizeCallback, elementName, elementNameType])


  useEffect(() => {
    const eventListener = () => resizeCallback()
    window.addEventListener('resize', eventListener)
    return () => window.removeEventListener('resize', eventListener)
  })

  return size
}
