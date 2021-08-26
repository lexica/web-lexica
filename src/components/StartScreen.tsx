import { useState } from 'react'
import { useLocation } from 'react-router-dom'

import { parseGameParameters, GameURLParams } from '../game'
import { parseURLSearch } from '../util/url'

import './StartScreen.css'

const getLanguageName = (languageCode: string): string => ({
  en_US: 'English (US)'
}[languageCode] as any)

const getScoringType = (scoringType: string): string => ({
  'l': 'Letter',
  'w': 'Word'
}[scoringType] as any)

const getReadableTime = (time: number) => {
  const minutes = Math.floor(time / 60)
  if (minutes === 1) return '1 min'
  return `${minutes} mins`
}

const StartScreen: React.FC<{handleStart: () => any}> = ({ handleStart }) => {
  const location = useLocation()
  const [gameParams] = useState(parseGameParameters(parseURLSearch<GameURLParams>(location.search)))

  const gridSize = Math.floor(Math.sqrt(gameParams.board.length))

  return <div className="start-screen">
    <div className="start-screen-title">Web Lexica Multiplayer Game</div>
    <div className="start-screen-language">{getLanguageName(gameParams.language)}</div>
    <div className="start-screen-info-container">
      <div className="start-screen-info">
        <img alt="time"/>
        <div>{getReadableTime(gameParams.time)}</div>
      </div>
      <div className="start-screen-info">
        <img alt="grid size"/>
        <div>{gridSize}x{gridSize}</div>
      </div>
      <div className="start-screen-info">
        <img alt="scoring"/>
        <div>{getScoringType(gameParams.score)} Points</div>
      </div>
    </div>
    <div className="start-screen-start-prompt">When all players are ready, join the game.</div>
    <div className="start-screen-start-button" onClick={handleStart}>Join game</div>
  </div>
}

export default StartScreen
