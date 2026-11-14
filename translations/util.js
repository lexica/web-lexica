import * as R from 'ramda'

/** @import {JVal} from './json-parser/type-helper.d.ts' */
/** @type {(map: Map<string, JVal>, obj: any, overwriteMap?: boolean) => Map<str, JVal>} */
export const mergeLeftMap = (map, obj, overwriteMap = false) => {
  const keys = []
  const entries = [...map]
  for (const [k, v] of entries) {
    if (!Object.hasOwn(obj, k)) continue
    keys.push(k)
    const otherV = obj[k]
    if (v instanceof Map && otherV !== undefined && typeof otherV === 'object' && !Array.isArray(otherV)) {
      map.set(k, mergeLeftMap(v, otherV, overwriteMap))
    } else if (overwriteMap && obj[k] !== undefined) map.set(k, obj[k])
  }

  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue
    if (keys.includes(k)) continue
    if (typeof v === 'object' && !Array.isArray(v)) map.set(k, mergeLeftMap(new Map(), v, overwriteMap))
    else map.set(k, v)
  }
  return map
}
export const mergeObjects = (partial1, partial2, ignoreConflicts = false) => R.mergeDeepWithKey((key, val1, val2) => {
  if (typeof ignoreConflicts === 'boolean' && ignoreConflicts) return val1
  console.warn(`Merge conflict detected at key: ${key}. First value will be used.
value one: ${val1}, value two: ${val2}


full object 1: ${JSON.stringify(partial1)}


full object 2: ${JSON.stringify(partial2)}`)
  return val1
}, partial1, partial2)

/** @type {<T extends any>(iter: T[]) => Generator<[number, T], void, [number, T]>} */
export function* enumerate(iter) {
  let i = 0
  for (const item of iter) {
    yield [i, item]
    i += 1
  }
}

