import axios from 'axios'
import { useCallback, useContext, useMemo } from 'react'

import { storage, useStorage } from './storage'
import { Translations } from '../translations'

export const LocalStorage = {
    Language: 'i18nextLng'
} as const

export const getLanguageChoices = (): Promise<{ [languageCode: string]: string }> => {
    return axios.get('/web-lexica/available-locales.json').then(({ data }) => data)
}

// @ts-ignore
export const saveLanguageChoice = (choice: string) => {
}

export const useLanguageChoice = () => {
    const { changeLanguage } = useContext(Translations)
    const saveLanguageChoice = useCallback((choice: string) => {
        storage.set(LocalStorage.Language, choice)
        changeLanguage(choice)
    }, [changeLanguage])

    const currentChoice =  useStorage(LocalStorage.Language, '' as string, s => s)

    return useMemo(() => ({
        saveLanguageChoice,
        currentChoice
    }), [saveLanguageChoice, currentChoice])
}
