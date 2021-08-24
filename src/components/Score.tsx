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
  remainingTime: number
}> = ({
  remainingWords,
  foundWords,
  remainingTime
}) => {
  const totalScore = foundWords.reduce((score: number, word: string) => scoreWord(word) + score, 0)
  const foundCount = foundWords.length
  const remainingCount = remainingWords.length
  return (
    <div className="container">
      <div className="section">
        <div className="title">Time</div>
        <div className="info">{getTime(remainingTime)}</div>
      </div>
      <div className="section">
        <div className="title">Words</div>
        <div className="info">{`${foundCount}/${remainingCount + foundCount}`}</div>
      </div>
      <div className="section">
        <div className="title">Score</div>
        <div className="info">{totalScore}</div>
      </div>
    </div>
  )
}

export default Score
