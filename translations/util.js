import * as R from 'ramda'

export const mergeObjects = (partial1, partial2, ignoreConflicts = false) => R.mergeDeepWithKey((key, val1, val2) => {
  if (typeof ignoreConflicts === 'boolean' && ignoreConflicts) return val1
  console.warn(`Merge conflict detected at key: ${key}. First value will be used.
value one: ${val1}, value two: ${val2}


full object 1: ${JSON.stringify(partial1)}


full object 2: ${JSON.stringify(partial2)}`)
  return val1
}, partial1, partial2)
