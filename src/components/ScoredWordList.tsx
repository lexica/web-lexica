import * as R from 'ramda'

import { orderByWordScore, ScoreType, scoreWord } from "../game";

import './ScoredWordList.css'

export type FoundWordsProps = { foundWords: string[], scoreType: ScoreType }

const FoundWords: React.FC<FoundWordsProps> = ({ foundWords, scoreType }) => {
  const orderedWords = orderByWordScore(foundWords, scoreType)

  const makeFoundWord = (word: string) =>  <div className="found-words-word">{word.toUpperCase()}</div> 
  const makeScore = (word: string) => <div className="found-words-score">+{scoreWord(word, scoreType)}</div>

  return <div className="found-words-container">
    <div className="found-words-words">{R.map(makeFoundWord, orderedWords)}</div>
    <div className="found-words-scores">{R.map(makeScore, orderedWords)}</div>
    </div>
}

export default FoundWords
