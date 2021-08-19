import * as R from 'ramda'
import { scoreWord } from './game'

import './Guesses.css'

const Guess: React.FC<{ guess: string, correctGuess: boolean }> = ({ guess, correctGuess }) => {
  const score = scoreWord(guess)
  const display = correctGuess ? `${guess.toUpperCase()} +${score}` : guess.toUpperCase()
  return <div className={correctGuess ? 'correct-guess' : 'guess'}>{display}</div>
}

const Guesses: React.FC<{ guesses: string[], dictionary: string[] }> = ({ guesses, dictionary }) => {
  const guessesReversed = R.reverse(guesses)
  const lastGuess = R.head(guessesReversed)

  const indexedMap = R.addIndex<string, JSX.Element>(R.map)

  const makeGuess = (guess: string, index: number) => {
    const isFirst = guessesReversed.lastIndexOf(guess) === index
    const correctGuess = dictionary.includes(guess) && isFirst
    return <Guess {...{ guess, correctGuess }}/>
  }

  return <div>
    <div className="last-guess">{lastGuess && lastGuess.toUpperCase()}</div>
    <div className="guess-list">{indexedMap(makeGuess, guessesReversed)}</div>
  </div>
}

export default Guesses
