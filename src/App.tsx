
import { BrowserRouter, Route, Routes,  } from 'react-router-dom'
import { CurrentGameType, useGameType } from './game'
import { Translations, useTranslations } from './translations'
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

function App() {
  logger.debug('loading app...')

  const translations = useTranslations()
  const { gameType, setGameType } = useGameType()
  const { renderState, context } = useBannerContext()

  return (
      <div className="App">
        <Translations.Provider
          value={translations}
        ><CurrentGameType.Provider
          value={gameType}
        ><RenderInBanner.Provider
          value={context}
        >
          <BrowserRouter basename="/web-lexica">
            <Routes>
              <Route  path="/" element={<Home setGameType={setGameType}/>}/>
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
        </CurrentGameType.Provider>
        </Translations.Provider>
      </div>
  )
}

export default App
