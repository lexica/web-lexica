import { useCallback, useContext, useEffect, useState } from 'react' 
import RotateRight from '@material-design-icons/svg/round/rotate_right.svg'


import { Score as ScoreContext } from '../game/score'
import { Translations } from '../translations'
import { ScreenOrientation, useOrientation } from '../util/hooks'

import { useBannerBadge } from './Banner'
import Board from './game/Board'
import Score from './game/Score'
import Guesses, { GuessOrientation } from './game/Guesses'
import MostRecentGuess from './game/MostRecentGuess'
import ScoredWordList from './game/ScoredWordList'
import { HorizontalContainer, VerticalContainer } from './game/layouts'
import { useUpdateHighScore } from '../game/high-scores'
import { usePauseGameOnHidden } from '../game/pause-game'
import { useSaveGame } from '../game/save-game'
import { Timer } from '../game/timer'
import { ConfirmationEffect, useConfirmationEffect } from './game/Board/hooks'
import { Direction, Directions, type DirectionT } from './game/Board/types'

import './InGameScreen.css'

const Game: React.FC = () => {
  const [rotation, setRotation] = useState<DirectionT>(Direction.North)

  const rotateBoard = useCallback(() => {
    setRotation(prev => {
      const idx = Directions.indexOf(prev)
      if (idx < 0) return Direction.North

      return Directions[(idx + 1) % Directions.length]
    })
  }, [setRotation])

  const scoreContext = useContext(ScoreContext)
  const timer = useContext(Timer)

  const useSaveGameState = useSaveGame()
  const setUseSaveGameStateWrapper = useState(useSaveGameState)[1]
  const { translationsFn } = useContext(Translations)
  useBannerBadge({
    svg: RotateRight,
    onClick: rotateBoard,
    svgTitle: translationsFn('lexicaGameScreens.inGame.rotateBoard'),
  })

  // Weird way of removing callbacks...
  useEffect(() => {
    setUseSaveGameStateWrapper(previous => {
      timer.removeTimerEndCallback(previous.onGameFinishCallback)
      timer.addTimerEndCallback(useSaveGameState.onGameFinishCallback)
      return useSaveGameState
    })
  }, [useSaveGameState, setUseSaveGameStateWrapper, timer])

  const isPaused = usePauseGameOnHidden(timer)

  const { foundWords } = scoreContext

  const orientation = useOrientation()

  const useVerticalLayout = orientation === ScreenOrientation.Portrait

  useUpdateHighScore()

  const guessOrientation = useVerticalLayout ? GuessOrientation.Horizontal : GuessOrientation.Vertical

  const board = <Board rotation={rotation} />
  const mostRecentGuesses = <MostRecentGuess />
  const guesses = <Guesses orientation={guessOrientation} />
  const score = <Score />
  const foundWordsComponent = <ScoredWordList {...{ scoredWords: foundWords }} />



  const verticalLayout = <VerticalContainer
    Board={board}
    MostRecentGuess={mostRecentGuesses}
    Guesses={guesses}
    Score={score}
  />

  const horizontalLayout = <HorizontalContainer
    Board={board}
    MostRecentGuess={mostRecentGuesses}
    Guesses={guesses}
    Score={score}
    FoundWords={foundWordsComponent}
  />

  const layout = useVerticalLayout ? verticalLayout : horizontalLayout;
  return isPaused ? <div>{translationsFn('general.paused')}</div> : <div className="game-container" style={{ height: '100%' }}>
    <ConfirmationEffect.Provider value={useConfirmationEffect}>
      {layout}
    </ConfirmationEffect.Provider>
  </div>
}

export default Game
