import * as R from 'ramda'
import { useEffect, useState } from 'react'
import { logger } from './logger'

const SamePageEventType = 'same-page-storage' as const
Object.freeze(SamePageEventType)

export type UseEffectCleanup = () => void

export type Get<D> = {
  key: string,
  parser?: (val: string) => D
}

export type GetWithDefault<D> = Get<D> & { defaultValue: D }

const get = <D>({ key, parser = JSON.parse }: Get<D>) => {
  const item = localStorage.getItem(key)

  return !R.isNil(item) ? parser(item) : item
}

const getWithDefault = <D>({ key, parser = JSON.parse, defaultValue }: GetWithDefault<D>): D => {
  const item = localStorage.getItem(key)

  return item ? parser(item) : defaultValue
}

const isString = (item: any): item is string => typeof item === 'string'

const set = (key: string, item: any) => {
  const value = isString(item) ? item : JSON.stringify(item)
  localStorage.setItem(key, value)
  window.dispatchEvent(getSamePageEvent(key, value))
}

export class Removed {}

const remove = (key: string) => {
  localStorage.removeItem(key)
  window.dispatchEvent(getSamePageEvent(key, new Removed()))
}

type SamePageEvent = ReturnType<typeof getSamePageEvent>

export const valueIsRemoved = (value: any): value is InstanceType<typeof Removed> => value instanceof Removed

const getSamePageEvent = (key: string, value: string | Removed) => new CustomEvent(SamePageEventType, {
  bubbles: true,
  cancelable: false,
  detail: { key, value }
})

export const useStorage = <I>(key: string, initialValue: I, parser: (value: string) => I = JSON.parse) => {
  const [item, setItem] = useState<I>(storage.getWithDefault({ key, parser, defaultValue: initialValue }))

  useEffect(() => {
    const eventHandler = (e: SamePageEvent) => {
      if (e.detail.key !== key) return
      logger.debug(`handling event for key: ${key}`)

      const value = e.detail.value

      if (valueIsRemoved(value)) {
        setItem(initialValue)
        return
      }

      setItem(parser(value))
    }

    logger.debug(`running useStorage useEffect for key: ${key}`)

    const item = get({ key, parser })
    
    if (item) setItem(item)

    window.addEventListener(SamePageEventType as any, eventHandler)

    return () => window.removeEventListener(SamePageEventType as any, eventHandler)
  }, [setItem, parser, key, initialValue])

  return item
}

type StorageConstructor<T> = {
  key: string,
  initialValueIfNull?: T,
  parser?: (value: string) => T,
  serializer?: (value: T) => string
}

export class GameStorage<T> {
  public key: string
  private parse: (value: string) => T
  private serialize: (value: T) => string
  constructor({
    key,
    initialValueIfNull,
    parser = JSON.parse,
    serializer = JSON.stringify
  }: StorageConstructor<T>) {
    this.key = key
    this.parse = parser
    this.serialize = serializer
    const storedValue = localStorage.getItem(key)
    if (storedValue === null && initialValueIfNull !== undefined)
      localStorage.setItem(key, serializer(initialValueIfNull))
  }

  public get() {
    const value = localStorage.getItem(this.key) as string
    return this.parse(value)
  }

  public set(value: T) {
    const serialized = this.serialize(value)
    localStorage.setItem(this.key, serialized)
    const result = window.dispatchEvent(getSamePageEvent(this.key, serialized))
    logger.debug(`fired window event... result: ${result}`)
  }
}

export const storage = {
  get,
  getWithDefault,
  set,
  remove
}
