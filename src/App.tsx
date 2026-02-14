
import { BrowserRouter, Route, Routes,  } from 'react-router-dom'
import { logger } from './util/logger'

import GameModes from './pages/GameModes'
import Home from './pages/Home'
import Lexicle from './pages/Lexicle'
import Preferences from './pages/Preferences'

import './App.css'
import './style/scrollbar.css'
import Banner, {
  RenderInBanner,
  useBannerContext
} from './components/Banner'
import Lexicons from './pages/Lexicons'
import NewGameMode from './pages/NewGameMode'
import SavedGames from './pages/SavedGames'
import { useTranslation } from 'react-i18next'
import { useCallback } from 'react'
import { Translations } from './translations'
import type { LanguageTitlesFn, TranslationsFn } from './translations/types'
import Languages from './pages/Languages'
import AndroidIntegration from './pages/AndroidIntegration'
import GameScreen from './pages/GameScreen'

const baseName = (["localhost", "127.0.0.1"].includes(window.location.hostname)) ? "/" : "/web-lexica"

function App() {
  logger.debug('loading app...')

  const { t: translationsFnUnwrapped, i18n: translationsI18n, ready: translationsReady } = useTranslation('translations', { useSuspense: false })
  const { t: languageTitlesFnUnwrapped, i18n: languageTitlesI18n, ready: languageTitlesReady } = useTranslation('language-titles', { useSuspense: false })
  const ready = translationsReady && languageTitlesReady

  const translationsFn = useCallback<TranslationsFn>((key, options) => {
    if (!ready) return key as any
    return translationsFnUnwrapped(key, options as any)
  }, [ready, translationsFnUnwrapped])
  const languageTitlesFn = useCallback<LanguageTitlesFn>((key, options) => {
    if (!ready) return key as any
    return languageTitlesFnUnwrapped(key, options as any)
  }, [ready, languageTitlesFnUnwrapped])

  const changeLanguage = useCallback((languageCode: string) => {
    translationsI18n.changeLanguage(languageCode)
    languageTitlesI18n.changeLanguage(languageCode)
  }, [translationsI18n, languageTitlesI18n])

  const { renderState, context } = useBannerContext()

  return (
      <div className="App">
        <Translations.Provider
          value={{ translationsFn, languageTitlesFn, changeLanguage, ready }}
        ><RenderInBanner.Provider
          value={context}
        >
          <BrowserRouter basename={baseName}>
            <Routes>
              <Route  path="/" element={<Home />}/>
              <Route path="/*" element={<>
                <Banner { ...renderState}/>
                <Routes>
                  <Route path="/game-modes" element={ <GameModes />} />
                  <Route path="/new-game-mode" element={ <NewGameMode />} />
                  <Route path="/lexicons" element={ <Lexicons />} />
                  <Route path="/languages" element={ <Languages />} />
                  <Route path="/multiplayer" element={ <GameScreen isMultiplayer />} />
                  <Route path="/preferences" element={ <Preferences />} />
                  <Route path="/android-integration" element={ <AndroidIntegration /> } />
                  <Route path="/singleplayer" element={ <GameScreen />} />
                  <Route path="/lexicle/*" element={ <Lexicle/>} />
                  <Route path='/saved-games' element={ <SavedGames />} />
                </Routes>
              </>} />
            </Routes>
          </BrowserRouter>
        </RenderInBanner.Provider>
        </Translations.Provider>
      </div>
  )
}

export default App
