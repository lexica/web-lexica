import * as R from 'ramda'

import { orderByWordScore, scoreWord } from '../game';
import { Rules } from '../game/rules'

import './ScoredWordList.css'
import '../style/scrollbar.css'
import { useContext } from 'react';

export type ScoredWordsProps = { scoredWords: string[] }

const ScoredWords: React.FC<ScoredWordsProps> = ({ scoredWords }) => {
  const { language, score: scoreType } = useContext(Rules)
  const orderedWords = orderByWordScore(scoredWords, scoreType, language)

  const makeScoredWord = (word: string) =>  <div className="scored-words-word">{word.toUpperCase()}</div> 
  const makeScore = (word: string) => <div className="scored-words-score">+{scoreWord(word, scoreType, language)}</div>

  return <div className="scored-words-container scrollbar">
    <div className="scored-words-words">{R.map(makeScoredWord, orderedWords)}</div>
    <div className="scored-words-scores">{R.map(makeScore, orderedWords)}</div>
    </div>
}

export default ScoredWords
