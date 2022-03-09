import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { splitWordIntoLetters } from '../words'

// Determines win condition...?
// Determines the score of a given guess (Letters in correct spot, letters in word but incorrect spot)

enum LetterCorrectness {
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
  desiredWord: string
}


export const Score = createContext<ScoreState>({
  guessScores: [],
  desiredWord: ''
})

const getLetterCounts = (desiredWord: string, letters: string[]) => {
  const wordLetters = splitWordIntoLetters(desiredWord, letters)
  return wordLetters.reduce((acc, letter) => acc[letter] === undefined ? { ...acc, [letter]: 1 } : { ...acc, [letter]: acc[letter] + 1}, {} as { [key: string]: number })
}

type LetterCounts = ReturnType<typeof getLetterCounts>

const determineGuessScore = (desiredWord: string, guess: string, letters: string[], letterCounts: LetterCounts): GuessScore => {
  const wordLetters = splitWordIntoLetters(guess, letters)
  const validLetters = Object.keys(letterCounts)
  return {
    word: guess,
    wordBreakdown: wordLetters.reduce<[LetterScore[], number]>(([acc, wordLength], letter, index) => {
      const lengthWithLetter = wordLength + letter.length
      const partialReturn = { letter }
      if (!validLetters.includes(letter)) {
        return [[...acc, { ...partialReturn, correctness: LetterCorrectness.NotInWord  }], lengthWithLetter]
      }
      if (desiredWord.substring(wordLength, lengthWithLetter) === letter) {
        return [[...acc, { ...partialReturn, correctness: LetterCorrectness.Perfect }], lengthWithLetter]
      }
      return [[...acc, { ...partialReturn, correctness: LetterCorrectness.InWord }], lengthWithLetter]
    }, [[], 0])[0]
  }
}

export const useScore = (desiredWord: string, boardDictionaryState: { boardDictionary: string[] }, letters: string[], saveScoreState: GuessScore[] = []): [ScoreState, (guess: string) => void] => {
  const [dictionary, updateDictionary] = useState(boardDictionaryState.boardDictionary)
  const [score, updateScore] = useState(saveScoreState)
  const letterCounts = useMemo(() => letters && letters.length ? getLetterCounts(desiredWord, letters) : {}, [desiredWord, letters])

  useEffect(() => {
    updateDictionary(boardDictionaryState.boardDictionary)
  }, [boardDictionaryState, updateDictionary])

  const dispatchScoreUpdate = useCallback((guess: string) => {
    if (!dictionary.includes(guess)) return
    updateScore((previousScore) => [...previousScore, determineGuessScore(desiredWord, guess, letters, letterCounts)])
  }, [dictionary, updateScore, desiredWord, letterCounts, letters])
  return useMemo(() => [{ desiredWord, guessScores: score }, dispatchScoreUpdate], [score, desiredWord, dispatchScoreUpdate])
}
