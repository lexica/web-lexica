import { useContext, useEffect, useMemo, useState } from 'react'
import { Language } from '../game/language'
import { Board as BoardContext } from '../game/board/hooks'
import { useGeneratedBoard } from '../game/board/hooks'
import { Dictionary, useBoardDictionary } from '../game/dictionary'
import { useScore, Score as ScoreContext, ScoreState } from '../game/lexicle/score'
import { Guess, GuessDispatch, useGuesses } from '../game/guess'
import { ConfirmationEffect } from '../components/game/Board/hooks'
import { useConfirmationEffect } from '../game/lexicle/confirmation-effect'

import './LexicleGameScreen.css'

import Board from '../components/game/Board/Board'
import Score from '../components/game/lexicle/Score'
import Results from '../components/game/lexicle/Results'
import { logger } from '../util/logger'
import { Rules, useDefaultRules } from '../game/rules'
import { getRandomNumberGenerator, randomInt } from '../util/random'

const useEndScreen = (score: ScoreState) => {
  const [lastGuess, setLastGuess] = useState('')
  const [guessLength, setGuessLength] = useState(0)
  const [desiredWord, setDesiredWord] = useState('asdf')
  const [done, setDone] = useState(false)
  useEffect(() => {
    setDesiredWord(score.desiredWord)
    setLastGuess(score.guessScores.length ? score.guessScores[score.guessScores.length - 1].word : '')
    setGuessLength(score.guessScores.length || 0)
  }, [score, setLastGuess, setGuessLength, setDesiredWord])

  useEffect(() => {
    if (desiredWord === '') return
    setDone(guessLength > 5 || lastGuess === desiredWord)
  }, [guessLength, lastGuess, desiredWord])

  return done
}

const LexicleGameScreen = ({ wordOfTheDay = false }: { wordOfTheDay?: boolean }): JSX.Element => {
  const language = useContext(Language)
  const rules = useDefaultRules()
  const { metadata } = language
  const [{ prng }] = useState({
    prng: wordOfTheDay ? getRandomNumberGenerator((new Date()).toLocaleDateString('en-US')) : Math.random
  })
  const { board } = useGeneratedBoard(6, metadata, prng)
  const dictionaryState = useBoardDictionary(language, board, 5)
  const minimizedDictionary = useMemo(() => {
    if (dictionaryState.loading) return dictionaryState
    return {
      loading: false,
      boardDictionary: dictionaryState.boardDictionary.filter(({ length }) => length === 5)
    }
  }, [dictionaryState])

  const desiredWord = useMemo(() => minimizedDictionary?.boardDictionary?.length ? minimizedDictionary.boardDictionary[randomInt({
    max: minimizedDictionary.boardDictionary.length,
    wholeNumber: true,
    generator: prng
  })] : '', [prng, minimizedDictionary])

  const [score, dispatchScoreUpdate] = useScore(desiredWord, minimizedDictionary)

  const [guesses, dispatchGuess] = useGuesses(board)

  const latestGuess = useMemo(() => guesses.guesses[guesses.guesses.length - 1], [guesses])

  useEffect(() => {
    const length = (latestGuess && latestGuess.length) || 0
    if (length <= 0) return
    dispatchScoreUpdate(latestGuess)
  }, [latestGuess, dispatchScoreUpdate])

  const GameBoard = useMemo(() => () => <><Board/>
  <div className='lexicle-score-container scrollbar'>
    <Score/>
  </div></>, [])


  const done = useEndScreen(score)
  logger.debug({ done })
  return <div className='lexicle'>
    <ConfirmationEffect.Provider value={useConfirmationEffect}>
      <BoardContext.Provider value={board}>
        <Dictionary.Provider value={minimizedDictionary}>
          <Rules.Provider value={rules}>
            <ScoreContext.Provider value={score}>
              <Guess.Provider value={guesses}>
                <GuessDispatch.Provider value={dispatchGuess}>
                  {done ? <Results wordOfTheDay={wordOfTheDay}/> : <GameBoard/>}
                </GuessDispatch.Provider>
              </Guess.Provider>
            </ScoreContext.Provider>
          </Rules.Provider>
        </Dictionary.Provider>
      </BoardContext.Provider>
    </ConfirmationEffect.Provider>
  </div>
}

export default LexicleGameScreen
