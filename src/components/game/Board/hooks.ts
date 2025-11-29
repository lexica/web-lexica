import { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react'

import { Score } from '../../../game/score'
import { Guess } from '../../../game/guess'
import { logger } from '../../../util/logger'

const ConfirmationFeedback = {
  Correct: 'correct',
  Stale: 'stale',
  Incorrect: 'incorrect'
}

type ConfirmationFeedbackType = typeof ConfirmationFeedback[keyof typeof ConfirmationFeedback]

const getConfirmationType = (lastGuess: string, { foundWords, remainingWords }: { foundWords: string[], remainingWords: string[] }, guesses: string[]): ConfirmationFeedbackType => {
  const lastFoundWord = foundWords[foundWords.length -1]
  logger.debug({ lastGuess, lastFoundWord })
  const isCorrectGuess = lastGuess === lastFoundWord || remainingWords.includes(lastGuess)
  if (isCorrectGuess && guesses.indexOf(lastGuess) === guesses.length -1)
    return ConfirmationFeedback.Correct

  if (foundWords.includes(lastGuess)) return ConfirmationFeedback.Stale
  return ConfirmationFeedback.Incorrect
}

export const noConfirmationEffect = (_: boolean, __: string) => {
  return ''
}

export const useConfirmationEffect = (visited: boolean, _: string) => {
  const [shouldShowVisualFeedback, dispatch] = useReducer((_: boolean, action: boolean) => action, false)
  const [lastGuess, setLastGuess] = useState('')
  const [feedbackClasses, setFeedbackClasses] = useState('')
  const score = useContext(Score)
  const { currentGuess, isGuessing, guesses } = useContext(Guess)

  useEffect(() => {
    if (currentGuess.length === 0) return
    setLastGuess(currentGuess)
  }, [setLastGuess, currentGuess])

  const triggerFeedback = useMemo(
    () => !isGuessing && shouldShowVisualFeedback && currentGuess !== lastGuess,
    [isGuessing, currentGuess, shouldShowVisualFeedback, lastGuess]
  )

  useEffect(() => {
    if (shouldShowVisualFeedback) return
    if (visited) dispatch(true)
  }, [shouldShowVisualFeedback, visited, dispatch])

  useEffect(() => {
    if (!triggerFeedback) return

    dispatch(false)
    const type = getConfirmationType(lastGuess, score, guesses)
    logger.debug('triggering feedback', type)
    setFeedbackClasses(`board-letter-${type}`)
    setTimeout(() => setFeedbackClasses(''), 260)

  }, [triggerFeedback, dispatch, setFeedbackClasses, lastGuess, score, guesses])


  return feedbackClasses
}

export const ConfirmationEffect = createContext<(visited: boolean, letter: string) => string>(() => '')

