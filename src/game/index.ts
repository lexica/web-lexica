import * as R from 'ramda'
import { createContext } from 'react'
import { MetadataV1 } from './language'
import { ScoreType } from './rules'
import { splitWordIntoLetters } from './words'

export const getLetterScore = (letter: string, letterScores: MetadataV1['letterScores']) => letterScores[letter]

const scoreWordByLetterScores = (word: string, letterScores: { [key: string]: number }) => R.pipe<string, string[], number>(
  word => splitWordIntoLetters(word, Object.keys(letterScores)),
  R.reduce<string, number>((acc, letter) => acc + letterScores[letter], 0)
)(word)

export const scoreWord = (word: string, scoreType: ScoreType, letterScores: MetadataV1['letterScores']) => {
  switch (scoreType) {
    case ScoreType.Letters:
      return scoreWordByLetterScores(word, letterScores)
    case ScoreType.Words:
      return word.length
    default:
      return 0
  }
}

export const orderByWordScore = (dictionary: string[], scoreType: ScoreType, letterScores: MetadataV1['letterScores']) => R.sortWith(
  [R.descend<string>((word) => scoreWord(word, scoreType, letterScores)), R.ascend<string>(R.identity)],
  dictionary
)

export type LetterScoresContext = { [key: string]: number }

export const LetterScores = createContext<LetterScoresContext>({})


