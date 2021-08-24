import * as R from 'ramda'

import './Results.css'
import { orderByWordScore, scoreWord } from "./game"

const Results: React.FC<{ foundWords: string[], remainingWords: string[] }> = ({
  foundWords,
  remainingWords
}) => {
  const orderedFoundWords = orderByWordScore(foundWords)
  const orderedMissedWords = orderByWordScore(remainingWords)

  const getWordList = R.map<string, JSX.Element>(word => <div className="word" key={word}>{word}</div>)
  const getScores = R.map<string, JSX.Element>(word => <div className="score" key={word}>{`+${scoreWord(word)}`}</div>)
  return <>
    <hr/>
    <div className="titles">
      <div>Found Words</div>
      <div>Missed Words</div>
    </div>
    <div className="main-container">
      <div className="words-and-scores">
          <div className="words">{getWordList(orderedFoundWords)}</div>
          <div className="scores">{getScores(orderedFoundWords)}</div>
      </div>
      <div className="words-and-scores">
        <div className="words">{getWordList(orderedMissedWords)}</div>
        <div className="scores">{getScores(orderedMissedWords)}</div>
      </div>
    </div>
  </>
}

export default Results
