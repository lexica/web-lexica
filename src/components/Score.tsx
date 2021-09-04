import { scoreWord } from '../game'
import './Score.css'

const getTime = (timeInSeconds: number) => {
  const seconds = timeInSeconds % 60
  const minutes = Math.floor(timeInSeconds / 60)
  const getFormatted = (num: number) => (num < 0 ? 0 : num).toString().padStart(2, '0')
  return `${getFormatted(minutes)}:${getFormatted(seconds)}`
}

const Score: React.FC<{
  remainingWords: string[],
  foundWords: string[],
  remainingTime: number,
  hideTime?: boolean,
  showPercent?: boolean
}> = ({
  remainingWords,
  foundWords,
  remainingTime,
  hideTime,
  showPercent
}) => {
  const currentScore = foundWords.reduce((score: number, word: string) => scoreWord(word) + score, 0)
  const totalScore = remainingWords.reduce((score: number, word: string) => scoreWord(word) + score, 0) + currentScore
  const foundCount = foundWords.length
  const totalCount = remainingWords.length + foundCount
  return (
    <div className="container">
      <div
        className="section"
        style={hideTime ? { display: 'none'} : {}}
      >
        <div className="title">Time</div>
        <div className="info">{getTime(remainingTime)}</div>
      </div>
      <div className="section">
        <div className="title">Words</div>
        <div className="info">
          {foundCount}/{totalCount}{showPercent ? ` (${Math.floor((foundCount/totalCount) * 100)}%)` : '' }
        </div>
      </div>
      <div className="section">
        <div className="title">Score</div>
        <div className="info">
          {currentScore}/{totalScore}{showPercent ? ` (${Math.floor((currentScore/totalScore) * 100)}%)` : ''}
        </div>
      </div>
    </div>
  )
}

export default Score
