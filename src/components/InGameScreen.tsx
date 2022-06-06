import { useContext, useEffect, useState } from 'react' 

import { ScreenOrientation, useOrientation } from '../util/hooks'

import { Score as ScoreContext } from '../game/score'

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

const Game: React.FC = () => {

  const scoreContext = useContext(ScoreContext)
  const timer = useContext(Timer)

  const useSaveGameState = useSaveGame()
  const setUseSaveGameStateWrapper = useState(useSaveGameState)[1]

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

  const board = <Board/>
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
  return isPaused ? <div>Game Paused</div> : <div className="game-container" style={{ height: '100%' }}>
    <ConfirmationEffect.Provider value={useConfirmationEffect}>
      {layout}
    </ConfirmationEffect.Provider>
  </div>
}

export default Game
