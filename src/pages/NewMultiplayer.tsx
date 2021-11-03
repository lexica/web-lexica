import React, { useCallback, useState } from 'react'
import * as R from 'ramda'

import '../App.css'

import Results, { ResultsOrientation } from '../components/Results'
import Game from '../components/Game'
import { Rules, useRulesFromStorage } from '../game/rules'
import { useOrientation, ScreenOrientation } from '../util/hooks'
import { logger } from '../util/logger'
import { Language, useLanguageFromLocalStorage } from '../game/language'
import { Timer, useTimer } from '../game/timer'
import { Dictionary, useBoardDictionary } from '../game/dictionary'
import { Score, useScore } from '../game/score'
import { Guess, GuessDispatch, useGuesses } from '../game/guess'
import { LetterScores } from '../game'
import { toSeconds } from 'duration-fns'
import { Board, useGeneratedBoard } from '../game/board/hooks'
import StartScreen from '../components/StartScreen'

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
  rules: ProviderProps<typeof Rules>
  language: ProviderProps<typeof Language>,
  board: ProviderProps<typeof Board>,
  dictionary: ProviderProps<typeof Dictionary>,
  guess: ProviderProps<typeof Guess>,
  guessDispatch: ProviderProps<typeof GuessDispatch>,
  score: ProviderProps<typeof Score>,
  timer: ProviderProps<typeof Timer>,
}

const Providers: React.FC<ProvidersProps> = ({
  rules,
  language,
  board,
  dictionary,
  guess,
  guessDispatch,
  score,
  timer,
  children
}) => <Rules.Provider value={rules}>
  <Language.Provider value={language}>
    <LetterScores.Provider value={language.metadata.letterScores}>
      <Board.Provider value={board}>
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
      </Board.Provider>
    </LetterScores.Provider>
  </Language.Provider>
</Rules.Provider>

const NewMultiplayer = () => {
  logger.debug('loading app...')
  const [started, updateStarted] = useState(false)
  const [finished, updateResults] = useState(false)

  const language = useLanguageFromLocalStorage()
  const [rules] = useRulesFromStorage()
  const board = useGeneratedBoard(rules.boardWidth, language.metadata)

  const { error } = language

  const handleFinish = useCallback(() => {
    logger.debug('handling finish...')
    updateResults(true)
  }, [updateResults])

  const timer = useTimer(toSeconds(rules.time), handleFinish)

  const { startTime } = timer

  const dictionaryState = useBoardDictionary(language, board, rules.minimumWordLength)

  const loading = dictionaryState.loading || language.loading

  const [guessState, guessDispatch] = useGuesses(board)

  const score = useScore(guessState, dictionaryState)

  const handleStart = useCallback(() => { updateStarted(true); startTime() }, [updateStarted, startTime])

  const orientation = useOrientation()

  const resultsOrientation = getResultsOrientation(orientation)

  return (
      <div className="App">
        <Providers {...{
          rules,
          language: R.omit(['loading', 'error'], language),
          board,
          dictionary: dictionaryState,
          guess: guessState,
          guessDispatch,
          score,
          timer
        }}>
          {
            finished
              ? <Results
                  orientation={resultsOrientation}
                />
              : started
                ? <Game />
                : <StartScreen {...{ handleStart, loading, error, showQrCode: true }}/>
          }
        </Providers>
      </div>
  )
}

export default NewMultiplayer

