
import { BrowserRouter, Route } from 'react-router-dom'
import { CurrentGameType, LetterScores, useGameType } from './game'
import { Board, BoardRefresh, useGeneratedBoard } from './game/board/hooks'
import { Language, useLanguageFromLocalStorage } from './game/language'
import { Rules, useRulesFromStorage } from './game/rules'
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

function App() {
  logger.debug('loading app...')

  const translations = useTranslations()
  const language = useLanguageFromLocalStorage()
  const [ruleset] = useRulesFromStorage()
  const { board, refreshBoard } = useGeneratedBoard(ruleset.boardWidth, language.metadata)
  const { gameType, setGameType } = useGameType()
  const { renderState, context } = useBannerContext()

  return (
      <div className="App">
        <Translations.Provider
          value={translations}
        ><Rules.Provider
          value={ruleset}
        ><Language.Provider
          value={language}
        ><LetterScores.Provider
          value={language?.metadata?.letterScores}
        ><Board.Provider
          value={board}
        ><BoardRefresh.Provider
          value={refreshBoard}
        ><CurrentGameType.Provider
          value={gameType}
        ><RenderInBanner.Provider
          value={context}
        >
          <BrowserRouter basename="/web-lexica">
            <Route exact path="/">
              <Home setGameType={setGameType}/>
            </Route>
            <Route path="/(.+)">
              <Banner { ...renderState}/>
            </Route>
            <Route path="/game-modes">
              <GameModes />
            </Route>
            <Route path="/new-game-mode">
              <NewGameMode />
            </Route>
            <Route path="/lexicons">
              <Lexicons />
            </Route>
            <Route path="/multiplayer">
              <Multiplayer />
            </Route>
            <Route path="/options">
              <Options />
            </Route>
            <Route path="/singleplayer">
              <SinglePlayer />
            </Route>
            <Route path="/lexicle">
              <Lexicle/>
            </Route>
          </BrowserRouter>
        </RenderInBanner.Provider>
        </CurrentGameType.Provider>
        </BoardRefresh.Provider>
        </Board.Provider>
        </LetterScores.Provider>
        </Language.Provider>
        </Rules.Provider>
        </Translations.Provider>
      </div>
  )
}

export default App
