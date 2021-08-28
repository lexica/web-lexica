import './Results.css'
import { orderByWordScore, useGameParameters } from "../game"
import ScoredWordList from './ScoredWordList'

const Results: React.FC<{ foundWords: string[], remainingWords: string[] }> = ({
  foundWords,
  remainingWords,
}) => {
  const { score: scoreType } = useGameParameters()
  const orderedFoundWords = orderByWordScore(foundWords)
  const orderedMissedWords = orderByWordScore(remainingWords)

  return <div className="results">
    <div className="titles">
      <div>Found Words</div>
      <div>Missed Words</div>
    </div>
    <div className="results-main-container">
      <ScoredWordList {...{
        scoredWords: orderedFoundWords,
        scoreType
      }}/>
      <ScoredWordList {...{
        scoredWords: orderedMissedWords,
        scoreType
      }}/>
    </div>
  </div>
}

export default Results
