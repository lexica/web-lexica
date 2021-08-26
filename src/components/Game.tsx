import { useState, useEffect } from 'react' 
import { useLocation } from 'react-router-dom'

import { useGame, GameURLParams } from '../game'
import { ElementIdentifier, useElementSize, useInterval } from '../util/hooks'
import { parseURLSearch } from '../util/url'
 
import Board from './Board'
import Score from './Score'
import Guesses from './Guesses'
import MostRecentGuess from './MostRecentGuess'
import ScoredWordList from './ScoredWordList'
import { HorizontalContainer, VerticalContainer } from './game/layouts'


const getTimeDifference = (start: Date, end: Date) => ((end as any) - (start as any)) as number

const getRemainingTimeUnapplied = (startTime: Date, totalTime: number) => () => {
  const timePassedInMs: number = (new Date() as any - (startTime as any))
  const timePassed = Math.floor(timePassedInMs / 1000)
  return totalTime - timePassed
}

const Game: React.FC<{ handleFinish: (foundWords: string[], remainingWords: string[]) => void }> = ({
  handleFinish
}) => {
  const [startedAt] = useState(new Date())

  const location = useLocation()

  const searchParams = parseURLSearch<GameURLParams>(location.search)

  const [game, dispatch, gameParameters] = useGame(searchParams)

  const getRemainingTime = getRemainingTimeUnapplied(startedAt, gameParameters.time)
  const [remainingTime, stopInterval] = useInterval<number>(getRemainingTime, 500, 0)

  const { size: { height, width } } = useElementSize(ElementIdentifier.Class, 'game-container')

  const useVerticalLayout = height >= width

  const {
    remainingWords,
    foundWords,
    currentLetterChain
  } = game
  const gameIsOver = getTimeDifference(startedAt, new Date()) > (gameParameters.time * 1000)

  useEffect(() => stopInterval, [stopInterval])

  useEffect(() => {
    if (gameIsOver) {
     stopInterval()
     handleFinish(foundWords, remainingWords)
    }
  }, [gameIsOver, handleFinish, foundWords, remainingWords, stopInterval])


  const scoreType = gameParameters.score

  const guessProps = {
    guesses: game.guessedWords,
    dictionary: game.foundWords,
    scoreType
  }

  const board = <Board board={game.board} context={dispatch} />
  const mostRecentGuesses = <MostRecentGuess {...{ ...guessProps, currentLetterChain }}/>
  const guesses = <Guesses {...guessProps} />
  const score = <Score {...{ remainingWords, foundWords, remainingTime: remainingTime <= 0 ? 0 : remainingTime }}/>
  const foundWordsComponent = <ScoredWordList {...{ scoredWords: foundWords, scoreType }} />


  const verticalLayout = <VerticalContainer
    Board={board}
    MostRecentGuess={mostRecentGuesses}
    Guesses={guesses}
    Score={score}
  />

  const horizontalLayout = <HorizontalContainer
    Board={board}
    MostRecentGuess={mostRecentGuesses}
    Guesses={guesses}
    Score={score}
    FoundWords={foundWordsComponent}
  />

  const layout = useVerticalLayout ? verticalLayout : horizontalLayout;
  return <div className="game-container" style={{ height: '100%' }}>{layout}</div>
}

export default Game
