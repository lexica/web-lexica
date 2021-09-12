import React, { useCallback, useState } from 'react';
import * as R from 'ramda';

import './App.css';

import Results, { ResultsOrientation } from './components/Results';
import Game from './components/Game';
import StartScreen from './components/StartScreen';
// import { useDictionary } from './game';
import { useRulesFromQueryString, Rules } from './game/rules';
import { useOrientation, ScreenOrientation } from './util/hooks';
import { logger } from './util/logger';
import { Language, useLanguage } from './game/language';
import { Timer, useTimer } from './game/timer';
import { Dictionary, useBoardDictionary } from './game/dictionary';
import { Score, useScore } from './game/score';
import { Guess, GuessDispatch, useGuesses } from './game/guess';
import { LetterScores } from './game';

const getResultsOrientation = (orientation: ScreenOrientation) => {
    switch(orientation) {
    case ScreenOrientation.Landscape:
      return ResultsOrientation.Horizontal
    case ScreenOrientation.Portrait:
    default:
      return ResultsOrientation.Vertical
  }
}

type ProviderProps<T extends React.Context<any>> = T extends React.Context<infer X>
  ? X
  : never

type ProvidersProps = {
  language: ProviderProps<typeof Language>,
  dictionary: ProviderProps<typeof Dictionary>,
  guess: ProviderProps<typeof Guess>,
  guessDispatch: ProviderProps<typeof GuessDispatch>,
  score: ProviderProps<typeof Score>,
  timer: ProviderProps<typeof Timer>,
  rules: ProviderProps<typeof Rules>
}

const Providers: React.FC<ProvidersProps> = ({
  rules,
  language,
  dictionary,
  guess,
  guessDispatch,
  score,
  timer,
  children
}) => <Rules.Provider value={rules}>
  <Language.Provider value={language}>
    <LetterScores.Provider value={language.metadata.letterScores}>
      <Dictionary.Provider value={dictionary}>
        <Guess.Provider value={guess}>
          <GuessDispatch.Provider value={guessDispatch}>
            <Score.Provider value={score}>
              <Timer.Provider value={timer}>
                {children}
              </Timer.Provider>
            </Score.Provider>
          </GuessDispatch.Provider>
        </Guess.Provider>
      </Dictionary.Provider>
    </LetterScores.Provider>
  </Language.Provider>
</Rules.Provider>

function App() {
  logger.debug('loading app...')
  const [started, updateStarted] = useState(false)
  const [finished, updateResults] = useState(false)
  const rules = useRulesFromQueryString()

  const language = useLanguage(rules.language)

  const { error } = language

  const handleFinish = useCallback(() => {
    logger.debug('handling finish...')
    updateResults(true)
  }, [updateResults])

  const { startTime, pauseTime, getRemainingTime } = useTimer(rules.time, handleFinish)

  const dictionaryState = useBoardDictionary(language, rules.board, rules.minimumWordLength)

  const loading = dictionaryState.loading || language.loading

  const [guessState, guessDispatch] = useGuesses(rules.board)

  const score = useScore(guessState, dictionaryState)

  const handleStart = useCallback(() => { updateStarted(true); startTime() }, [updateStarted, startTime])

  const orientation = useOrientation()

  const resultsOrientation = getResultsOrientation(orientation)

  return (
      <div className="App">
        <Providers {...{
          rules,
          dictionary: dictionaryState,
          guess: guessState,
          guessDispatch,
          language: R.omit(['loading', 'error'], language),
          score,
          timer: {
            getRemainingTime,
            pauseTime,
            startTime
          },
        }}>
          {
            finished
              ? <Results
                  orientation={resultsOrientation}
                />
              : started
                ? <Game />
                : <StartScreen {...{ handleStart, loading, error }}/>
          }
        </Providers>
      </div>
  );
}

export default App;
