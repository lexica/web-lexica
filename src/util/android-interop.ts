import { useCallback, useMemo } from 'react'

import { storage, useStorage } from './storage'
import { Ruleset } from '../game/rules/types'
import { getSearchString } from '../game/url'
import { logger } from './logger'

export enum LocalStorage {
    BehaviorSetting = 'android-interop-behavior',
    AutoOpenApp = 'android-interop-auto-open-app',
}

export enum AndroidDetectBehavior {
    AutoDetect = 'auto-detect',
    ActAsAndroid = 'force-android',
    ActAsNonAndroid = 'force-non-android'
}


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

export const useAppRedirect = () => {
    const autoAppRedirectSetting = useStorage(LocalStorage.AutoOpenApp, false, v => v === 'true')

    const redirectToApp = useCallback(({ ruleset, board, language }: { language: string,  ruleset: Ruleset, board: string[] }) => {
        const searchString = getSearchString({
            board,
            language,
            ...ruleset,
        })
        document.location.href = `lexica://multiplayer?${searchString}`
    }, [])

    return {
        autoAppRedirectSetting,
        redirectToApp,
    }
}

const toADBEnum = (value: string): AndroidDetectBehavior => {
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

    const setAndroidDetectBehavior = useCallback((behavior: AndroidDetectBehavior) => { storage.set(LocalStorage.BehaviorSetting, behavior)}, [])
    const setAutoAppRedirect = useCallback((value: boolean) => { storage.set(LocalStorage.AutoOpenApp, value)}, [])

    return useMemo(() => ({
        autoAppRedirect,
        setAutoAppRedirect,
        androidDetectBehavior,
        setAndroidDetectBehavior
    }), [androidDetectBehavior, autoAppRedirect, setAndroidDetectBehavior, setAutoAppRedirect])
}
