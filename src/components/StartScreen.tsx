import { useContext } from 'react'

import constants, { useConstants } from '../style/constants'

import './StartScreen.css'
import { ReactComponent as Timer } from '@material-design-icons/svg/round/timer.svg'
import { ReactComponent as GridView } from '@material-design-icons/svg/round/grid_view.svg'
import { ReactComponent as EmojiEvents } from '@material-design-icons/svg/round/emoji_events.svg'
import { ReactComponent as Sort } from '@material-design-icons/svg/round/sort.svg'
import { ReactComponent as PlayCircle } from '@material-design-icons/svg/round/play_circle.svg'
import { Rules } from '../game/rules'
import { Dictionary } from '../game/dictionary'
import { Translations } from '../translations'

const getScoringType = (scoringType: string): string => ({
  'l': 'Letter Points',
  'w': 'Word Length'
}[scoringType] as any)

const getReadableTime = (time: number) => {
  const minutes = Math.floor(time / 60)
  if (minutes === 1) return '1 min'
  return `${minutes} mins`
}

export type StartScreenProps = {
  handleStart: () => any
  loading: boolean,
  error: boolean
}

const StartScreen: React.FC<StartScreenProps> = ({
  handleStart,
  loading,
  error
}) => {
  const rules = useContext(Rules)

  const { fontSize, fontSizeTitle } = useConstants()

  const dictionary = useContext(Dictionary)

  const gridSize = Math.floor(Math.sqrt(rules.board.length))

  const translations = useContext(Translations)

  const startButtonClass = loading || error
    ? 'start-screen-start-button-disabled'
    : 'start-screen-start-button'
  const disabled = loading || error

  const wordCount = loading
    ? 'Loading...'
    : error
    ? 'Error loading board'
    : `${dictionary.boardDictionary.length} words`

  return <div className="start-screen">
    <div className="start-screen-title">Web Lexica Multiplayer Game</div>
    <div className="start-screen-language">{translations.languageTitles[rules.language]}</div>
    <div className="start-screen-info-container">
      <div className="start-screen-info">
        <Timer
          title="Time"
          fill={constants.colorContentDark}
          width={fontSize}
          height={fontSize}
        />
        <div>{getReadableTime(rules.time)}</div>
      </div>
      <div className="start-screen-info">
        <GridView
          title="Grid-Size"
          fill={constants.colorContentDark}
          width={fontSize}
          height={fontSize}
        />
        <div>{gridSize}x{gridSize}</div>
      </div>
      <div className="start-screen-info">
        <EmojiEvents
          title="Scoring"
          fill={constants.colorContentDark}
          width={fontSize}
          height={fontSize}
        />
        <div>{getScoringType(rules.score)}</div>
      </div>
      <div className="start-screen-info">
        <Sort
          title="Minimum Word Length"
          fill={constants.colorContentDark}
          width={fontSize}
          height={fontSize}
        />
        <div>&ge; {rules.minimumWordLength}</div>
      </div>
    </div>
    <div className="start-screen-word-count">{wordCount}</div>
    <div className="start-screen-start-prompt">When all players are ready, you should all start the game at the same time.</div>
    <div
      className={`start-screen-start-button-universal ${startButtonClass}`}
      onClick={disabled ? undefined : handleStart}
    >
      <PlayCircle
        title="Start"
        fill={disabled ? constants.colorBackgroundDark : constants.colorBackgroundLight}
        width={fontSizeTitle}
        height={fontSizeTitle}
      />
      <div>Start game</div>
    </div>
  </div>
}

export default StartScreen
