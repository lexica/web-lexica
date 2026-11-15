import { useEffect, useState, createContext } from 'react'
import { type ScoreContext } from './score'
import { type HintState, getLetterHints } from './dictionary'
import * as R from 'ramda'
import { logger } from '../util/logger'
import { getBoard } from './board/util'

export type LetterHintsContext = { [coord: string]: number }
export const LetterHints = createContext<LetterHintsContext>({})

export const useLetterHints = (scoreContext: ScoreContext, hintsContext: HintState, board: string[]) => {
  const [letterHints, setLetterHints] = useState<LetterHintsContext>({})

  useEffect(() => {
    logger.debug('Running useLetterHints use effect...')
    const { hints } = hintsContext
    const { foundWords } = scoreContext
    const computedLetterHints = getLetterHints(R.omit(foundWords, hints), getBoard(board))
    logger.debug('Computed new letter hints', computedLetterHints)
    setLetterHints(computedLetterHints)
  }, [scoreContext, hintsContext, board])

  return letterHints
}
