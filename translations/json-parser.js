import assert from 'node:assert'
import { randomUUID } from 'node:crypto'

const MAX_DEPTH = 100

/** @type {(jsonStr: string) => ({ start: number, end: number, line: string, index: number })[]} */
const makeLines = jsonStr => {
  /** @type {ReturnType<typeof makeLines>} */
  const lines = []
  const peek = i => (i + 1) < jsonStr.length ? jsonStr[i + 1] : '\0'

  let start = 0
  let line = ''
  for (let i = 0; i < jsonStr.length; i++) {
    const currChar = jsonStr[i]
    if (currChar === '\n' || currChar === '\r' && peek(i) === '\n') {
      if (currChar === '\r') {
        i++
      }
      lines.push({ start, end: i, line, index: lines.length })
      start = i + 1
      line = ''
    } else { 
      line += currChar
    }

  }
  if (line.length) {
    lines.push({ start, end: jsonStr.length - 1, line, index: lines.length })
  }
  return lines
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
  * @typedef {import('./types.d.ts').JScalar} JScalar
  * @typedef {{ startPos: number, length: number, startWhitespace: string, row: number, col: number}} BaseToken
  * @typedef {({
  *   symbol: (typeof SCALARS)[number],
  *   val: JScalar,
  * } | {
  *   symbol: Exclude<JsonSymbol, typeof SCALARS[number]>,
  *   val: undefined,
  * }) & BaseToken} Token
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

const SCALARS = /** @type {const} */ ([
  JSym.Str,
  JSym.Num,
  JSym.Nul,
  JSym.True,
  JSym.False,
])

/** @type {{ [P in typeof JSym[keyof typeof JSym]: string }} */
const NAME_TO_SYMBOL = {
  ...SCALARS.reduce((acc, s) => ({ ...acc, [s]: s }), {}),
  [JSym.End]: 'END',
  [JSym.OBrace]: '{',
  [JSym.CBrace]: '}',
  [JSym.OBracket]: '[',
  [JSym.CBracket]: ']',
  [JSym.Colon]: ':',
  [JSym.Comma]: ',',
}


const NAME_TO_LITERAL = /** {const} */ ({
  [JSym.Nul]: null,
  [JSym.True]: true,
  [JSym.False]: false,
})

const TState = /** @type {const} */ ({
  Root: 'root',
  Obj: 'object',
  Arr: 'array',
})

const OState = /** @type {const} */ ({
  Start: 'start',
  GetKey: 'key',
  GetCol: 'colon',
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
  *   id: import('node:crypto').UUID,
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
  *   id: import('node:crypto').UUID,
  * } & OSubState} ObjectContext
  * @typedef {{
  *   stateType: TStateT['Arr'],
  *   current: JVal[],
  *   subState: AStateT[keyof AStateT],
  *   startTok: Token,
  *   id: import('node:crypto').UUID,
  * }} ArrayContext
  * @typedef {RootContext | ObjectContext | ArrayContext} ParseContext
  */

/** @type {ParseContext} */
const asdfasdf = {}

asdfasdf.id
const getTokens = (jsonStr) => {
  /** @type {Token[]} */
  const tokens = []
  const lines = makeLines(jsonStr)
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
    let whitespace = ''
    while (i < jsonStr.length && WHITESPACE.includes(currChar)) {
      i += 1
      whitespace += currChar
      currChar = jsonStr[i]
    }

    // we whitespace skipped to the end of the jsonStr
    if (i >= jsonStr.length) {
      tokens.push({
        symbol: JSym.End,
        whitespace,
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
        whitespace,
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
        whitespace,
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
        whitespace,
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
        whitespace,
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


/** @type {(token: Token, lines: ReturnType<typeof makeLines>} */
const getPrintableToken = (token, lines) => {
  if (token.row >= lines.length) return `ERR: Couldn't print token. Symbol: '${token.symbol}'. value: '${token.val === undefined ? '' : token.val}'`

  const { line } = lines[token.row]
  const markerBegin = token.col > 0 ? (new Array(token.col)).fill(' ').join('') : ''
  const marker = (new Array(Math.min(token.length, 1))).fill('^').join('')
  return `${line}\n${markerBegin}${marker}`

}

/** @type {(prefill: Partial<ParseContext>) => ParseContext} */
const getNewContext = (prefill = {}) => ({
  stateType: TState.Root,
  current: [],
  startTok: { row: -1, col: -1, length: -1, symbol: JSym.End, whitespace: '' },
  id: randomUUID(),
  ...prefill,
})

class ReproduceableJSONParseError extends Error {
  constructor(message, token, lines, options) {
    super(message, options)
    this.token = token
    this.tokenPrintable = getPrintableToken(token, lines)
    this.message = `${message}\nLocation: ${this.getLineVerbose()}\n${this.tokenPrintable}`
  }
  getLineVerbose(token = undefined) {
    if (!token) {
      token = this.token
    }
    return `line ${token.row + 1}, column ${token.col}`
  }
  getLineTerse(token = undefined) {
    if (!token) {
      token = this.token
    }
    return `L#${token.row + 1}:${token.col}`
  }
}
class ReproduceableJSONUnexpectedSymbol extends ReproduceableJSONParseError {
  constructor(expected, token, lines, options) {
    super('', token, lines, options)
    const sym = NAME_TO_SYMBOL[this.token.symbol] ?? this.token.symbol
    const messagePrefix = `Parsing error: Unexpected symbol '${sym}' found at ${this.getLineVerbose()}.`
    if (expected) {
      this.message = `${messagePrefix} expected ${expected} instead.\n${this.tokenPrintable}`
    } else {
      this.message = `${messagePrefix}\n${this.tokenPrintable}`
    }
  }
}
class ReproduceableJSONUnexpectedEnd extends ReproduceableJSONParseError {
  constructor(expected, token, lines, options) {
    super('', token, lines, options)
    const messagePrefix = `Parsing error: Unexpected end of JSON at ${this.getLineVerbose()}.`
    if (expected) {
      this.message = `${messagePrefix} expected ${expected} instead.\n${this.tokenPrintable}`
    } else {
      this.message = `${messagePrefix}\n${this.tokenPrintable}`
    }
  }
}


/**
  * @typedef {{
  *   currContext: ParseContext,
  *   token: Token,
  *   isFirstToken: boolean,
  *   handleCloseContext: () => ParseContext,
  *   lines: ReturnType<typeof makeLines>,
  * }} StateHandlerParams
  */

/** @typedef {(params: StateHandlerParams) => ParseContext} StateHandler */

/** @type {StateHandler} */
const handleObjectState = (params) => {
  const {
    currContext,
    handleCloseContext,
    token,
    lines
  } = params
  switch (currContext.subState) {
    case OState.Start:
      if (token.symbol === JSym.CBrace) {
        return handleCloseContext()
      }
      // intentional fall-through
    case OState.GetKey:
      if (token.symbol !== JSym.Str) {
        throw new ReproduceableJSONUnexpectedSymbol('an object key', token, lines)
      }
      return {
        ...currContext,
        subState: OState.GetCol,
        key: token.val
      }
    case OState.GetCol:
      if (token.symbol === JSym.End) {
        throw new ReproduceableJSONUnexpectedEnd(`'${NAME_TO_SYMBOL[JSym.Colon]}'`, token, lines)
      } else if (token.symbol !== JSym.Colon) {
        throw new ReproduceableJSONUnexpectedSymbol(`'${NAME_TO_SYMBOL[JSym.Colon]}'`, token, lines)
      }
      return { ...currContext, subState: OState.GetVal, }
    case OState.GetVal:
      if (SCALARS.includes(token.symbol)) {
        currContext.current.set(currContext.key, token.val)
        return { ...currContext, subState: OState.Next }
      } else if (token.symbol === JSym.OBrace) {
        return getNewContext({
          stateType: TState.Obj,
          subState: OState.Start,
          current: new Map(),
          startTok: token,
        })
      } else if (token.symbol === JSym.OBracket) {
        return getNewContext({
          stateType: TState.Arr,
          subState: AState.Start,
          current: [],
          startTok: token,
        })
      } else {
        throw new ReproduceableJSONUnexpectedSymbol('a valid value, object or array', token, lines)
      }
    case OState.Next:
      if (token.symbol === JSym.Comma) {
        return { ...currContext, subState: OState.GetKey }
      } else if (token.symbol === JSym.CBrace) {
        return handleCloseContext()
      } else {
        throw new ReproduceableJSONUnexpectedSymbol(`'a '${NAME_TO_SYMBOL[JSym.Comma]}' or '${NAME_TO_SYMBOL[JSym.CBrace]}'`, token, lines)
      }
    default:
      throw new ReproduceableJSONParseError(`Object sub-state of '${currContext.subState}' is not supported.`, token, lines)
  }
}

/** @type {StateHandler} */
const handleArrayState = (params) => {
  const { currContext, handleCloseContext, token, lines } = params

  switch (currContext.subState) {
    case AState.Start:
      if (token.symbol === JSym.CBracket) {
        return handleCloseContext()
      }
    // intentional fall-through
    case AState.GetVal:
      if (SCALARS.includes(token.symbol)) {
        currContext.current.push(token.val)
        return {
          ...currContext,
          subState: AState.Next,
        }
      } else if (token.symbol === JSym.OBrace) {
        return getNewContext({
          stateType: TState.Obj,
          subState: OState.Start,
          startTok: token,
          current: new Map(),
        })
      } else if (token.symbol === JSym.OBracket) {
        return getNewContext({
          stateType: TState.Arr,
          subState: AState.Start,
          startTok: token,
          current: []
        })
      } else {
        throw new ReproduceableJSONUnexpectedSymbol(`a valid ${SCALARS.join(', ')}, object or array`, token, lines)
      }
    case AState.Next:
      if (token.symbol === JSym.Comma) {
        return {
          ...currContext,
          subState: AState.GetVal,
        }
      } else if (token.symbol === JSym.CBracket) {
        return handleCloseContext()
      } else {
        throw new ReproduceableJSONUnexpectedSymbol(`'${NAME_TO_SYMBOL[JSym.Comma]}' or '${NAME_TO_SYMBOL[JSym.CBracket]}'`, token, lines)
      }
    default:
      throw new ReproduceableJSONParseError(`Array sub-state of '${currContext.subState}' is not supported.`, token, lines)
  }
}

/** @type {StateHandler} */
const handleRootState = (params) => {
  const { currContext, token, lines, isFirstToken } = params

  if (token.symbol === JSym.End) return currContext
  if (!isFirstToken) {
      throw new ReproduceableJSONUnexpectedSymbol('end of json', token, lines)
  }
  if (SCALARS.includes(token.symbol)) {
    currContext.current.push(token.val)
    return currContext
  }
  if (token.symbol === JSym.OBrace) {
    return getNewContext({
      stateType: TState.Obj,
      subState: OState.Start,
      current: new Map(),
      startTok: token,
    })
  }
  if (token.symbol === JSym.OBracket) {
    return getNewContext({
      stateType: TState.Arr,
      subState: AState.Start,
      current: [],
      startTok: token,
    })
  }

  throw new ReproduceableJSONUnexpectedSymbol(null, token, lines)
}

const closeCurrentContext = (currContext, stack) => {
  const prevContext = stack[stack.length - 1]

  if (prevContext.stateType === TState.Obj && prevContext.subState === OState.GetVal) {
    prevContext.current.set(prevContext.key, currContext.current)
    return { ...prevContext, subState: OState.Next }
  }
  if (prevContext.stateType === TState.Arr && [AState.GetVal, AState.Start].includes(prevContext.subState)) {
    prevContext.current.push(currContext.current)
    return { ...prevContext, subState: AState.Next }
  }
  if (prevContext.stateType === TState.Root) {
    prevContext.current.push(currContext.current)
    return prevContext
  }
  throw new ReproduceableJSONParseError(
    `Unexpected parse state: Pushing an ${currContext.stateType} onto a context of '${prevContext.stateType}:${prevContext.subState ?? 'ERR'}' is unsupported.`,
    prevContext.startTok,
    lines,
  )
}

export const parseReproduceableJSON = (jsonStr) => {
  const tokens = getTokens(jsonStr)
  const lines = makeLines(jsonStr)
  // Early Exit
  if (!tokens.length) {
    throw new ReproduceableJSONParseError("Unexpected end of JSON: No tokens were found!", { row: 0, col: 0, length: 0 }, lines)
  }

  /** @type {ParseContext[]} */
  const stack = []
  /** @type {ParseContext} */
  let currContext = getNewContext({
    current: [],
    stateType: TState.Root,
    startTok: tokens[0]
  })

  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i]
    assert(currContext.id ?? false, JSON.stringify(currContext))

    if (stack.length > MAX_DEPTH) {
      throw new ReproduceableJSONParseError(`Depth limit of ${MAX_DEPTH} reached.`, tok, lines)
    }
    const handler = {
      [TState.Root]: handleRootState,
      [TState.Obj]: handleObjectState,
      [TState.Arr]: handleArrayState,
    }[currContext.stateType]

    const context = handler({
      token: tok,
      lines,
      currContext,
      handleCloseContext: () => closeCurrentContext(currContext, stack),
      isFirstToken: i === 0,
    })

    if (stack.length && context.id === stack[stack.length - 1].id) {
      stack.pop()
    } else if (context.id !== currContext.id) {
      stack.push(currContext)
    }
    currContext = context
  }
  if (currContext.stateType === TState.Root) {
    if (currContext.current.length === 1) {
      return currContext.current[0]
    }
    throw new ReproduceableJSONParseError('Unexpected multi-value found at root of JSON!', { row: 0, col: 0, length: 1 }, lines)
  }
  throw new ReproduceableJSONParseError(`Unexpected end of ${currContext.stateType}`, currContext.startTok, lines)
}


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
      out = parseReproduceableJSON(fileContents)
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
  const testResults = []
  for(const testFile of dirContents.filter(f => f.endsWith('.json'))) {
    const result = await runTest(testFile)
    if (result.implementation === true && result.passed === false) {
      console.log(`Soft Fail: ${testFile} didn't parse!`)
    } else if (result.correct != true){
      console.log(`Failure:   ${testFile} failed it's test: it should have ${result.passed ? 'failed to parse' : 'parsed successfully'}`)
      testResults.push(result)
    } else if (result.passed) {
    }

  }
  for (const result of testResults) {
    const whatHappened = result.passed ? 'passed when it should have failed' : 'failed when it should have passed'
    const clue = result.passed ? result.out : result.err

    console.log(`Test file ${result.filename} ${whatHappened}. Clue:`)
    console.log(clue)
  }
}

if (import.meta.main) main()

