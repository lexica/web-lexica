import { useEffect, useState } from "react"

export enum VisibilityState {
    Visible = 'visible',
    Hidden = 'hidden'
}

const getVisibilityState = () => document.visibilityState === 'hidden' ? VisibilityState.Hidden : VisibilityState.Visible

export const usePageVisibility = (coerceToVisibleOrHidden: boolean = true): VisibilityState => {
    const [visibilityState, setVisibilityState] = useState<VisibilityState>(getVisibilityState())

    useEffect(() => {
        const eventHandler = () => setVisibilityState(getVisibilityState())
        document.addEventListener('visibilitychange', eventHandler)
        return () => document.removeEventListener('visibilitychange', eventHandler)
    }, [setVisibilityState])

    return visibilityState
}
