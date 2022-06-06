import { useEffect, useState } from "react"
import { usePageVisibility, VisibilityState } from "../util/page-visibility-api"
import { TimerContext } from "./timer"

export const usePauseGameOnHidden = (timer: TimerContext) => {
  const [isPaused, setIsPaused] = useState(false)
  const visibility = usePageVisibility()

  useEffect(() => {
    const visibilityStateHandlerMap = {
      [VisibilityState.Hidden]: () => {
        timer.pauseTime()
        setIsPaused(true)
      },
      [VisibilityState.Visible]: () => {
        setIsPaused(false)
        if (!timer.state.isPaused) return

        timer.startTime()
      }
    }

    const handler = visibilityStateHandlerMap[visibility]
    handler()
  }, [timer, setIsPaused, visibility])

  return isPaused
}

