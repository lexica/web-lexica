import * as R from 'ramda'

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

/** @type {(jsonStr: string) => (tok: Token) => [[number, number], string]} */
const makeErrorLocationGetter = jsonStr => {
  /** @type {([number, end, string])[]} */
  const lines = []
  let i
  const peek = () => (i + 1) < jsonStr.length ? jsonStr[i + 1] : '\0'

  let start = 0
  let line = ''
  for (i = 0; i < jsonStr.length; i++) {
    const currChar = jsonStr[i]
    if (currChar === '\n' || currChar === '\r' && peek() === '\n') {
      if (currChar === '\r') {
        i++
      }
      lines.push([start, i, line])
      start = i + 1
      line = ''
    } else { 
      line += currChar
    }

  }
  if (line.length) {
    lines.push([start, i, line])
  }
  return tok => {

    for(const [idx, [start, end, line]] of enumerate(lines)) {
      if (end < tok.startPos) continue
      const len = tok.endPos + 1 - tok.startPos
      const dStart = tok.startPos - start
      return [[idx, dStart], line + '\n' + ((new Array(dStart)).fill(' ').join('') + (new Array(len)).fill('^').join(''))]
    }
    return [[-1, -1], '']
  }
}

const JSym = /** @type {const} */ ({
  OBrace: 'open-curly',
  CBrace: 'closed-curly',
  OBracket: 'open-bracket',
  CBracket: 'closed-bracket',
  Colon: 'colon',
  Comma: 'comma',
  Str: 'string',
  Num: 'number',
  Nul: 'null',
  True: 'true',
  False: 'false',
  End: 'end',
})
/**
  * @typedef {(typeof JSym)[keyof typeof JSym]} JsonSymbol
  */

/**
  * @typedef {string | number | null | boolean} JScalar
  * @typedef {{
  *   symbol: (typeof SCALARS)[number],
  *   val: JScalar,
  *   startPos: number
  *   endPos: number
  * } | {
  *   symbol: Exclude<JsonSymbol, typeof SCALARS[number]>,
  *   val: undefined,
  *   startPos: number
  *   endPos: number
  * }} Token
  */

