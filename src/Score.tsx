import { useState } from 'react'
import { scoreWord } from './game'
import './Score.css'

const useInterval = <T extends any>(callback: (...args: any[]) => T, interval: number, initialValue?: T): [T, () => void] => {
  const [value, setValue] = useState<T | undefined>(initialValue)
  const [intervalValue] = useState(setInterval(() => setValue(callback), interval))

  const stopInterval = () => clearInterval(intervalValue)

  return [value as T, stopInterval]
}

const getTime = (timeInSeconds: number) => {
  const seconds = timeInSeconds % 60
  const minutes = Math.floor(timeInSeconds / 60)
  const getFormatted = (num: number) => (num < 0 ? 0 : num).toString().padStart(2, '0')
  return `${getFormatted(minutes)}:${getFormatted(seconds)}`
}

const Score: React.FC<{
  remainingWords: string[],
  foundWords: string[],
  time: number,
  startedAt: Date
}> = ({
  remainingWords,
  foundWords,
  time,
  startedAt
}) => {
  const getRemainingTime = () => {
    const timePassedInMs: number = (new Date() as any - (startedAt as any))
    const timePassed = Math.floor(timePassedInMs / 1000)
    return time - timePassed
  }
  
  const [remainingTime, stopInterval] = useInterval<number>(getRemainingTime, 500, 0)

  if (remainingTime <= 0) {
    stopInterval()
  }

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
