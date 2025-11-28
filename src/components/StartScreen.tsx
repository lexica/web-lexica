import { useCallback, useContext, useMemo } from 'react'
import PlayCircle from '@material-design-icons/svg/round/play_circle.svg'
import Refresh from '@material-design-icons/svg/round/refresh.svg'
import Android from '@material-design-icons/svg/round/android.svg'
import CheckBox from '@material-design-icons/svg/round/check_box.svg'
import CheckBoxOutlineBlank from '@material-design-icons/svg/round/check_box_outline_blank.svg'

import GameModeDetails from './GameModeDetails'

import { Dictionary } from '../game/dictionary'
import { Translations } from '../translations'
import { Language } from '../game/language'

import './StartScreen.css'
import ShareGameQrCode, { Platform } from './game/ShareGameQrCode'
import { Rules } from '../game/rules'
import { Board } from '../game/board/hooks'
import Button, { ButtonFontSizing, ButtonThemeType } from './Button'
import type { TranslationsFn } from '../translations/types'
import { isAndroidClient, memoizedRedirectToApp, useAndroidInteropSettings, redirectToApp } from '../util/android-interop'
import { useStaticValue } from '../util/hooks'
import { logger } from '../util/logger'
import { MaybeRender } from '../util/elements'

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

  const { translationsFn } = useContext(Translations)
  const { autoAppRedirect, setAutoAppRedirect } = useAndroidInteropSettings()

  const openInAppPrompt = translationsFn('pages.multiplayer.openInAppPrompt')
  const alwaysOpenInAppPrompt = translationsFn('pages.multiplayer.alwaysOpenInAppPrompt')
  const alwaysOpenInAppConfirmation = translationsFn('pages.multiplayer.alwaysOpenInAppConfirmation')

  return (
    <>
      <div className='start-screen-android-app-redirect-options'>
        <Button
          svg={Android}
          prompt={openInAppPrompt}
          svgTitle={openInAppPrompt}
          onClick={handleRedirect}
        />
        <Button
          svg={autoAppRedirect ? CheckBox : CheckBoxOutlineBlank}
          prompt={alwaysOpenInAppPrompt}
          svgTitle={alwaysOpenInAppPrompt}
          onClick={() => setAutoAppRedirect(!autoAppRedirect)}
          nowrap
        />
      </div>
      <MaybeRender maybeRender={autoAppRedirect} >
        <div className="start-screen-auto-redirect-hint">
          {alwaysOpenInAppConfirmation}
        </div>
      </MaybeRender>
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
          prompt={translationsFn('pages.multiplayer.openInAppPrompt')}
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
    <MaybeRender maybeRender={showAppRedirectOption} >
      <RedirectToAndroid handleRedirect={handleAppRedirect} />
    </MaybeRender>
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
