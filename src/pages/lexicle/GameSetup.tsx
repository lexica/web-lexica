import { useCallback, useEffect, ReactNode, useContext, useMemo, useState, useReducer } from 'react'
import { ConfirmationEffect } from '../../components/game/Board/hooks'
import { Board, useGeneratedBoard } from '../../game/board/hooks'
import { Dictionary, DictionaryState, useBoardDictionary } from '../../game/dictionary/hooks'
import { Guess, GuessDispatch, useGuesses } from '../../game/guess'
import { Language } from '../../game/language'
import { useConfirmationEffect } from '../../game/lexicle/confirmation-effect'
import { Score, ScoreState, useScore, ValidAnswers } from '../../game/lexicle/score'
import { Rules, useDefaultRules } from '../../game/rules/hooks'
import { logger } from '../../util/logger'
import { getRandomNumberGenerator, randomInt } from '../../util/random'
import * as R from 'ramda'

const getDesiredWord = (dictionaryState: DictionaryState, answers: string[], _: any, prng: () => number) => {
  if (!dictionaryState?.boardDictionary?.length) return ''

  const { boardDictionary } = dictionaryState

  const validAnswers = boardDictionary.filter(w => answers.includes(w))
  if (!validAnswers.length) {
    logger.error('Valid answer not found!')
    throw new Error('Valid answer not found on board.')
  }

  const index = randomInt({ max: validAnswers.length, generator: prng, wholeNumber: true })

  logger.debug(`[important]\nChoosing word to find. Array length: ${validAnswers.length}, index: ${index}\n[important]`)

  return validAnswers[index]
}

export const useOnGameFinishedCallback = (callback: () => void, score: ScoreState) => {
  const [onGameFinishCalled, setOnGameFinishCalled] = useState(false)

  const handleGameFinish = useCallback(() => {
    logger.debug('Lexicle: calling game finish')
    setOnGameFinishCalled(true)
    callback()
  }, [setOnGameFinishCalled, callback])

  useEffect(() => {
    logger.debug('running useOnGameFinishCallback...')
    if (onGameFinishCalled) return
    const { guessScores, desiredWord } = score
    const guessLength = guessScores?.length
    if (!!!(desiredWord?.length) || !!!(guessLength)) return
    const mostRecentGuess = guessScores[guessLength-1].word
    if (guessScores.length >= 6 || mostRecentGuess === desiredWord) {
      handleGameFinish()
    }
  }, [onGameFinishCalled, score, handleGameFinish])
}

// Using a memoized version (outside of react) helps with consistancy
const getDesiredWordMemoized = R.memoizeWith((dictionaryState: DictionaryState, answers: string[], board: string[]) => {
  if (dictionaryState.loading || !!!(board?.length)) return 'loading'
  const stringifiedDictionary = JSON.stringify(dictionaryState.boardDictionary)
  const stringifiedAnswers = JSON.stringify(answers)
  return `${stringifiedDictionary}:${stringifiedAnswers}:${board.join('/')}`
}, getDesiredWord)

const GameSetup = ({ wordOfTheDay, children, onGameFinish }: { wordOfTheDay: boolean, children: ReactNode, onGameFinish: () => void }) => {
  const language = useContext(Language)
  const rules = useDefaultRules()
  const { metadata } = language
  const validAnswers = useContext(ValidAnswers)
  const answers = useMemo(() => validAnswers?.length ? validAnswers : language.dictionary, [validAnswers, language])
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

  const desiredWord = useMemo(() => getDesiredWordMemoized(minimizedDictionary, answers, board, prng), [answers, prng, minimizedDictionary, board])

  const [score, dispatchScoreUpdate] = useScore(desiredWord, minimizedDictionary)

  const [guesses, dispatchGuess] = useGuesses(board)

  useOnGameFinishedCallback(onGameFinish, score)

  const latestGuess = useMemo(() => guesses.guesses[guesses.guesses.length - 1], [guesses])

  useEffect(() => {
    dispatchScoreUpdate(latestGuess)
  }, [latestGuess, dispatchScoreUpdate])

  return <>
    <ConfirmationEffect.Provider value={useConfirmationEffect}>
      <Board.Provider value={board}>
        <Dictionary.Provider value={minimizedDictionary}>
          <Rules.Provider value={rules}>
            <Score.Provider value={score}>
              <Guess.Provider value={guesses}>
                <GuessDispatch.Provider value={dispatchGuess}>
                  {children}
                </GuessDispatch.Provider>
              </Guess.Provider>
            </Score.Provider>
          </Rules.Provider>
        </Dictionary.Provider>
      </Board.Provider>
    </ConfirmationEffect.Provider>
  </>
}
export default GameSetup
