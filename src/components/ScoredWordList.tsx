import * as R from 'ramda'

import { orderByWordScore, ScoreType, scoreWord } from "../game";

import './ScoredWordList.css'

export type ScoredWordsProps = { scoredWords: string[], scoreType: ScoreType }

const ScoredWords: React.FC<ScoredWordsProps> = ({ scoredWords, scoreType }) => {
  const orderedWords = orderByWordScore(scoredWords, scoreType)

  const makeScoredWord = (word: string) =>  <div className="scored-words-word">{word.toUpperCase()}</div> 
  const makeScore = (word: string) => <div className="scored-words-score">+{scoreWord(word, scoreType)}</div>

  return <div className="scored-words-container">
    <div className="scored-words-words">{R.map(makeScoredWord, orderedWords)}</div>
    <div className="scored-words-scores">{R.map(makeScore, orderedWords)}</div>
    </div>
}

export default ScoredWords
