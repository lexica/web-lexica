import { useState, useEffect } from 'react' 
import { useLocation } from 'react-router-dom'

import { useGame, GameURLParams } from '../game'
import { useInterval } from '../util/hooks'
import { parseURLSearch } from '../util/url'
 
import Board from './Board'
import Score from './Score'
import Guesses from './Guesses'

const getTimeDifference = (start: Date, end: Date) => ((end as any) - (start as any)) as number

const Game: React.FC<{ handleFinish: (foundWords: string[], remainingWords: string[]) => void }> = ({
  handleFinish
}) => {
  const [startedAt] = useState(new Date())

  const getRemainingTime = () => {
    const timePassedInMs: number = (new Date() as any - (startedAt as any))
    const timePassed = Math.floor(timePassedInMs / 1000)
    return time - timePassed
  }
  
  const [remainingTime, stopInterval] = useInterval<number>(getRemainingTime, 500, 0)

  const location = useLocation()

  const searchParams = parseURLSearch<GameURLParams>(location.search)

  const [game, dispatch, gameParameters] = useGame(searchParams)

  const { time } = gameParameters

  const {
    remainingWords,
    foundWords
  } = game
  const gameIsOver = getTimeDifference(startedAt, new Date()) > (time * 1000)

  useEffect(() => stopInterval, [stopInterval])

  useEffect(() => {
    if (gameIsOver) {
     stopInterval()
     handleFinish(foundWords, remainingWords)
    }
  }, [gameIsOver, handleFinish, foundWords, remainingWords, stopInterval])

  return (
      <div className="App">
        <Board board={game.board} context={dispatch} />
        <Guesses guesses={game.guessedWords} dictionary={game.foundWords} />
        <Score {...{ remainingWords, foundWords, remainingTime: remainingTime <= 0 ? 0 : remainingTime }}/>
      </div>
  );
}

export default Game
