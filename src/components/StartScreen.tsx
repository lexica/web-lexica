import { useContext } from 'react'
import { ReactComponent as PlayCircle } from '@material-design-icons/svg/round/play_circle.svg'

import GameModeDetails from './GameModeDetails'

import constants, { useConstants } from '../style/constants'
import { Dictionary } from '../game/dictionary'
import { Translations } from '../translations'
import { Translation } from '../translations/implemented-languages'
import { Language } from '../game/language'

import './StartScreen.css'
import ShareGameQrCode, { Platform } from './game/ShareGameQrCode'
import { Rules } from '../game/rules'
import { Board } from '../game/board/hooks'

export type StartScreenProps = {
  handleStart: () => any
  loading: boolean,
  error: boolean,
  showQrCode?: boolean,
  handleBoardRefresh?: () => void,
  pageTitle: string
}

const StartScreen: React.FC<StartScreenProps> = ({
  handleStart,
  loading,
  error,
  showQrCode,
  pageTitle,
  handleBoardRefresh
}) => {
  const languageContext = useContext(Language)

  const language = languageContext.metadata.name

  const { fontSizeTitle } = useConstants()

  const dictionary = useContext(Dictionary)

  const translations = useContext(Translations)

  const rules = useContext(Rules)

  const board = useContext(Board)

  const showRefreshButton = loading === false && error === false && typeof handleBoardRefresh === 'function'

  const startButtonClass = loading || error
    ? 'start-screen-start-button-disabled'
    : 'start-screen-start-button'
  const disabled = loading || error

  const wordCount = loading
    ? 'Loading...'
    : error
    ? 'Error loading board'
    : `${dictionary.boardDictionary.length} words`

  const languageTitle = translations.languageTitles[
    language as any as keyof Translation['languageTitles']
  ]

  const qrCode = showQrCode === true && <ShareGameQrCode {...{ rules, language, board, platform: Platform.Android,  }}/>

  return <div className="start-screen">
    <div className="start-screen-title">{pageTitle}</div>
    <div className="start-screen-language">{languageTitle}</div>
    <GameModeDetails/>
    <div className="start-screen-action-bar">
      <div className="start-screen-word-count">{wordCount}</div>
      {showRefreshButton && <div
        className="start-screen-refresh-board-button"
        onClick={() => (handleBoardRefresh!)()}
      >
        Refresh Board
      </div>}
    </div>
    <div className="start-screen-share-game-qr-code">{!loading && qrCode}</div>
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
