
import { BrowserRouter, Route } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import Multiplayer from './pages/Multiplayer';
import Options from './pages/Options';
import { Translations, useTranslations } from './translations';
import { logger } from './util/logger';

function App() {
  logger.debug('loading app...')

  const translations = useTranslations()

  return (
      <div className="App">
        <Translations.Provider value={translations}>
          <BrowserRouter basename="/web-lexica">
            <Route exact path="/">
              <Home/>
            </Route>
            <Route path="/multiplayer">
              <Multiplayer />
            </Route>
            <Route path="/options">
              <Options />
            </Route>
          </BrowserRouter>
        </Translations.Provider>
      </div>
  );
}

export default App;
