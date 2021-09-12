import * as R from 'ramda'

import { LetterScores, orderByWordScore, scoreWord } from '../game';
import { Rules } from '../game/rules'

import './ScoredWordList.css'
import '../style/scrollbar.css'
import { useContext } from 'react';

export type ScoredWordsProps = { scoredWords: string[] }

const ScoredWords: React.FC<ScoredWordsProps> = ({ scoredWords }) => {
  const { score: scoreType } = useContext(Rules)
  const letterScores = useContext(LetterScores)
  const orderedWords = orderByWordScore(scoredWords, scoreType, letterScores)

  const mapWithIndex = R.addIndex<string, JSX.Element>(R.map)

  const makeScoredWord = (word: string, index: number) =>  <div className="scored-words-word" key={index}>{word.toUpperCase()}</div> 
  const makeScore = (word: string, index: number) => <div className="scored-words-score" key={index}>+{scoreWord(word, scoreType, letterScores)}</div>

  return <div className="scored-words-container scrollbar">
    <div className="scored-words-words">{mapWithIndex(makeScoredWord, orderedWords)}</div>
    <div className="scored-words-scores">{mapWithIndex(makeScore, orderedWords)}</div>
    </div>
}

export default ScoredWords
