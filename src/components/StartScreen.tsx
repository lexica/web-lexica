import { useState } from 'react'
import { useLocation } from 'react-router-dom'

import { parseGameParameters, GameURLParams } from '../game'
import { parseURLSearch } from '../util/url'
import constants, { useConstants } from '../style/constants'

import './StartScreen.css'
import { ReactComponent as Timer } from '@material-design-icons/svg/round/timer.svg'
import { ReactComponent as GridView } from '@material-design-icons/svg/round/grid_view.svg'
import { ReactComponent as EmojiEvents } from '@material-design-icons/svg/round/emoji_events.svg'
import { ReactComponent as Sort } from '@material-design-icons/svg/round/sort.svg'
import { ReactComponent as PlayCircle } from '@material-design-icons/svg/round/play_circle.svg'

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

export type StartScreenProps = {
  handleStart: () => any
  dictionary: string[],
  loading: boolean,
  error: boolean
}

const StartScreen: React.FC<StartScreenProps> = ({
  handleStart,
  dictionary,
  loading,
  error
}) => {
  const location = useLocation()
  const [gameParams] = useState(parseGameParameters(parseURLSearch<GameURLParams>(location.search)))

  const { fontSize, fontSizeTitle } = useConstants()

  console.log(JSON.stringify({ fontSize }))

  const gridSize = Math.floor(Math.sqrt(gameParams.board.length))

  const startButtonClass = loading || error
    ? 'start-screen-start-button-disabled'
    : 'start-screen-start-button'
  const disabled = loading || error

  const wordCount = loading
    ? 'Loading...'
    : error
    ? 'Error loading board'
    : `${dictionary.length} words`

  return <div className="start-screen">
    <div className="start-screen-title">Web Lexica Multiplayer Game</div>
    <div className="start-screen-language">{getLanguageName(gameParams.language)}</div>
    <div className="start-screen-info-container">
      <div className="start-screen-info">
        <Timer
          title="time"
          fill={constants.colorContentDark}
          width={fontSize}
          height={fontSize}
        />
        <div>{getReadableTime(gameParams.time)}</div>
      </div>
      <div className="start-screen-info">
        <GridView
          title="grid-size"
          fill={constants.colorContentDark}
          width={fontSize}
          height={fontSize}
        />
        <div>{gridSize}x{gridSize}</div>
      </div>
      <div className="start-screen-info">
        <EmojiEvents
          title="grid-size"
          fill={constants.colorContentDark}
          width={fontSize}
          height={fontSize}
        />
        <div>{getScoringType(gameParams.score)} Points</div>
      </div>
      <div className="start-screen-info">
        <Sort
          title="word-length"
          fill={constants.colorContentDark}
          width={fontSize}
          height={fontSize}
        />
        <div>&ge; {gameParams.minimumWordLength}</div>
      </div>
    </div>
    <div className="start-screen-word-count">{wordCount}</div>
    <div className="start-screen-start-prompt">When all players are ready, you should all start the game at the same time.</div>
    <div
      className={`start-screen-start-button-universal ${startButtonClass}`}
      onClick={disabled ? undefined : handleStart}
    >
      <PlayCircle
        title="start-game"
        fill={disabled ? constants.colorBackgroundDark : constants.colorBackgroundLight}
        width={fontSizeTitle}
        height={fontSizeTitle}
      />
      <div>Start game</div>
    </div>
  </div>
}

export default StartScreen
