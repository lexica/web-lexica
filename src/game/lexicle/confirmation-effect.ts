import * as R from 'ramda'
import { useContext, useEffect, useMemo, useReducer, useState } from 'react'
import { logger } from '../../util/logger'
import { Dictionary } from '../dictionary'
import { Guess } from '../guess'
import { Score, ScoreState } from './score'

const getHintType = ({ desiredWord, usedLetters }: ScoreState, letter: string) => {
  const letterInclusions = letter.split('').map(l => usedLetters.includes(l))
  const someLettersUsed = letterInclusions.includes(true)
  const allLettersUsed = !letterInclusions.includes(false)
  
  if (!someLettersUsed) return ''
  if (allLettersUsed) return desiredWord.includes(letter) ? 'used' : 'unused'
  const markUnused = R.zip(letter.split(''), letterInclusions).reduce((acc, [subLetter, used]) => {
    if (acc || !used) return acc
    return !desiredWord.includes(subLetter)
  }, false)
  return markUnused ? 'unused' : ''
}

export const useConfirmationEffect = (visited: boolean, letter: string) => {
  const [feedbackClasses, setFeedbackClasses] = useState({ hint: '', feedback: ''})
  const [shouldShowVisualFeedback, dispatch] = useReducer((_: boolean, action: boolean) => action, false)
  const [lastGuess, setLastGuess] = useState('')

  const score = useContext(Score)

  const hint = useMemo(() => getHintType(score, letter), [score, letter])

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
    setFeedbackClasses(previous => ({ ...previous, hint }))
  }, [hint, setFeedbackClasses])

  useEffect(() => {
    if (!triggerFeedback || !boardDictionary) return

    dispatch(false)
    const type = boardDictionary.includes(lastGuess) ? 'correct' : 'incorrect'
    logger.debug('triggering lexicle feedback', type)
    setFeedbackClasses(previous => ({ ...previous, feedbackClasses: `lexicle-board-letter-${type}` }))
    setTimeout(() => setFeedbackClasses(previous => ({ ...previous, feedbackClasses: '' })), 2600)

  }, [triggerFeedback, dispatch, setFeedbackClasses, score, guesses, lastGuess, boardDictionary])
  return Object.values(feedbackClasses).join(' ')
}
