import * as R from 'ramda'
import { createContext, useEffect, useMemo, useReducer, useState } from 'react'

import { getLanguageMetadata } from '../language.ts'
import type { MetadataV1 } from '../language.ts'
import { useGameUrlParameters } from '../url'
import { splitWordIntoLetters } from '../words'

import { randomInt } from '../../util/random'
import { getB64DelimitedURLBoard } from './util'

const shuffle = (unshuffledBoard: string[], prng: () => number) => {
  const toShuffle = [...unshuffledBoard]
  for (let currentIndex = toShuffle.length - 1; currentIndex > 0; currentIndex--) {
    const randomIndex = Math.floor(prng() * (currentIndex + 1))
    const randomLetter = toShuffle[randomIndex]
    const currentLetter = toShuffle[currentIndex]
    toShuffle[randomIndex] = currentLetter
    toShuffle[currentIndex] = randomLetter
  }
  return toShuffle
}

const generateBoard = (letterCount: number, letters: string[], ogProbabilities: MetadataV1['letterProbabilities'], prng: () => number) => {
  const keys = Object.keys(ogProbabilities)
  const probabilities = keys.reduce(
    (acc, key) => ({ ...acc, [key]: [...ogProbabilities[key]]}),
    {} as MetadataV1['letterProbabilities']
  )
  const unshuffledBoard = R.times(() => {
    const mapping = R.reduce((acc, l) => [...acc, ...R.times(() => l, probabilities[l][0])], [] as string[], letters)

    const result = mapping[randomInt({ wholeNumber: true, max: mapping.length, generator: prng })]
    probabilities[result].length > 1 ? probabilities[result].splice(0, 1) : probabilities[result][0] = 0
    return result
  }, letterCount)

  return shuffle(unshuffledBoard, prng)
}

export const useGeneratedBoard = (width: number, languageMetadata: MetadataV1, prng: () => number = Math.random) => {
  const [board, setBoard] = useState([''])

  const [refreshTrigger, refreshBoard] = useReducer((state: number) => state + 1, 0)
  useEffect(() => {
    if (!languageMetadata) return

    const { letterProbabilities } = languageMetadata
    const letters = Object.keys(letterProbabilities)
    if (letters.length === 0) return

    const iterations = width * width

    setBoard(generateBoard(iterations, letters, letterProbabilities, prng))
  }, [setBoard, width, languageMetadata, refreshTrigger, prng])

  return { board, refreshBoard }
}

const getLanguageLetters = (language: string) => getLanguageMetadata(language)
  .then(({ letterScores }) => Object.keys(letterScores))

const getUndelimitedURLBoard = async ({ board, language }: { board: string, language: string }) => {
  const letters = await getLanguageLetters(language)

  return splitWordIntoLetters(board, letters)
}

type GetBoardParams = {
  minimumVersion: number,
  board: string,
  language: string
}

const getURLBoard = ({ minimumVersion, board, language }: GetBoardParams) => {
  if (minimumVersion >= 20017) return Promise.resolve(getB64DelimitedURLBoard({ board, delimiter: ',' }))
  return getUndelimitedURLBoard({ board, language })
}

export const useBoardFromUrl = () => {
  const params = useGameUrlParameters()
  const [board, setBoard] = useState([''])
  const boardPromise = useMemo(() => getURLBoard(params), [params])

  useEffect(() => {
    boardPromise.then(setBoard)
  }, [boardPromise, setBoard])

  return board
}

export const Board = createContext<string[]>([''])

export const BoardRefresh = createContext<() => void>(() => {})
