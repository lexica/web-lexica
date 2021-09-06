import * as R from 'ramda'
import { scoreWord } from '../game'
import { ScoreType } from '../game/rules'

import './MostRecentGuess.css'

export type MostRecentGuessProps = {
  guesses: string[],
  dictionary: string[],
  scoreType: ScoreType,
  currentLetterChain: string
}

const MostRecentGuess: React.FC<MostRecentGuessProps> = ({
  guesses,
  currentLetterChain,
  dictionary,
  scoreType
}) => {
  const showLetterChain = currentLetterChain.length > 0
  const guessesReversed = R.reverse(guesses)
  const mostRecentGuess = R.head(guessesReversed) || ''

  const isCorrectGuess = dictionary.includes(mostRecentGuess)
  const isFirstTimeGuessing = guessesReversed.lastIndexOf(mostRecentGuess) === 0

  const shouldScoreWord = !showLetterChain && isCorrectGuess
  const repeatScore = !isFirstTimeGuessing

  const score = shouldScoreWord ? ` +${scoreWord(mostRecentGuess, scoreType)}` : ''

  const classes = ['most-recent-guess', repeatScore ? 'repeat-score' : ''].join(' ')

  const word = showLetterChain ? currentLetterChain : mostRecentGuess

  return <div className={classes}>{`${word.toUpperCase()}${score}`}</div>
}

export default MostRecentGuess
