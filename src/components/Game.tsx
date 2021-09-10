import { useContext } from 'react' 

import { ScreenOrientation, useOrientation } from '../util/hooks'

import { Score as ScoreContext } from '../game/score'

import Board from './Board'
import Score from './Score'
import Guesses, { GuessOrientation } from './Guesses'
import MostRecentGuess from './MostRecentGuess'
import ScoredWordList from './ScoredWordList'
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
