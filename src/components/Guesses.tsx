import * as R from 'ramda'
import { scoreWord } from '../game'

import './Guesses.css'

const Guess: React.FC<{ guess: string, correctGuess: boolean }> = ({ guess, correctGuess }) => {
  return <div className={correctGuess ? 'correct-guess' : 'guess'}>{guess.toUpperCase()}</div>
}

const isCorrectGuess = (guess: string, guesses: string[], dictionary: string[], index: number = 0) => {
  const isFirstGuess = guesses.lastIndexOf(guess) === index
  const isInDictionary = dictionary.includes(guess) 

  return isFirstGuess && isInDictionary
}

const Guesses: React.FC<{ guesses: string[], dictionary: string[] }> = ({ guesses, dictionary }) => {
  const guessesReversed = R.reverse(guesses)
  const lastGuess = R.head(guessesReversed)

  const shouldScoreWord = lastGuess && isCorrectGuess(lastGuess, guessesReversed, dictionary)

  const score = shouldScoreWord ? scoreWord(lastGuess!) : 0

  const indexedMap = R.addIndex<string, JSX.Element>(R.map)

  const makeGuess = (guess: string, index: number) => {
    const correctGuess = isCorrectGuess(guess, guessesReversed, dictionary, index)
    return <Guess {...{ guess, correctGuess }}/>
  }

  return <div>
    <hr/>
    <div className="last-guess">{lastGuess && `${lastGuess.toUpperCase()}+${score}`}</div>
    <div className="guess-list">{indexedMap(makeGuess, guessesReversed)}</div>
    <hr/>
  </div>
}

export default Guesses
