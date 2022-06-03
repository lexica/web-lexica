import { useCallback, useContext } from 'react'
import { Score as ScoreContext, GuessScore, LetterScore } from '../../../game/lexicle/score'
import * as R from 'ramda'

import './Score.css'

const Guess = ({ index, guess }: { index: number, guess: GuessScore }): JSX.Element => {
  const Letter = ({ letter, correctness }: LetterScore) => <>
    <div className={`lexicle-score-letter-container ${correctness}`}>
      {letter.toLocaleUpperCase()}
    </div>
  </>
  return <div className='lexicle-score-word-container'>
    {guess.wordBreakdown.map((letterScore, i) => <Letter {...letterScore} key={`guess-letter-${index}-${i}`}/>)}
  </div>
}

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
    {score.guessScores.map((guess: GuessScore, index: number) => <Guess index={index} guess={guess} key={`guess-${index}`}/>)}
    {R.times(makeEmptyGuesses, 6 - (score.guessScores.length))}
  </div>
}

export default Score
