
import { BrowserRouter, Route, Routes,  } from 'react-router-dom'
import { logger } from './util/logger'

import GameModes from './pages/GameModes'
import Home from './pages/Home'
import Lexicle from './pages/Lexicle'
import Multiplayer from './pages/Multiplayer'
import Options from './pages/Options'
import SinglePlayer from './pages/SinglePlayer'

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

function App() {
  logger.debug('loading app...')

  const { t: translateFn, i18n: translationsI18n } = useTranslation('translations')
  const { t: languageTitleFn, i18n: languageTitlesI18n } = useTranslation('language-titles')
  const changeLanguage = useCallback((languageCode) => {
    translationsI18n.changeLanguage(languageCode)
    languageTitlesI18n.changeLanguage(languageCode)
  }, [translationsI18n, languageTitlesI18n])

  const { renderState, context } = useBannerContext()

  return (
      <div className="App">
        <Translations.Provider
          value={translations}
        ><RenderInBanner.Provider
          value={context}
        >
          <BrowserRouter basename="/web-lexica">
            <Routes>
              <Route  path="/" element={<Home />}/>
              <Route path="/*" element={<>
                <Banner { ...renderState}/>
                <Routes>
                  <Route path="/game-modes" element={ <GameModes />} />
                  <Route path="/new-game-mode" element={ <NewGameMode />} />
                  <Route path="/lexicons" element={ <Lexicons />} />
                  <Route path="/multiplayer" element={ <Multiplayer />} />
                  <Route path="/options" element={ <Options />} />
                  <Route path="/singleplayer" element={ <SinglePlayer />} />
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
