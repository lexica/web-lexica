import { useContext } from 'react'
import { Score as ScoreContext, GuessScore } from '../../../game/lexicle/score'
import * as R from 'ramda'

import './Score.css'

const displayWord = (guess: GuessScore) => (<div className='lexicle-score-word-container'>
  {guess.wordBreakdown.map(({ letter, correctness }) => <>
    <div className={`lexicle-score-letter-container ${correctness}`}>
      {letter.toLocaleUpperCase()}
      </div>
  </>)}
</div>)

const EmptyGuess = () => <div className='lexicle-score-word-container'>
  {R.times(key => <div key={key} className='lexicle-score-letter-container empty'>{'\u00A0'}</div>, 5)}
</div>

const Score = (): JSX.Element => {
  const score = useContext(ScoreContext)
  return <div className='lexicle-score'>
    {score.guessScores.map(displayWord)}
    {R.times(() => <EmptyGuess/>, 6 - (score.guessScores.length))}
  </div>
}

export default Score
