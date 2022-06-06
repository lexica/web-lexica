import { useContext, useEffect, useMemo, useState } from "react"
import { logger } from "../../util/logger"
import { isValidGamePath, useGamePath } from "../../util/url"
import { Score } from "../score"
import { useSaveBoard, useSaveGameRuleset, useSaveGuesses, useSaveLanguageMetadata, useSaveScore, useSaveTime } from "./sub-hoooks"
import { SavedGame, UseSaveGameState } from "./types"
import { addGameToSavedGames, clearSaveGameData, loadGame, removeGameFromSavedGames } from "./util"

export { useSavedGames } from './sub-hoooks'

export const useResumedGame = (url: string): SavedGame => {
  const gameData = useMemo(() => loadGame(url), [url])

  return gameData
}

export const useSaveGame = (): UseSaveGameState => {
  const [gameFinishCalled, setGameFinishCalled] = useState(false)
  const [useSaveGameState, setUseSaveGameState] = useState<UseSaveGameState>({
    onGameFinishCallback: () => undefined
  })
  const gamePath = useGamePath()

  // Split out into different hooks to independantly save
  // game data
  useSaveBoard()
  useSaveGameRuleset()
  useSaveScore()
  const saveTimeIntervalRef = useSaveTime()
  useSaveLanguageMetadata()
  useSaveGuesses()

  const score = useContext(Score)

  useEffect(() => {
    if (gameFinishCalled) return
    if (!isValidGamePath(gamePath)) return
    if (!score?.foundWords?.length && !score?.remainingWords?.length) return
    addGameToSavedGames(gamePath)
  }, [score, gameFinishCalled, gamePath])

  useEffect(() => {
    setUseSaveGameState({
      onGameFinishCallback: () => {
        logger.debug('onGameFinishCallback triggered...')
        if (saveTimeIntervalRef.current) {
          clearInterval(saveTimeIntervalRef.current)
          saveTimeIntervalRef.current = undefined
        }
        setGameFinishCalled(true)
        clearSaveGameData(gamePath)
        removeGameFromSavedGames(gamePath)
      }
    })
  }, [gamePath, saveTimeIntervalRef, setGameFinishCalled])

  return useSaveGameState
}
