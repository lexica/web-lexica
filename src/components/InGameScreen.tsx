import { useContext } from 'react' 

import { ScreenOrientation, useOrientation } from '../util/hooks'

import { Score as ScoreContext } from '../game/score'

import Board from './game/Board'
import Score from './game/Score'
import Guesses, { GuessOrientation } from './game/Guesses'
import MostRecentGuess from './game/MostRecentGuess'
import ScoredWordList from './game/ScoredWordList'
import { HorizontalContainer, VerticalContainer } from './game/layouts'

const Game: React.FC = () => {

  const { foundWords } = useContext(ScoreContext)

  const orientation = useOrientation()

  const useVerticalLayout = orientation === ScreenOrientation.Portrait

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
  return <div className="game-container" style={{ height: '100%' }}>{layout}</div>
}

export default Game
