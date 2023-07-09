import { useCallback, useContext, useMemo } from 'react'
import { ReactComponent as PlayCircle } from '@material-design-icons/svg/round/play_circle.svg'
import { ReactComponent as Refresh } from '@material-design-icons/svg/round/refresh.svg'
import { ReactComponent as Android } from '@material-design-icons/svg/round/android.svg'
import { ReactComponent as CheckBox } from '@material-design-icons/svg/round/check_box.svg'
import { ReactComponent as CheckBoxOutlineBlank } from '@material-design-icons/svg/round/check_box_outline_blank.svg'

import GameModeDetails from './GameModeDetails'

import { Dictionary } from '../game/dictionary'
import { Translations } from '../translations'
import { Language } from '../game/language'

import './StartScreen.css'
import ShareGameQrCode, { Platform } from './game/ShareGameQrCode'
import { Rules } from '../game/rules'
import { Board } from '../game/board/hooks'
import Button, { ButtonFontSizing, ButtonThemeType } from './Button'
import { TranslationsFn } from '../translations/types'
import { isAndroidClient, memoizedRedirectToApp, useAndroidInteropSettings, redirectToApp } from '../util/android-interop'
import { useStaticValue } from '../util/hooks'
import { logger } from '../util/logger'

export type StartScreenProps = {
  handleStart: () => any
  loading: boolean,
  error: boolean,
  showQrCode?: boolean,
  handleBoardRefresh?: () => void,
  pageTitle: string
}

const getTranslatedStrings = (joiningGame: boolean, translationsFn: TranslationsFn) => {
  return joiningGame ? {
    startGameButtonPrompt: translationsFn('pages.multiplayer.joinGame'),
    startGameHint: translationsFn('pages.multiplayer.joinGameHint'),
  } : {
    startGameButtonPrompt: translationsFn('pages.multiplayer.startGame'),
    startGameHint: translationsFn('pages.multiplayer.startGameHint'),
  }
}

const RedirectToAndroid = (props: {
  handleRedirect: () => void
}): JSX.Element => {
  const {
    handleRedirect
  } = props

  const { autoAppRedirect, setAutoAppRedirect } = useAndroidInteropSettings()

  return (
    <>
      <div className='start-screen-android-app-redirect-options'>
        <Button
          svg={Android}
          prompt="Open in App"
          svgTitle="Open in App"
          onClick={handleRedirect}
        />
        <Button
          svg={autoAppRedirect ? CheckBox : CheckBoxOutlineBlank}
          prompt="Always Open in App"
          svgTitle="Always Open in App"
          onClick={() => setAutoAppRedirect(!autoAppRedirect)}
          nowrap
        />
      </div>
      {autoAppRedirect ? <div className="start-screen-auto-redirect-hint">
        Shared games will now always open in app. You can change this setting in preferences.
      </div> : ''}
    </>
  )
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
  const { translationsFn, languageTitlesFn } = useContext(Translations)
  const translations = useMemo(() => getTranslatedStrings(!showQrCode, translationsFn), [showQrCode, translationsFn])
  const dictionary = useContext(Dictionary)
  const rules = useContext(Rules)
  const board = useContext(Board)

  const showRefreshButton = loading === false && error === false && showQrCode
  const disabled = loading || error
  const wordCount = loading
    ? translationsFn('general.loading')
    : error
    ? translationsFn('general.error')
    : translationsFn('pages.multiplayer.wordCount', { count: dictionary.boardDictionary.length })

  const languageTitle = languageTitlesFn(language as any)

  const qrCode = showQrCode === true && <ShareGameQrCode {...{ rules, language, board, platform: Platform.Android }}/>

  const { autoAppRedirect } = useAndroidInteropSettings()

  const showBigRedirectButton = useStaticValue(!showQrCode && autoAppRedirect)

  const handleAppRedirect = useCallback(() => {
    logger.debug('calling app redirect')
    redirectToApp({ ruleset: rules, board, language })
  }, [board, language, rules])

  const showAppRedirectOption = !showQrCode && isAndroidClient()

  if (showBigRedirectButton) {
    memoizedRedirectToApp({ ruleset: rules, board, language })
    return <div className="start-screen">
      <div className="start-screen-auto-open-in-app-button" >
        <Button
          fontSizing={ButtonFontSizing.Title}
          onClick={handleAppRedirect}
          prompt="Open In App"
          roundedEdges
          svg={Android}
          themeType={ButtonThemeType.Emphasis}
        />
      </div>
    </div>
  }

  return <div className="start-screen">
    <div className="start-screen-title">{pageTitle}</div>
    <div className="start-screen-language">{languageTitle}</div>
    <GameModeDetails/>
    <div className="start-screen-action-bar">
      <div className="start-screen-word-count">{wordCount}</div>
      {showRefreshButton && <Button onClick={handleBoardRefresh} prompt='Refresh Board' svg={Refresh} />}
    </div>
    <div className="start-screen-share-game-qr-code">{!loading && qrCode}</div>
    { showAppRedirectOption ? (<RedirectToAndroid handleRedirect={handleAppRedirect} />) : ''
    }
    <div className="start-screen-start-prompt">{translations.startGameHint}</div>
    <Button
      fontSizing={ButtonFontSizing.Title}
      svg={PlayCircle}
      prompt={translations.startGameButtonPrompt}
      onClick={handleStart}
      roundedEdges={false}
      themeType={ButtonThemeType.Emphasis}
      disabled={disabled}
    />
  </div>
}

export default StartScreen
