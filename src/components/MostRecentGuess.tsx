import * as R from 'ramda'
import { ScoreType, scoreWord } from "../game"

export type MostRecentGuessProps = {
  guesses: string[],
  dictionary: string[],
  scoreType: ScoreType
}

const isCorrectGuess = (guess: string, guesses: string[], dictionary: string[], index: number = 0) => {
  const isFirstGuess = guesses.lastIndexOf(guess) === index
  const isInDictionary = dictionary.includes(guess) 

  return isFirstGuess && isInDictionary
}

const MostRecentGuess: React.FC<MostRecentGuessProps> = ({
  guesses,
  dictionary,
  scoreType
}) => {
  const guessesReversed = R.reverse(guesses)
  const mostRecentGuess = R.head(guessesReversed) || ''

  const shouldScoreWord = mostRecentGuess && isCorrectGuess(mostRecentGuess, guessesReversed, dictionary)
  const score = shouldScoreWord ? `+${scoreWord(mostRecentGuess, scoreType)}` : ''

  return <div className="last-guess">{mostRecentGuess && `${mostRecentGuess.toUpperCase()}${score}`}</div>
}

export default MostRecentGuess
