import { useCallback, useContext } from 'react'
import { Guess } from '../../../game/guess'
import { LetterCorrectness, Score as ScoreContext } from '../../../game/lexicle/score'

import StaticBoard from '../../StaticBoard'
import Score from './Score'

import './Results.css'
import { useOrientation, ScreenOrientation } from '../../../util/hooks'

const correctnessMap: { [C in LetterCorrectness]: string } = {
  [LetterCorrectness.Perfect]: '🟩',
  [LetterCorrectness.InWord]: '🟨',
  [LetterCorrectness.NotInWord]: '⬛'
}

const Share = (): JSX.Element => {
  const score = useContext(ScoreContext)
  const onClick = useCallback(() => {
    const scoreBreakdown = score.guessScores
      .map(guess => guess.wordBreakdown.map(
        ({ correctness }) => correctnessMap[correctness]
      ).join(''))
      .join('\n')
    navigator.clipboard.writeText(`Lexicle ${score.guessScores.length}/6\n\n${scoreBreakdown}`)
  }, [score])
  return <div
    className='lexicle-results-share-button'
    onClick={onClick}
  >
    Share
  </div>
}

const Results = (): JSX.Element => {
  const orientation = useOrientation()
  const score = useContext(ScoreContext)
  const { board } = useContext(Guess)
  const Landscape = <div className='lexicle-results'>
    <div className='lexicle-results-board-container'><StaticBoard board={board}/></div>
    <div className='lexicle-results-landscape-container'>
      <div className='lexicle-results-desired-word'>{score.desiredWord.toLocaleUpperCase()}</div>
      <Share/>
    </div>
    <div className='lexicle-results-score-container'><Score/></div>
  </div>

  const Portrait = <div>
    <div className='lexicle-results-desired-word'>{score.desiredWord.toLocaleUpperCase()}</div>
    <div className='lexicle-results-portrait-container'>
      <div className='lexicle-results-score-container'><Score/></div>
      <div className='lexicle-results-score-container'><Score/></div>
    </div>
    <Share/>
  </div>

  return orientation === ScreenOrientation.Landscape ? Landscape : Portrait
}

export default Results
