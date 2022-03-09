import { useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react'
import { logger } from '../../util/logger'
import { Dictionary } from '../dictionary'
import { Guess } from '../guess'
import { Score } from './score'

export const useConfirmationEffect = (visited: boolean) => {
  const [feedbackClasses, setFeedbackClasses] = useState('')
  const [shouldShowVisualFeedback, dispatch] = useReducer((_: boolean, action: boolean) => action, false)
  const [lastGuess, setLastGuess] = useState('')

  const score = useContext(Score)

  const { boardDictionary } = useContext(Dictionary)

  useEffect(() => {
    if (shouldShowVisualFeedback) return
    if (visited) {
      dispatch(true)
    }
  }, [shouldShowVisualFeedback, visited, dispatch])
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
    if (!triggerFeedback || !boardDictionary) return

    dispatch(false)
    const type = boardDictionary.includes(lastGuess) ? 'correct' : 'incorrect'
    logger.debug('triggering lexicle feedback', type)
    setFeedbackClasses(`lexicle-board-letter-${type}`)
    setTimeout(() => setFeedbackClasses(''), 260)

  }, [triggerFeedback, dispatch, setFeedbackClasses, score, guesses, lastGuess, boardDictionary])
  return feedbackClasses
}
