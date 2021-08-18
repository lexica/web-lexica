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

type LetterCount = {
  [key: string]: number
}

export const getLetterCounts = (word: string) => {
  const ordered = orderWordAlphabetically(word)
  let currentChar = '\0'


  return R.reduce((acc: LetterCount, letter: string) => {
    if (letter !== currentChar) {
      currentChar = letter
      return { ...acc, [letter]: 1 }
  }

    return { ...acc, [letter]: acc[letter] + 1 }
  }, {}, R.splitEvery(1, ordered))
}
