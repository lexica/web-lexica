import { ReproduceableJSONUnexpectedSymbol } from './errors.js'
import { DIGITS, NAME_TO_LITERAL, WHITESPACE, SYMBOL_TO_NAME, JSym, NUMERIC } from './types.js'
import { getLinesFromJson } from './util.js'

/** @import {Token} from './type-helper.d.ts' */

export const getTokens = (jsonStr) => {
  /** @type {Token[]} */
  const tokens = []
  const lines = getLinesFromJson(jsonStr)
  const getRowAndCol = index => {
    const line = lines.find(({ start }) => start <= index)
    if (!line) return { row: -1, col: -1 }

    return { row: line.index, col: index - line.start }
  }
  /** @type {(msg: string, err?: Error) => Error} */
  const makeErr = (msg, err) => {
    if (!err) return new Error(msg)
    return new Error(msg + '\nOriginal error:\n' + err.message)
  }
  const peek = i => (i + 1) < jsonStr.length ? jsonStr[i + 1] : '\0'

  for (let i = 0; i < jsonStr.length; i++) {
    let currChar = jsonStr[i]
    while (i < jsonStr.length && WHITESPACE.includes(currChar)) {
      i += 1
      currChar = jsonStr[i]
    }

    // we whitespace skipped to the end of the jsonStr
    if (i >= jsonStr.length) {
      tokens.push({
        symbol: JSym.End,
        ...getRowAndCol(jsonStr.length - 1), // feels safer.
        val: undefined,
        startPos: jsonStr.length - 1,
        length: 1,
      })
      continue
    }

    if ([...DIGITS, '-'].includes(currChar)) {
      // number
      const start = i
      let numStr = ''
      while (true) {
        numStr += jsonStr[i]
        if (NUMERIC.includes(peek(i))) {
          i += 1
        } else break
      }
      const end = i
      let numVal
      try {
        numVal = JSON.parse(numStr)
      } catch (e) {
        const printable = getPrintableToken({ startPos: start, length: end - start, ...getRowAndCol(start) }, lines)
        throw makeErr(`Couldn't parse number starting at position ${start}. Number in question: '${numStr}'\n${printable}`, e)
      }
      tokens.push({
        symbol: JSym.Num,
        val: numVal,
        startPos: start,
        length: numStr.length,
        ...getRowAndCol(start),
      })
      continue
    }
    if (currChar === '"') {
      let escCount = 0
      const start = i
      let strStr = ''
      do {
        strStr += currChar
        // const currChar_ = currChar
        if (currChar === '\\')  escCount += 1 
        else escCount = 0
        i += 1
        if (i >= jsonStr.length) break
        currChar = jsonStr[i]
      } while (escCount % 2 === 1 || currChar !== '"')
      if (i < jsonStr.length) {
        strStr += currChar
      }
      const end = i
      let strVal
      try {
        strVal = JSON.parse(strStr)
      } catch(e) {
        const printable = getPrintableToken({ startPos: start, length: end - start, ...getRowAndCol(start) }, lines)
        throw makeErr(`Couldn't parse string starting at position ${start}. String in question: '${strStr}'\n${printable}`, e)
      }

      tokens.push({
        symbol: JSym.Str,
        val: strVal,
        startPos: start,
        length: strStr.length,
        ...getRowAndCol(start)
      })
      continue
    }

    if (SYMBOL_TO_NAME[currChar] !== undefined) {
      tokens.push({
        symbol: SYMBOL_TO_NAME[currChar],
        startPos: i,
        length: 1,
        val: undefined,
        ...getRowAndCol(i),
      })
      continue
    }


    let found = false
    for(const literal of [JSym.Nul, JSym.True, JSym.False]) {
      if (jsonStr.slice(i, i + literal.length) !== literal) continue

      tokens.push({
        symbol: literal,
        startPos: i,
        length: literal.length,
        val: NAME_TO_LITERAL[literal],
        ...getRowAndCol(i),
      })
      i += literal.length - 1
      found = true
      break
    }
    if (found) continue
    const escaped = JSON.stringify(currChar).replace(/(^"|"$)/g, '')
    throw new ReproduceableJSONUnexpectedSymbol(null, { startPos: i, ...getRowAndCol(i), symbol: escaped, length: 1 }, lines)
  }
  return tokens
}