const WHITESPACE = /** @type {const} */ ([' ', '\t', '\n', '\r'])
const DIGITS = /** @type {const} */ (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'])
const NUMERIC = /** @type {const} */ ([...DIGITS, '-', '.', 'e', 'E', '+'])

/** @type {{ [sym: string]: JsonSymbol }} */
const SYMBOL_TO_NAME = {
  '{': JSym.OBrace,
  '}': JSym.CBrace,
  '[': JSym.OBracket,
  ']': JSym.CBracket,
  ':': JSym.Colon,
  ',': JSym.Comma,
}

const NAME_TO_LITERAL = /** {const} */ ({
  [JSym.Nul]: null,
  [JSym.True]: true,
  [JSym.False]: false,
})

const SCALARS = /** @type {const} */ ([
  JSym.Str,
  JSym.Num,
  JSym.Nul,
  JSym.True,
  JSym.False,
])

const TState = /** @type {const} */ ({
  Root: 'root',
  Obj: 'object',
  Arr: 'array',
})

const OState = /** @type {const} */ ({
  Start: 'start',
  GetKey: 'key',
  GetVal: 'val',
  Next: 'next',
})

const AState = /** @type {const} */ ({
  Start: 'start',
  GetVal: 'val',
  Next: 'next'
})


/** @typedef {import('./types.d.ts').JVal} JVal */

/**
  * @typedef {typeof TState} TStateT
  * @typedef {typeof OState} OStateT
  * @typedef {typeof AState} AStateT
  * @typedef {{
  *   stateType: TStateT['Root'],
  *   current: JVal[],
  *   startTok: Token,
  * }} RootContext
  * @typedef {{
  *   subState: OStateT['GetVal']
  *   key: string,
  * } | {
  *   subState: OStateT['Next' | 'GetKey' | 'Start']
  * }} OSubState
  * @typedef {{
  *   stateType: TStateT['Obj'],
  *   current: Map<string, JVal>
  *   startTok: Token,
  * } & OSubState} ObjectContext
  * @typedef {{
  *   stateType: TStateT['Arr'],
  *   current: JVal[],
  *   subState: AStateT[keyof AStateT],
  *   startTok: Token,
  * }} ArrayContext
  * @typedef {RootContext | ObjectContext | ArrayContext} ParseContext
  */

export const parseWithMap = (jsonStr) => {
  /** @type {Token[]} */
  const tokens = []
  const getErrLocation = makeErrorLocationGetter(jsonStr)
  let i = 0;
  /** @type {(msg: string, err?: Error) => Error} */
  const makeErr = (msg, err) => {
    if (!err) return new Error(msg)
    return new Error(msg + '\nOriginal error:\n' + err.message)
  }
  const peek = () => (i + 1) < jsonStr.length ? jsonStr[i + 1] : '\0'
  /** @type {() => Token} */
  const peekT = () => {
    if (i + 1 >= tokens.length) {
      const pos = tokens.length === 0 ? -1 : Math.min(jsonStr.length - 1, tokens[tokens.length - 1].endPos + 1)
      return {
        symbol: JSym.End,
        startPos: pos,
        endPos: pos
      }
    }
    return tokens[i + 1]
  }
  for (i = 0; i < jsonStr.length; i++) {
    let currChar = jsonStr[i]
    while (i < jsonStr.length && WHITESPACE.includes(currChar)) {
      i += 1
      currChar = jsonStr[i]
    }

    // we whitespace skipped to the end of the jsonStr
    if (i >= jsonStr.length) break

    if ([...DIGITS, '-'].includes(currChar)) {
      // number
      const start = i
      let numStr = ''
      while (true) {
        numStr += jsonStr[i]
        if (NUMERIC.includes(peek())) {
          i += 1
        } else break
      }
      const end = i
      let numVal
      try {
        numVal = JSON.parse(numStr)
      } catch (e) {
        throw makeErr(`Couldn't parse number starting at position ${start}. Number in question: '${numStr}'\n${getErrLocation({ startPos: start, endPos: end })[1]}`, e)
      }
      tokens.push({
        symbol: JSym.Num,
        val: numVal,
        startPos: start,
        endPos: end
      })
      continue
    }
    if (currChar === '"') {
      let escCount = 0
      const start = i
      let strStr = ''
      do {
        strStr += currChar
        const currChar_ = currChar
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
        throw makeErr(`Couldn't parse string starting at position ${start}. String in question: '${strStr}'\n${getErrLocation({ startPos: start, endPos: end })[1]}`, e)
      }

      tokens.push({
        symbol: JSym.Str,
        val: strVal,
        startPos: start,
        endPos: end
      })
      continue
    }


    if (SYMBOL_TO_NAME[currChar] !== undefined) {
      tokens.push({
        symbol: SYMBOL_TO_NAME[currChar],
        startPos: i,
        endPos: i,
        val: undefined
      })
      continue
    }


    let found = false
    for(const literal of [JSym.Nul, JSym.True, JSym.False]) {
      if (jsonStr.slice(i, i + literal.length) !== literal) continue

      tokens.push({
        symbol: literal,
        startPos: i,
        endPos: i + literal.length - 1,
        val: NAME_TO_LITERAL[literal],
      })
      i += literal.length - 1
      found = true
      break
    }
    if (found) continue
    throw new Error(`Unexpected symbol found at ${i + 1}: ${currChar}`)
  }

  // Early Exit
  if (!tokens.length) {
    throw new Error("Unexpected end of JSON: No tokens were found!")
  }
  /** @type {ParseContext[]} */
  const stack = []
  /** @type {ParseContext} */
  let currContext = {
    current: [],
    stateType: TState.Root,
    startTok: tokens[0]
  }
  for (i = 0; i < tokens.length; i++) {
    const tok = tokens[i]
    const [[line, col], printable] = getErrLocation(tok)
    const [[nLine, nCol], nPrintable] = getErrLocation(peekT())

    if (stack.length > MAX_DEPTH) {
      throw new Error(`Depth limit of ${MAX_DEPTH} reached at line ${line + 1} col ${col}`)
    }
    const popContext = () => {
      const prevContext = stack.pop()
      if (prevContext.stateType === TState.Obj && prevContext.subState === OState.GetVal) {
        prevContext.current.set(prevContext.key, currContext.current)
        currContext = {
          ...prevContext,
          subState: OState.Next
        }
      } else if (prevContext.stateType === TState.Arr && [AState.GetVal, AState.Start].includes(prevContext.subState)) {
        prevContext.current.push(currContext.current)
        currContext = {
          ...prevContext,
          subState: AState.Next
        }
      } else if (prevContext.stateType === TState.Root) {
        prevContext.current.push(currContext.current)
        currContext = prevContext
      } else {
        const [[startLine, startCol], startPrintable] = getErrLocation(prevContext.startTok)
        throw new Error(`Unexpected parse state: Pushing an ${currContext.stateType} onto a context of '${prevContext.stateType}:${prevContext.subState ?? 'ERR'}' is unsupported.\nErr start (${startLine + 1}:${startCol}):\n${startPrintable}\nErr end (${nLine + 1}:${nCol}):\n${nPrintable}`)
      }
    }
    switch (currContext.stateType) {
      case TState.Root:
        if (i > 0) {
            throw new Error(`Found ${tokens.length - 1} unexpected tokens at root after first value.\n${printable}`)
        } else if (SCALARS.includes(tok.symbol)) {
          if (tokens.length > 1) {
            throw new Error(`Found ${tokens.length - 1} unexpected tokens at root after recieving a non object or array value.\n${printable}`)
          }
          currContext.current.push(tok.val)
        } else if (tok.symbol === JSym.OBrace) {
          stack.push(currContext)
          currContext = {
            stateType: TState.Obj,
            subState: OState.Start,
            current: new Map(),
            startTok: tok,
          }
        } else if (tok.symbol === JSym.OBracket) {
          stack.push(currContext)
          currContext = {
            stateType: TState.Arr,
            subState: AState.Start,
            current: [],
            startTok: tok,
          }
        } else {
          throw new Error(`Found unexpected symbol: '${tok.symbol}' at line ${line + 1}, col ${col}:\n${printable}`)
        }
        break
      case TState.Obj:
        switch (currContext.subState) {
          case OState.Start:
            if (tok.symbol === JSym.CBrace) {
              popContext()
              // optional break
              break
            }
            // intentional fall-through
          case OState.GetKey:
            if (tok.symbol !== JSym.Str) {
              throw new Error(`Found unexpected symbol: '${tok.symbol}' at line ${line + 1}, col ${col} when an object key was expected:\n${printable}`)
            }
            const nextT = peekT()
            if (nextT.symbol === JSym.End) {
              throw new Error(`Unexpected end of json at line ${nLine + 1}, col ${nCol}. Expected '${JSym.Colon}'.\n${nPrintable}`)
            } else if (nextT.symbol !== JSym.Colon) {
              throw new Error(`Unexpected symbol found at line ${nLine + 1}, col ${nCol}. Expected '${JSym.Colon}', found '${nextT.symbol}'\n${nPrintable}`)
            } else {
              // consume next token as well, simplifies state management.
              i += 1
            }
            currContext = {
              ...currContext,
              subState: OState.GetVal,
              key: tok.val
            }
            break
          case OState.GetVal:
            if (SCALARS.includes(tok.symbol)) {
              currContext.current.set(currContext.key, tok.val)
              currContext = {
                ...currContext,
                subState: OState.Next,
              }
            } else if (tok.symbol === JSym.OBrace) {
              stack.push(currContext)
              currContext = {
                stateType: TState.Obj,
                subState: OState.Start,
                current: new Map(),
                startTok: tok,
              }
            } else if (tok.symbol === JSym.OBracket) {
              stack.push(currContext)
              currContext = {
                stateType: TState.Arr,
                subState: AState.Start,
                current: [],
                startTok: tok,
              }
            } else {
              throw new Error(`Unexpected symbol found at line ${line + 1}, col ${col}. Expected a valid value, object or array. Found '${tok.symbol}'\n${printable}`)
            }
            break
          case OState.Next:
            if (tok.symbol === JSym.Comma) {
              currContext = {
                ...currContext,
                subState: OState.GetKey,
              }
            } else if (tok.symbol === JSym.CBrace) {
              popContext()
            } else {
              throw new Error(`Unexpected symbol found at line ${line + 1}, col ${col}. Expected a ${JSym.Comma} or ${JSym.CBrace}. Found '${tok.symbol}'\n${printable}`)
            }
            break
          default:
            throw new Error(`Object sub-state of '${currContext.subState}' is not supported. line ${line + 1} col ${col + 1}\n${printable}`)
        }
        break
      case TState.Arr:
        switch (currContext.subState) {
          case AState.Start:
            if (tok.symbol === JSym.CBracket) {
              popContext()
              break
            }
          // intentional fall-through
          case AState.GetVal:
            if (SCALARS.includes(tok.symbol)) {
              currContext.current.push(tok.val)
              currContext = {
                ...currContext,
                subState: AState.Next,
              }
            } else if (tok.symbol === JSym.OBrace) {
              stack.push(currContext)
              currContext = {
                stateType: TState.Obj,
                subState: OState.Start,
                startTok: tok,
                current: new Map(),
              }
            } else if (tok.symbol === JSym.OBracket) {
              stack.push(currContext)
              currContext = {
                stateType: TState.Arr,
                subState: AState.Start,
                startTok: tok,
                current: []
              }
            } else {
              throw new Error(`Expected a valid ${SCALARS.join(', ')}, object or array at line ${line + 1} col ${col}. Instead found token '${tok.symbol}'\n${printable}`)
            }
            break
          case AState.Next:
            if (tok.symbol === JSym.Comma) {
              currContext = {
                ...currContext,
                subState: AState.GetVal,
              }
            } else if (tok.symbol === JSym.CBracket) {
              popContext()
            } else {
              throw new Error(`Expected a '${JSym.Comma}' or '${JSym.CBracket}' instead found '${tok.symbol}'.\n${printable}`)
            }
            break
          default:
            throw new Error(`Array sub-state of '${currContext.subState}' is not supported. line ${line + 1} col ${col + 1}\n${printable}`)
        }
        break
    }
  }
  const [[line, col], printable] = getErrLocation(tokens[tokens.length - 1])
  if (currContext.stateType === TState.Root) {
    if (currContext.current.length === 1) {
      return currContext.current[0]
    }
    throw new Error(`Unexpected multi-value found at root of JSON!`)
  }
  const [[startLine, startCol], startPrintable] = getErrLocation(currContext.startTok)
  const currType = currContext.stateType
  throw new Error(`Unexpected end of ${currType} found in JSON at line ${line + 1} col ${col + 1}!\n${currType} start (${startLine + 1}:${startCol}):\n${startPrintable}\n${currType} end (${line + 1}:${col}):\n${printable}`)
}

const MAX_DEPTH = 100

const main = async () => {
  const fs = await import('node:fs/promises')
  const TEST_DIR = './translations/test-parsing'
  const dirContents = await fs.readdir(TEST_DIR)
  /** @type {(testFile: string) => Promise<{ filename: string, implementation: boolean, correct: boolean, passed: boolean, err: Error, out: JVal }> */
  const runTest = async testFile => {
    const testPath = TEST_DIR + '/' + testFile
    const fileContents = await fs.readFile(testPath, { encoding: 'utf8' })
    let failed = false
    let err = undefined
    let out = undefined
    try {
      out = parseWithMap(fileContents)
    } catch (e) {
      err = e
      failed = true
    }
    if (testFile.startsWith('y_')) {
      return {
        filename: testFile,
        correct: !failed,
        passed: !failed,
        err,
        out,
        implementation: false,
      }
    } else if (testFile.startsWith('n_')) {
      return {
        filename: testFile,
        correct: failed,
        passed: !failed,
        err,
        out,
        implementation: false,
      }
    } else if (testFile.startsWith('i_')) {
      return {
        filename: testFile,
        correct: true,
        passed: !failed,
        err,
        out,
        implementation: true,
      }
    }
  }
  // console.log(dirContents.filter(f => f.endsWith('.json').map(runTest))
  // const testResults = await Promise.all(dirContents.filter(f => f.endsWith('.json')).map(runTest))
  const testResults = []
  for(const testFile of dirContents.filter(f => f.endsWith('.json'))) {
    console.log(`    - testing ${testFile}...`)
    const result = await runTest(testFile)
    if (result.correct === true) {
      const whatHappened = result.failed ? 'failed appropriately' : 'parsed successfully'
      console.log(`Success: ${testFile} ${whatHappened}!`)
    } else {
      console.log(`Failure: ${testFile} failed it's test`)
      testResults.push(result)
    }

  }
  for (const result of testResults) {
    const whatHappened = result.passed ? 'passed when it should have failed' : 'failed when it should have passed'
    const clue = result.passed ? result.out : result.err

    console.log(`Test file ${result.filename} ${whatHappened}. Clue:`)
    console.log(clue)
  }
  // console.log(parseWithMap(fileContents))
}

if (import.meta.main) main()
