import * as R from 'ramda'
import { createContext, useState } from 'react'
import { MetadataV1 } from './language'
import { ScoreType } from './score'
import { splitWordIntoLetters } from './words'

export const getLetterScore = (letter: string, letterScores: MetadataV1['letterScores']) => letterScores[letter]

const scoreWordByLetterScores = (word: string, letterScores: { [key: string]: number }) => R.pipe<string, string[], number>(
  word => splitWordIntoLetters(word, Object.keys(letterScores)),
  R.reduce<string, number>((acc, letter) => acc + letterScores[letter], 0)
)(word)

// Reference: https://github.com/lexica/lexica/blob/08da51d6693f039cb81e9063544679f74b35fdf0/app/src/main/java/com/serwylo/lexica/game/Game.java#L71
const lengthScores = [
  0, 0, 0, // 0,1,2
  1, 1, 2, // 3,4,5
  3, 5, 8, // 6,7,8
  13, 21, 34, // 9,10,11
  55, 89, 144, // 12,13,14
  233, 377, 610, //14,15,16
  987, 1597, 2584, // 17,18,19
  4181, 6765, 10946, // 20,21,22
  17711, 28657, 46368, // 23,24,25
]

const scoreWordByLength = ({ length }: string) => lengthScores[length]

export const scoreWord = (word: string, scoreType: ScoreType, letterScores: MetadataV1['letterScores']) => {
  switch (scoreType) {
    case ScoreType.Letters:
      return scoreWordByLetterScores(word, letterScores)
    case ScoreType.Length:
      return scoreWordByLength(word)
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

export enum GameType {
  Invite = 'invite',
  Create = 'create'
}

export const useGameType = () => {
  const [gameType, setGameType] = useState(GameType.Invite)

  return {
    gameType,
    setGameType
  }
}

export const CurrentGameType = createContext<GameType>(GameType.Invite)
