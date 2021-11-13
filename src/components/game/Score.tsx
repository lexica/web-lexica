import { useContext, useEffect, useMemo, useState } from 'react'

import { LetterScores, scoreWord } from '../../game'
import { Score as ScoreContext} from '../../game/score'
import { Rules } from '../../game/rules'
import './Score.css'
import { secondsBetweenDates, Timer, TimerContext } from '../../game/timer'

const getTime = (timeInSeconds: number) => {
  const seconds = timeInSeconds % 60
  const minutes = Math.floor(timeInSeconds / 60)
  const getFormatted = (num: number) => (num < 0 ? 0 : num).toString().padStart(2, '0')
  return `${getFormatted(minutes)}:${getFormatted(seconds)}`
}

const getRemainingTime = (remainingTime: number, { startTime }: TimerContext['state']) => {
  return remainingTime - secondsBetweenDates(startTime, new Date())
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

  const { state } = useContext(Timer)

  const [remainingTime, setRemainingTime] = useState(getRemainingTime(state.remainingTime, state))

  const { foundWords, remainingWords } = useContext(ScoreContext)


  useEffect(() => {
    const { remainingTime } = state
    const interval = setInterval((() => setRemainingTime(getRemainingTime(remainingTime, state))), 400)

    return () => interval && clearInterval(interval)
  }, [state, setRemainingTime, state.remainingTime])

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
