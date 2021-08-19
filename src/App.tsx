import { Reducer, useEffect, useReducer } from 'react';
import './App.css';
import {
  getInitialState,
  gameReducer,
  GameState,
  GameAction,
  GameReducerInitializerArgument
} from './game/context'
import Board from './Board'
import Guesses from './Guesses';

function App() {
  const forceUpdate = useReducer((x: number) => x+1, 0)[1]
  const [state, dispatch] = useReducer<
    Reducer<GameState, GameAction>,
    GameReducerInitializerArgument
  >(gameReducer, { forceUpdate, board: 'olrteoahiewnrnbasutaiupsn', wordLength: 4 }, getInitialState)

  return (
    <div className="App">
      <Board board={state.board} context={dispatch} />
      <Guesses guesses={state.guessedWords} dictionary={state.foundWords} />
    </div>
  );
}

export default App;
