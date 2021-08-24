import { useLocation } from 'react-router-dom'

import './App.css';
import Board from './Board'
import Guesses from './Guesses';
import { GameURLParams, useGame } from './game';
import { useState } from 'react';
import Score from './Score';
import Results from './Results';

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

const getTimeDifference = (start: Date, end: Date) => ((end as any) - (start as any)) as number

function App() {
  const [startedAt] = useState(new Date())

  const location = useLocation()

  const searchParams = parseURLSearch<GameURLParams>(location.search)

  const [game, dispatch, gameParameters] = useGame(searchParams)

  const { time } = gameParameters

  const {
    remainingWords,
    foundWords
  } = game

  return (
      <div className="App">
        <Board board={game.board} context={dispatch} />
        <Guesses guesses={game.guessedWords} dictionary={game.foundWords} />
        <Score {...{ remainingWords, foundWords, time, startedAt }}/>
        {getTimeDifference(startedAt, new Date()) > (time * 1000) && <Results {...{ remainingWords, foundWords }}/>}
      </div>
  );
}

export default App;
