import * as R from 'ramda'
import { useContext } from 'react'

import './Guesses.css'
import { Guess as GuessContext } from '../game/guess'
import { makeClasses } from '../util/classes'
import { Score } from '../game/score'

type GuessProps = {
  guess: string,
  isFirstGuess: boolean,
  isInDictionary: boolean
  index: number
}
const Guess: React.FC<GuessProps> = ({ guess, isFirstGuess, isInDictionary, index }) => {
  const firstAndCorrect = isFirstGuess && isInDictionary
  const correct = isInDictionary

  const className = correct
    ? firstAndCorrect
      ? 'correct-gues'
      : 'repeat-guess'
    : 'incorrect-guess'

  return <div {...{ className, key: index }}>{guess.toUpperCase()}</div>
}

const getGuessInfo = (guess: string, guesses: string[], dictionary: string[], index: number = 0) => {
  const isFirstGuess = guesses.lastIndexOf(guess) === index
  const isInDictionary = dictionary.includes(guess) 

  return { isFirstGuess, isInDictionary }
}

export enum GuessOrientation {
  Vertical = 'vertical',
  Horizontal = 'horizontal'
}

export type GuessesProps = {
 orientation: GuessOrientation
}

const Guesses: React.FC<GuessesProps> = ({ orientation }) => {
  const { guesses } = useContext(GuessContext)
  const { foundWords: dictionary } = useContext(Score)
  const guessesReversed = R.reverse(guesses)
  const indexedMap = R.addIndex<string, JSX.Element>(R.map)

  const makeGuess = (guess: string, index: number) => {
    const guessInfo = getGuessInfo(guess, guessesReversed, dictionary, index)
    return <Guess {...{ guess, ...guessInfo, index, key: index }}/>
  }



  return <div className={makeClasses(
    'guess-list',
    orientation
  )} >
    {indexedMap(makeGuess, guessesReversed)}
  </div>
}

export default Guesses
