import * as R from 'ramda'

const compareLists = R.pipe<string[], string[], ([string, string])[], boolean>(
  R.zip as (a: string[], b: string[]) => ([a: string, b: string])[],
  R.reduceWhile<[string, string], boolean>(R.identity, (_, [a, b]) => a === b, true)
)

export const stringArraysAreEqual = (arrA: string[], arrB: string[]) => {
  if (Object.is(arrA, arrB)) return true // early exit if both are same object

  return compareLists(arrA, arrB)
}
