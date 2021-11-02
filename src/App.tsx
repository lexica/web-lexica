
import { BrowserRouter, Route } from 'react-router-dom';
import './App.css';
import { Language, useLanguageFromLocalStorage } from './game/language';
import { Rules, useRulesFromStorage } from './game/rules';
import Home from './pages/Home';
import Multiplayer from './pages/Multiplayer';
import Options from './pages/Options';
import SinglePlayer from './pages/SinglePlayer';
import { Translations, useTranslations } from './translations';
import { logger } from './util/logger';

function App() {
  logger.debug('loading app...')

  const translations = useTranslations()
  const language = useLanguageFromLocalStorage()
  const ruleset = useRulesFromStorage()

  return (
      <div className="App">
        <Translations.Provider
          value={translations}
        ><Rules.Provider
          value={ruleset}
        ><Language.Provider
          value={language}
        >
          <BrowserRouter basename="/web-lexica">
            <Route exact path="/">
              <Home/>
            </Route>
            <Route path="/singleplayer">
              <SinglePlayer />
            </Route>
            <Route path="/multiplayer">
              <Multiplayer />
            </Route>
            <Route path="/options">
              <Options />
            </Route>
          </BrowserRouter>
        </Language.Provider></Rules.Provider></Translations.Provider>
      </div>
  );
}

export default App;
