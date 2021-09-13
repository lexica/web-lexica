
import { BrowserRouter, Route } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import Multiplayer from './pages/Multiplayer';
import Options from './pages/Options';
import { logger } from './util/logger';

function App() {
  logger.debug('loading app...')

  return (
      <div className="App">
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
      </div>
  );
}

export default App;
