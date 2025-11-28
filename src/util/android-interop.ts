import { useCallback, useMemo } from 'react'

import { storage, useStorage } from './storage'
import type { Ruleset } from '../game/rules/types'
import { getSearchString } from '../game/url'
import { logger } from './logger'

import * as R from 'ramda'

export const LocalStorage = {
  BehaviorSetting: 'android-interop-behavior',
  AutoOpenApp: 'android-interop-auto-open-app',
} as const

export const AndroidDetectBehavior = {
  AutoDetect: 'auto-detect',
  ActAsAndroid: 'force-android',
  ActAsNonAndroid: 'force-non-android'
} as const

export type AndroidDetectBehaviorType = typeof AndroidDetectBehavior[keyof typeof AndroidDetectBehavior]

export const redirectToApp = ({ ruleset, board, language }: { language: string, ruleset: Ruleset, board: string[] }) => {
  if (language.length === 0) {
    logger.warn('missing game language, will not redirect to app')
    return
  }
  if (board.length === 0 || board.length === 1) {
    logger.warn('missing board, will not redirect to app')
    return
  }

  const searchString = getSearchString({
    board,
    language,
    ...ruleset,
  })
  document.location.href = `lexica://multiplayer?${searchString}`
}

export const memoizedRedirectToApp = R.memoizeWith(({ ruleset, board, language}: Parameters<typeof redirectToApp>[0]) => {
  const stringifiedRuleset = R.pipe(
    Object.keys,
    R.sortWith([R.ascend(R.identity)]),
    R.map((key: string) => `${key}:${ruleset[key as any as keyof Ruleset]}`),
    R.join(',')
  )(ruleset)
  return `${stringifiedRuleset}|${JSON.stringify(board)}|${language}`
}, (...params: Parameters<typeof redirectToApp>) => {
  logger.debug('calling memoized redirectToApp', ...params)
  redirectToApp(...params)
  return 'yo'
})

export const androidDetectBehaviors = [
  AndroidDetectBehavior.AutoDetect,
  AndroidDetectBehavior.ActAsAndroid,
  AndroidDetectBehavior.ActAsNonAndroid
] as const

export const isAndroidClient = (): boolean => {
  const behavior = storage.getWithDefault({ key: LocalStorage.BehaviorSetting, defaultValue: AndroidDetectBehavior.AutoDetect, parser: v => v })

  if (behavior === AndroidDetectBehavior.ActAsAndroid) return true
  return behavior === AndroidDetectBehavior.AutoDetect && /Android/i.test(navigator.userAgent)
}

const toADBEnum = (value: string): AndroidDetectBehaviorType => {
  const index = androidDetectBehaviors.indexOf(value as any)
  if (index < 0) {
    logger.warn(`Unknown android detection behavior: ${value}`)
    return value as any
  }
  return androidDetectBehaviors[index]
}

export const useAndroidInteropSettings = () => {
  const androidDetectBehavior = useStorage(LocalStorage.BehaviorSetting, AndroidDetectBehavior.AutoDetect, toADBEnum)
  const autoAppRedirect = useStorage(LocalStorage.AutoOpenApp, false, v => v === 'true')

  const setAndroidDetectBehavior = useCallback((behavior: AndroidDetectBehaviorType) => { storage.set(LocalStorage.BehaviorSetting, behavior) }, [])
  const setAutoAppRedirect = useCallback((value: boolean) => { storage.set(LocalStorage.AutoOpenApp, value) }, [])

  return useMemo(() => ({
    autoAppRedirect,
    setAutoAppRedirect,
    androidDetectBehavior,
    setAndroidDetectBehavior
  }), [androidDetectBehavior, autoAppRedirect, setAndroidDetectBehavior, setAutoAppRedirect])
}
