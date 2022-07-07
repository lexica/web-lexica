import { useContext } from 'react'
import { ReactComponent as PlayCircle } from '@material-design-icons/svg/round/play_circle.svg'
import { ReactComponent as Refresh } from '@material-design-icons/svg/round/refresh.svg'

import GameModeDetails from './GameModeDetails'

import { Dictionary } from '../game/dictionary'
import { Translations } from '../translations'
import { Language } from '../game/language'

import './StartScreen.css'
import ShareGameQrCode, { Platform } from './game/ShareGameQrCode'
import { Rules } from '../game/rules'
import { Board } from '../game/board/hooks'
import Button, { ButtonFontSizing, ButtonThemeType } from './Button'

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
  const dictionary = useContext(Dictionary)
  const translations = useContext(Translations)
  const rules = useContext(Rules)
  const board = useContext(Board)

  const showRefreshButton = loading === false && error === false && showQrCode
  const disabled = loading || error
  const wordCount = loading
    ? 'Loading...'
    : error
    ? 'Error loading board'
    : `${dictionary.boardDictionary.length} words`

  const languageTitle = translations.ready ? translations.languageTitlesFn(language as any) : language

  const qrCode = showQrCode === true && <ShareGameQrCode {...{ rules, language, board, platform: Platform.Android,  }}/>

  return <div className="start-screen">
    <div className="start-screen-title">{pageTitle}</div>
    <div className="start-screen-language">{languageTitle}</div>
    <GameModeDetails/>
    <div className="start-screen-action-bar">
      <div className="start-screen-word-count">{wordCount}</div>
      {showRefreshButton && <Button onClick={handleBoardRefresh} prompt='Refresh Board' svg={Refresh} />}
    </div>
    <div className="start-screen-share-game-qr-code">{!loading && qrCode}</div>
    <div className="start-screen-start-prompt">When all players are ready, you should all start the game at the same time.</div>
    <Button
      fontSizing={ButtonFontSizing.Title}
      svg={PlayCircle}
      prompt='Start game'
      onClick={handleStart}
      roundedEdges={false}
      themeType={ButtonThemeType.Emphasis}
      disabled={disabled}
    />
  </div>
}

export default StartScreen
