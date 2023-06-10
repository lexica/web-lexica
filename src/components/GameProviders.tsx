import { toSeconds } from 'duration-fns'
import { useContext, useEffect, useMemo } from 'react'

import { LetterScores } from '../game'
import { BoardContext, BoardRefresh, useBoardFromUrl, useGeneratedBoard } from '../game/board'
import { Dictionary, DictionaryState, useBoardDictionary } from '../game/dictionary'
import { Guess, GuessDispatch, useGuesses } from '../game/guess'
import { Language, LanguageState, useLanguage, useLanguageFromLocalStorage } from '../game/language'
import { Rules, useRulesFromQueryString, useRulesFromStorage } from '../game/rules'
import { GameLocalStorage, useResumedGame } from '../game/save-game'
import { Score, useScore } from '../game/score'
import { Timer, useTimer } from '../game/timer'
import { useGameUrlParameters } from '../game/url'
import { sort } from '../util'
import { WithChildren } from '../util/types'


const CommonNewAndShareGameProviders = ({ children }: WithChildren) => {
  const board = useContext(BoardContext)
  const language = useContext(Language)
  const rules= useContext(Rules)
  const dictionary = useBoardDictionary(language, board, rules.minimumWordLength)
  const [guess, dispatchGuess] = useGuesses(board)

  const timer = useTimer(toSeconds(rules.time))

  const [score, dispatchScoreUpdate] = useScore(dictionary)

  const lastGuess = useMemo(() => guess.guesses[guess.guesses.length - 1], [guess])

  useEffect(() => {
    dispatchScoreUpdate(lastGuess)
  }, [dispatchScoreUpdate, lastGuess])

  return <Guess.Provider value={guess}>
    <GuessDispatch.Provider value={dispatchGuess}>
      <Dictionary.Provider value={dictionary}>
        <Score.Provider value={score}>
          <Timer.Provider value={timer}>
            {children}
          </Timer.Provider>
        </Score.Provider>
      </Dictionary.Provider>
    </GuessDispatch.Provider>
  </Guess.Provider>
}

export const NewGameProviders = ({ children }: WithChildren) => {
  const language = useLanguageFromLocalStorage()
  const [ruleset] = useRulesFromStorage()
  const { board, refreshBoard } = useGeneratedBoard(ruleset.boardWidth, language.metadata)

  return <>
    <Rules.Provider value={ruleset}>
      <Language.Provider value={language}>
        <LetterScores.Provider value={language?.metadata?.letterScores}>
          <BoardContext.Provider value={board}>
            <BoardRefresh.Provider value={refreshBoard}>
              <CommonNewAndShareGameProviders>
                {children}
              </CommonNewAndShareGameProviders>
            </BoardRefresh.Provider>
          </BoardContext.Provider>
        </LetterScores.Provider>
      </Language.Provider>
    </Rules.Provider>
  </>
}

export const SharedGameProviders = ({ children }: WithChildren) => {
  const board = useBoardFromUrl()
  const rules = useRulesFromQueryString(board)
  const params = useGameUrlParameters()
  const language = useLanguage(params.language)


  return <>
    <Rules.Provider value={rules}>
      <Language.Provider value={language}>
        <LetterScores.Provider value={language?.metadata?.letterScores}>
          <BoardContext.Provider value={board}>
            <CommonNewAndShareGameProviders>
              {children}
            </CommonNewAndShareGameProviders>
          </BoardContext.Provider>
        </LetterScores.Provider>
      </Language.Provider>
    </Rules.Provider>
  </>
}

export const ResumedGameProviders = ({ gamePath, children }: WithChildren<{ gamePath: string }>) => {
  const resumedGame = useResumedGame(gamePath)
  const board = useMemo(() => resumedGame.board, [resumedGame])
  const dictionary = useMemo(() => {
    const { foundWords, remainingWords } = resumedGame[GameLocalStorage.Score]
    return sort([...foundWords, ...remainingWords])
  }, [resumedGame])
  
  const boardDictionary: DictionaryState = useMemo(() => ({
    boardDictionary: dictionary,
    loading: false
  }), [dictionary])
  const language: LanguageState = useMemo(() => ({
    loading: false,
    error: false,
    metadata: resumedGame.language,
    dictionary: dictionary
  }), [resumedGame, dictionary])

  const rules = useMemo(() => resumedGame.rules, [resumedGame])
  const [guess, dispatchGuess] = useGuesses(board, resumedGame.guesses)

  const timer = useTimer(resumedGame.timer)

  const [score, dispatchScoreUpdate] = useScore(boardDictionary, resumedGame[GameLocalStorage.Score])

  const lastGuess = useMemo(() => guess.guesses[guess.guesses.length - 1], [guess])

  useEffect(() => {
    dispatchScoreUpdate(lastGuess)
  }, [dispatchScoreUpdate, lastGuess])

  return <>
    <Language.Provider value={language}>
      <Rules.Provider value={rules}>
        <LetterScores.Provider value={language.metadata.letterScores}>
          <BoardContext.Provider value={board}>
            <Guess.Provider value={guess}>
              <GuessDispatch.Provider value={dispatchGuess}>
                <Dictionary.Provider value={boardDictionary}>
                  <Score.Provider value={score}>
                    <Timer.Provider value={timer}>
                      {children}
                    </Timer.Provider>
                  </Score.Provider>
                </Dictionary.Provider>
              </GuessDispatch.Provider>
            </Guess.Provider>
          </BoardContext.Provider>
        </LetterScores.Provider>
      </Rules.Provider>
    </Language.Provider>
  </>
}

