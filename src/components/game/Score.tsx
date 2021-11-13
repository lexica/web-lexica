import { useContext, useMemo } from 'react'

import { LetterScores, scoreWord } from '../../game'
import { Score as ScoreContext} from '../../game/score'
import { Rules } from '../../game/rules'
import './Score.css'
import { Timer } from '../../game/timer'
import { useInterval } from '../../util/interval'

const getTime = (timeInSeconds: number) => {
  const seconds = timeInSeconds % 60
  const minutes = Math.floor(timeInSeconds / 60)
  const getFormatted = (num: number) => (num < 0 ? 0 : num).toString().padStart(2, '0')
  return `${getFormatted(minutes)}:${getFormatted(seconds)}`
}

const Score: React.FC<{
  hideTime?: boolean,
  showPercent?: boolean
}> = ({
  hideTime,
  showPercent
}) => {
  const { score: scoreType } = useContext(Rules)
  const letterScores = useContext(LetterScores)

  const { foundWords, remainingWords } = useContext(ScoreContext)

  const { getRemainingTime } = useContext(Timer)

  const remainingTime = useInterval(getRemainingTime, 400)

  const currentScore = useMemo(() => foundWords.reduce(
    (score: number, word: string) => scoreWord(word, scoreType, letterScores) + score,
    0
  ), [scoreType, letterScores, foundWords])
  const totalScore = useMemo(() => remainingWords.reduce(
    (score: number, word: string) => scoreWord(word, scoreType, letterScores) + score,
    0
  ), [scoreType, letterScores, remainingWords]) + currentScore
  const foundCount = foundWords.length
  const totalCount = remainingWords.length + foundCount
  return (
    <div className="container">
      <div
        className="section"
        style={hideTime ? { display: 'none'} : {}}
      >
        <div className="title">Time</div>
        <div className="info">{getTime(remainingTime || 0)}</div>
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
