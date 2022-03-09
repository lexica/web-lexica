import { useContext } from 'react'
import { Score as ScoreContext, GuessScore } from '../../../game/lexicle/score'
import * as R from 'ramda'

import './Score.css'

const displayWord = (guess: GuessScore) => (<div className='lexicle-score-word-container'>
  {guess.wordBreakdown.map(({ letter, correctness }) => <>
    <div className={`lexicle-score-letter-container ${correctness}`}>
      {letter}
      </div>
  </>)}
</div>)

const Score = (): JSX.Element => {
  const score = useContext(ScoreContext)
  return <div className='lexicle-score'>
    {R.reverse(score.guessScores).map(displayWord)}
  </div>
}

export default Score
