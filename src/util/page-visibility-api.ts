import { useEffect, useState } from "react"

export const VisibilityState = {
    Visible: 'visible',
    Hidden: 'hidden'
} as const

export type VisibilityStateType = typeof VisibilityState[keyof typeof VisibilityState]

const getVisibilityState = () => document.visibilityState === 'hidden' ? VisibilityState.Hidden : VisibilityState.Visible

export const usePageVisibility = (): VisibilityStateType => {
    const [visibilityState, setVisibilityState] = useState<VisibilityStateType>(getVisibilityState())

    useEffect(() => {
        const eventHandler = () => setVisibilityState(getVisibilityState())
        document.addEventListener('visibilitychange', eventHandler)
        return () => document.removeEventListener('visibilitychange', eventHandler)
    }, [setVisibilityState])

    return visibilityState
}
