import * as R from 'ramda'

import { orderByWordScore, ScoreType, scoreWord } from "../game";

export type FoundWordsProps = { foundWords: string[], scoreType: ScoreType }

const FoundWords: React.FC<FoundWordsProps> = ({ foundWords, scoreType }) => {
  const orderedWords = orderByWordScore(foundWords, scoreType)
  const makeFoundWord = (word: string) => <div className="found-word-container">
    <div className="word">{word}</div>
    <div className="score">+{scoreWord(word, scoreType)}</div>
  </div>
  return <div className="found-words-container">{R.map(makeFoundWord, orderedWords)}</div>
}

export default FoundWords
