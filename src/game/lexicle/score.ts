import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { splitWordIntoLetters } from '../words'

// Determines win condition...?
// Determines the score of a given guess (Letters in correct spot, letters in word but incorrect spot)

export enum LetterCorrectness {
  Perfect = 'perfect',
  InWord = 'in-word',
  NotInWord = 'not-in-word'
}

type LetterScore = { letter: string, correctness: LetterCorrectness }

export type GuessScore = {
    word: string,
    wordBreakdown: LetterScore[]
}

export type ScoreState = {
  guessScores:  GuessScore[]
  desiredWord: string,
  usedLetters: string[]
}


export const Score = createContext<ScoreState>({
  guessScores: [],
  desiredWord: '',
  usedLetters: []
})

const getLetterCounts = (desiredWord: string) => {
  return desiredWord
    .split('')
    .reduce(
      (acc, letter) => acc[letter] === undefined
        ? { ...acc, [letter]: 1 }
        : { ...acc, [letter]: acc[letter] + 1},
      {} as { [key: string]: number }
    )
}

type LetterCounts = ReturnType<typeof getLetterCounts>

type FirstPassAcc = [
  Acc: { [key: string]: { imperfectIndexes: number[], perfectIndexes: number[] } },
  WordLengthSoFar: number
]

const firstPassReducer = (validLetters: string[], desiredWord: string) => {
  return ([acc, wordLength]: FirstPassAcc, letter: string, index: number): FirstPassAcc => {
    const lengthWithLetter = wordLength + letter.length
    if (!validLetters.includes(letter)) return [acc, lengthWithLetter]
    const { imperfectIndexes = [], perfectIndexes = [] } = acc[letter] || {}

    const isPerfect = desiredWord.substring(wordLength, lengthWithLetter) === letter
    return [{
      ...acc,
      [letter]: {
        imperfectIndexes: isPerfect ? imperfectIndexes : [...imperfectIndexes, index],
        perfectIndexes: isPerfect ? [...perfectIndexes, index] : perfectIndexes
      }
    }, lengthWithLetter] as FirstPassAcc
  }
}

const wordScoreReducer = (validLetters: string[], firstPass: FirstPassAcc[0], letterCounts: LetterCounts) => {
  return (acc: LetterScore[], letter: string, index: number) => {
    if (!validLetters.includes(letter)) {
      return [...acc, { letter, correctness: LetterCorrectness.NotInWord  }]
    }
    if (firstPass[letter].perfectIndexes.includes(index)) {
      return [...acc, { letter, correctness: LetterCorrectness.Perfect }]
    }
    const count = firstPass[letter].imperfectIndexes.indexOf(index) + 1 + firstPass[letter].perfectIndexes.length
    return [...acc, {
      letter,
      correctness: count <= letterCounts[letter] ? LetterCorrectness.InWord : LetterCorrectness.NotInWord
    }]
  }
}

const determineGuessScore = (desiredWord: string, guess: string, letterCounts: LetterCounts): GuessScore => {
  const wordLetters = guess.split('')
  const validLetters = Object.keys(letterCounts)
  const firstPass = wordLetters.reduce<FirstPassAcc>(firstPassReducer(validLetters, desiredWord), [{}, 0])[0]

  return {
    word: guess,
    wordBreakdown: wordLetters.reduce<LetterScore[]>(wordScoreReducer(validLetters, firstPass, letterCounts), [])
  }
}

export const useScore = (desiredWord: string, boardDictionaryState: { boardDictionary: string[] }, letters: string[], saveScoreState: GuessScore[] = []): [ScoreState, (guess: string) => void] => {
  const [dictionary, updateDictionary] = useState(boardDictionaryState.boardDictionary)
  const [score, updateScore] = useState(saveScoreState)
  const letterCounts = useMemo(() => letters && letters.length ? getLetterCounts(desiredWord) : {}, [desiredWord, letters])
  const [usedLetters, setUsedLetters] = useState<string[]>([])

  useEffect(() => {
    updateDictionary(boardDictionaryState.boardDictionary)
  }, [boardDictionaryState, updateDictionary])

  const dispatchScoreUpdate = useCallback((guess: string) => {
    if (!dictionary.includes(guess)) return
    setUsedLetters(previous => {
      const toAdd = guess.split('').map(l => previous.includes(l) ? '' : l).filter(l => l !== '')
      return [...previous, ...toAdd]
    })
    updateScore((previousScore) => [...previousScore, determineGuessScore(desiredWord, guess, letterCounts)])
  }, [dictionary, updateScore, desiredWord, letterCounts, letters, setUsedLetters])
  return useMemo(() => [{ desiredWord, guessScores: score, usedLetters }, dispatchScoreUpdate], [score, desiredWord, usedLetters, dispatchScoreUpdate])
}
