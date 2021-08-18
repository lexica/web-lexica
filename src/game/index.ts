import * as R from 'ramda'

import scores from './scores.json'

export enum PointModes {
  Letters = 'letters',
  Length = 'length'
}

const alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'qu', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'] as const
type Alphabet = typeof alphabet[number]

export const scoreWord = (word: string, _pointMode: PointModes = PointModes.Letters) => R.pipe<string, Alphabet[], number>(
  R.splitEvery(1) as (a: string) => Alphabet[],
  R.reduce<Alphabet, number>((acc, letter) => acc + scores[(letter as string) === 'q' ? 'qu' : letter], 0)
)(word)

export const orderByWordScore = (dictionary: string[]) => R.sortWith([R.descend<string>(scoreWord), R.ascend<string>(R.identity)], dictionary)
