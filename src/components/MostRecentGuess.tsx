import { useContext } from 'react'
import * as R from 'ramda'

import { LetterScores, scoreWord } from '../game'
import { Rules } from '../game/rules'
import { makeClasses } from '../util/classes'

import './MostRecentGuess.css'
import { Guess } from '../game/guess'
import { Dictionary } from '../game/dictionary'

const MostRecentGuess: React.FC = () => {

  const rules = useContext(Rules)
  const letterScores = useContext(LetterScores)

  const { guesses, currentGuess: currentLetterChain, isGuessing } = useContext(Guess)
  const dictionary = useContext(Dictionary)
  const showLetterChain = isGuessing
  const guessesReversed = R.reverse(guesses)
  const mostRecentGuess = R.head(guessesReversed) || ''

  const isCorrectGuess = dictionary.boardDictionary.includes(mostRecentGuess)
  const isFirstTimeGuessing = guesses.filter(guess => guess === mostRecentGuess).length === 1

  const shouldScoreWord = !showLetterChain && isCorrectGuess
  const repeatScore = !isFirstTimeGuessing

  const score = shouldScoreWord ? ` +${scoreWord(mostRecentGuess, rules.score, letterScores)}` : ''

  const classes = makeClasses('most-recent-guess', { condition: repeatScore, name: 'repeat-guess' })

  const word = showLetterChain ? currentLetterChain : mostRecentGuess

  return <div className={classes}>{`${word.toUpperCase()}${score}`}</div>
}

export default MostRecentGuess
