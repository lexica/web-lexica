import * as R from 'ramda'

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

const splitWordIntoLetters = (word: string, letters: string[], sortResponse?: boolean) => {
  const orderedLetters = R.sort(R.descend(R.prop('length')), letters)
  let w = word
  const response: string[] = []
  while (w.length) {
    const startingLength = w.length
    for (const letter in orderedLetters) {
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

  if (sortResponse) return R.sortWith([
    R.descend(R.prop('length')),
    R.ascend(R.identity)
  ], response)

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
  }, {}, splitWordIntoLetters(word, validLetters, true))
}
