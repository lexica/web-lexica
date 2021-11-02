import * as R from 'ramda'
import { createContext, useEffect, useMemo, useState } from 'react'

import { MetadataV1, getLanguageMetadata } from '../language'
import { useGameUrlParameters } from '../url'
import { splitWordIntoLetters } from '../words'

const getRandomInt = (max: number) => Math.floor(Math.random() * max)

const shuffle = (unshuffledBoard: string[]) => {
  const toShuffle = [...unshuffledBoard]
  for (let currentIndex = toShuffle.length - 1; currentIndex > 0; currentIndex--) {
    const randomIndex = Math.floor(Math.random() * (currentIndex + 1))
    const randomLetter = toShuffle[randomIndex]
    const currentLetter = toShuffle[currentIndex]
    toShuffle[randomIndex] = currentLetter
    toShuffle[currentIndex] = randomLetter
  }
  return toShuffle
}

const generateBoard = (letterCount: number, letters: string[], probabilities: MetadataV1['letterProbabilities']) => {
  const unshuffledBoard = R.times(() => {
    const mapping = R.reduce((acc, l) => [...acc, ...R.times(() => l, probabilities[l][0])], [] as string[], letters)

    const result = mapping[getRandomInt(mapping.length)]
    if (probabilities[result].length > 1) probabilities[result].splice(0, 1)
    return result
  }, letterCount)

  return shuffle(unshuffledBoard)
}

export const useGeneratedBoard = (width: number, languageMetadata: MetadataV1) => {
  const [board, setBoard] = useState([''])
  useEffect(() => {
    if (!languageMetadata) return

    const { letterProbabilities: p } = languageMetadata
    const probabilities = { ...p }
    const letters = Object.keys(probabilities)
    if (letters.length === 0) return

    const iterations = width * width

    setBoard(generateBoard(iterations, letters, probabilities))
  }, [setBoard, width, languageMetadata])

  return board
}

const getB64DelimitedURLBoard = ({ board, delimiter }: { board: string, delimiter: string }) => {
  const decoded = atob(board)
  return decoded.split(delimiter)
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