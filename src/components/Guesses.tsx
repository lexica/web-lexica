import * as R from 'ramda'

import './Guesses.css'

type GuessProps = {
  guess: string,
  isFirstGuess: boolean,
  isInDictionary: boolean
  key: number
}
const Guess: React.FC<GuessProps> = ({ guess, isFirstGuess, isInDictionary, key }) => {
  const className = isFirstGuess && isInDictionary
    ? 'correct-guess'
    : isInDictionary
      ? 'repeat-guess'
      : 'incorrect-guess'

  return <div {...{ className, key }}>{guess.toUpperCase()}</div>
}

const getGuessInfo = (guess: string, guesses: string[], dictionary: string[], index: number = 0) => {
  const isFirstGuess = guesses.lastIndexOf(guess) === index
  const isInDictionary = dictionary.includes(guess) 

  return { isFirstGuess, isInDictionary }
}

export type GuessesProps = {
 guesses: string[],
 dictionary: string[],
}

const Guesses: React.FC<GuessesProps> = ({ guesses, dictionary }) => {
  const guessesReversed = R.reverse(guesses)
  const indexedMap = R.addIndex<string, JSX.Element>(R.map)

  const makeGuess = (guess: string, index: number) => {
    const guessInfo = getGuessInfo(guess, guessesReversed, dictionary, index)
    return <Guess {...{ guess, ...guessInfo, key: index }}/>
  }



  return <div className="guess-list" >
    {indexedMap(makeGuess, guessesReversed)}
  </div>
}

export default Guesses
