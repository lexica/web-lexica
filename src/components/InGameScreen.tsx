import { useContext } from 'react' 

import { ScreenOrientation, useOrientation } from '../util/hooks'

import { Score as ScoreContext } from '../game/score'

import Board from './game/Board'
import Score from './game/Score'
import Guesses, { GuessOrientation } from './game/Guesses'
import MostRecentGuess from './game/MostRecentGuess'
import ScoredWordList from './game/ScoredWordList'
import { HorizontalContainer, VerticalContainer } from './game/layouts'
import { useUpdateHighScore } from '../game/high-scores'
import { Rules } from '../game/rules'
import { Board as BoardContext } from '../game/board/hooks'
import { Language } from '../game/language'
import { Guess } from '../game/guess'
import { useSaveGameOnBlur } from '../game/save-game'
import { Timer } from '../game/timer'
import { useLocation } from 'react-router'

const Game: React.FC = () => {

  const rules = useContext(Rules)
  const language = useContext(Language)
  const scoreContext = useContext(ScoreContext)
  const guessesContext = useContext(Guess)
  const boardContext = useContext(BoardContext)
  const timer = useContext(Timer)
  const location = useLocation()

  const isPaused = useSaveGameOnBlur({
    board: boardContext,
    guess: guessesContext,
    language,
    timer,
    rules,
    score: scoreContext,
    url: `${location.pathname}${location.search}`
  })


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
  return isPaused ? <div>Game Paused</div> : <div className="game-container" style={{ height: '100%' }}>{layout}</div>
}

export default Game
