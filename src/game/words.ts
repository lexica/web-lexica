import * as R from 'ramda'
import { logger } from '../util/logger'

export const orderWordAlphabetically = (line: string, dedupe: boolean = false) => {
  const orderedLine = R.pipe<string, string[], string[], string>(
    R.splitEvery(1) as any as (a: string) => string[],
    R.sort((a: string, b: string) => a.charCodeAt(0) - b.charCodeAt(0)),
    R.join('')
  )(line)

  const removeDuplicates = R.pipe<string, string[], string[], string>(
    R.splitEvery(1) as any as (a: string) => string[],
    R.uniq as (a: string[]) => string[],
    R.join('')
  )

  return dedupe ? removeDuplicates(orderedLine) : orderedLine
}

export type LetterCount = {
  [key: string]: number
}

export type SortFn = (letters: string[]) => string[]
export const sort = {
  byLength: R.sortWith([
    R.descend(R.prop('length')),
    R.ascend(R.identity)
  ]) as SortFn,
  alphabetically: R.sort(R.ascend(R.identity)) as SortFn
}

export const splitWordIntoLetters = (word: string, letters: string[], sortWith?: (letters: string[]) => string[]) => {
  const orderedLetters = sort.byLength(letters)
  let w = word
  const response: string[] = []
  while (w.length) {
    const startingLength = w.length
    for (const letter of orderedLetters) {
      if (w.indexOf(letter) === 0) {
        w = w.substring(letter.length)
        response.push(letter)
        break
      }
    }
    const endingLength = w.length
    if (startingLength === endingLength) {
      throw new Error(`Cannot match next letter in word to given letters, remaining word: ${w}, letters: ${JSON.stringify(letters)}`)
    }
  }

  if (sortWith) return sortWith(response)

  return response
}

export const getLetterCounts = (word: string, validLetters: string[]) => {
  let currentChar = '\0'


  return R.reduce((acc: LetterCount, letter: string) => {
    if (letter !== currentChar) {
      currentChar = letter
      return { ...acc, [letter]: 1 }
  }

    return { ...acc, [letter]: acc[letter] + 1 }
  }, {}, splitWordIntoLetters(word, validLetters, sort.byLength))
}
