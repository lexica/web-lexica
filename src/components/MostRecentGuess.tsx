import * as R from 'ramda'
import { scoreWord } from '../game'
import { ScoreType } from '../game/rules'
import { makeClasses } from '../util/classes'

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
  const isFirstTimeGuessing = guesses.filter(guess => guess === mostRecentGuess).length === 1

  const shouldScoreWord = !showLetterChain && isCorrectGuess
  const repeatScore = !isFirstTimeGuessing

  const score = shouldScoreWord ? ` +${scoreWord(mostRecentGuess, scoreType)}` : ''

  const classes = makeClasses('most-recent-guess', { condition: repeatScore, name: 'repeat-guess' })

  const word = showLetterChain ? currentLetterChain : mostRecentGuess

  return <div className={classes}>{`${word.toUpperCase()}${score}`}</div>
}

export default MostRecentGuess
