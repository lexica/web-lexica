import { useContext, useEffect, useMemo } from 'react'
import { Language } from '../game/language'
import { Board as BoardContext } from '../game/board/hooks'
import { useGeneratedBoard } from '../game/board/hooks'
import { Dictionary, useBoardDictionary } from '../game/dictionary'
import { useScore, Score as ScoreContext } from '../game/lexicle/score'
import { Guess, GuessDispatch, useGuesses } from '../game/guess'
import { ConfirmationEffect } from '../components/game/Board/hooks'
import { useConfirmationEffect } from '../game/lexicle/confirmation-effect'

import './Lexicle.css'

import Board from '../components/game/Board/Board'
import Score from '../components/game/lexicle/Score'

const Lexicle = (): JSX.Element => {
  const language = useContext(Language)
  const { metadata } = language
  const { board } = useGeneratedBoard(6, metadata)
  const dictionaryState = useBoardDictionary(language, board, 5)
  const minimizedDictionary = useMemo(() => {
    if (dictionaryState.loading) return dictionaryState
    return {
      loading: false,
      boardDictionary: dictionaryState.boardDictionary.filter(({ length }) => length === 5)
    }
  }, [dictionaryState])

  const letters = useMemo(() => Object.keys(language?.metadata?.letterScores), [language])

  const [score, dispatchScoreUpdate] = useScore(minimizedDictionary.boardDictionary[2] || '', minimizedDictionary, letters)

  const [guesses, dispatchGuess] = useGuesses(board)

  const latestGuess = useMemo(() => guesses.guesses[guesses.guesses.length - 1], [guesses])

  useEffect(() => {
    const length = (latestGuess && latestGuess.length) || 0
    if (length <= 0) return
    dispatchScoreUpdate(latestGuess)
  }, [latestGuess, dispatchScoreUpdate])

  return <div className='lexicle'>
  <ConfirmationEffect.Provider value={useConfirmationEffect}>
    <BoardContext.Provider value={board}>
      <Dictionary.Provider value={minimizedDictionary}>
        <ScoreContext.Provider value={score}>
          <Guess.Provider value={guesses}>
            <GuessDispatch.Provider value={dispatchGuess}>
              <Board/>
              <div className='lexicle-score-container scrollbar'>
                <Score/>
              </div>
            </GuessDispatch.Provider>
          </Guess.Provider>
        </ScoreContext.Provider>
      </Dictionary.Provider>
    </BoardContext.Provider>
  </ConfirmationEffect.Provider>
  </div>
}

export default Lexicle
