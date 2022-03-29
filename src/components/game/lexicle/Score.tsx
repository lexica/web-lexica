import { useCallback, useContext } from 'react'
import { Score as ScoreContext, GuessScore } from '../../../game/lexicle/score'
import * as R from 'ramda'

import './Score.css'

const displayWord = (guess: GuessScore, index: number) => <div className='lexicle-score-word-container' key={`guess-${index}`}>
  {guess.wordBreakdown.map(({ letter, correctness }, key) => <>
    <div className={`lexicle-score-letter-container ${correctness}`} key={`score-letter-${index}-${key}`}>
      {letter.toLocaleUpperCase()}
      </div>
  </>)}
</div>


const EmptyGuess = ({ index }: { index: number}) => <div className='lexicle-score-word-container'>
  {R.times(key => <div key={`empty-${index}-${key}`} className='lexicle-score-letter-container empty'>{'\u00A0'}</div>, 5)}
</div>

const Score = (): JSX.Element => {
  const score = useContext(ScoreContext)
  const makeEmptyGuesses = useCallback((index: number) => {
    const guessCount = score.guessScores.length
    const key = `${index + guessCount}`
    return <EmptyGuess index={index} key={`empty-guess-${key}`}/>
  }, [score])
  return <div className='lexicle-score'>
    {score.guessScores.map(displayWord)}
    {R.times(makeEmptyGuesses, 6 - (score.guessScores.length))}
  </div>
}

export default Score
