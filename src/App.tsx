import { Reducer, useEffect, useReducer } from 'react';
import * as R from 'ramda';
import './App.css';
import {
  getInitialState,
  gameReducer,
  GameState,
  GameAction,
  GameReducerInitializerArgument
} from './game/context'
import Board from './Board'

function App() {
  const [state, dispatch] = useReducer<
    Reducer<GameState, GameAction>,
    GameReducerInitializerArgument
  >(gameReducer, { board: 'olrteoahiewnrnbasutaiupsn', wordLength: 4 }, getInitialState)

  return (
    <div className="App">
      <Board board={state.board} context={dispatch} />
      {R.map(word => <div>{word}</div>, state.possibleWordsGivenLetterChain)}
    </div>
  );
}

export default App;
