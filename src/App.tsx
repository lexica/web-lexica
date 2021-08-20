import { useLocation } from 'react-router-dom'

import './App.css';
import Board from './Board'
import Guesses from './Guesses';
import { GameURLParams, useGame } from './game';

function parseURLSearch<T = any>(search: string): T {
  const keyValuePairs = search.replace('?', '').split('&')
  return keyValuePairs.reduce((acc: Partial<T>, keyValuePair: string) => {
    const [key, value] = keyValuePair.split('=')
    return {
      ...acc,
      [decodeURI(key) as keyof T]: decodeURI(value) as unknown as T[keyof T]
    }
  }, {} as Partial<T>) as T
}

function App() {
  const location = useLocation()

  const searchParams = parseURLSearch<GameURLParams>(location.search)

  const [game, dispatch] = useGame(searchParams)

  return (
      <div className="App">
        <Board board={game.board} context={dispatch} />
        <Guesses guesses={game.guessedWords} dictionary={game.foundWords} />
      </div>
  );
}

export default App;
