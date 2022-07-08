import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

import { LetterScores, scoreWord } from '../../game'
import { Score as ScoreContext} from '../../game/score'
import { Rules } from '../../game/rules'
import './Score.css'
import { secondsBetweenDates, Timer, TimerContext } from '../../game/timer'
import { Translations } from '../../translations'

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
  const rules = useContext(Rules)

  const remainingTimeRef = useRef(state.remainingTime)
  const { translationsFn } = useContext(Translations)

  const [remainingTime, setRemainingTime] = useState(getRemainingTime(state.remainingTime, state))
  const [showTimeAddition, setShowTimeAddition] = useState(false)
  const [timeAddition, setTimeAddition] = useState(0)

  const { foundWords, remainingWords } = useContext(ScoreContext)


  useEffect(() => {
    const { remainingTime } = state
    const interval = setInterval((() => setRemainingTime(getRemainingTime(remainingTime, state))), 400)

    return () => interval && clearInterval(interval)
  }, [state, setRemainingTime, state.remainingTime])

  useEffect(() => {
    if (!rules.timeAttack || state.remainingTime === remainingTimeRef.current)
      return

    const timeChange = state.remainingTime - remainingTimeRef.current
    remainingTimeRef.current = state.remainingTime
    setTimeAddition(timeChange)

    setShowTimeAddition(true)
    setTimeout(() => setShowTimeAddition(false), 1000)
  }, [rules, state.remainingTime, remainingTimeRef, setTimeAddition])

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

  const getBreakdownString = useCallback((found: number, total: number) => {
    if (!showPercent) return `${found}/${total}`

    const percentage = Math.floor((found/total) * 100)
    return translationsFn('scoreDetails.displayPercentage', { found, total, percentage })
  }, [showPercent, translationsFn])

  return (
    <div className="container">
      <div className="section" style={hideTime ? { display: 'none'} : {}} >
        <div className="title">{translationsFn('scoreDetails.time')}</div>
        <div className="info">{getTime(remainingTime || 0)}</div>
        {showTimeAddition ? <div className="score-time-addition">+{timeAddition}</div> : ''}
      </div>
      <div className="section">
        <div className="title">{translationsFn('scoreDetails.words')}</div>
        <div className="info">
          {getBreakdownString(foundCount, totalCount)}
        </div>
      </div>
      <div className="section">
        <div className="title">{translationsFn('scoreDetails.score')}</div>
        <div className="info">
          {getBreakdownString(currentScore, totalScore)}
        </div>
      </div>
    </div>
  )
}

export default Score
