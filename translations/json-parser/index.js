import assert from 'node:assert'
import { randomUUID } from 'node:crypto'

import { ReproduceableJSONParseError, ReproduceableJSONUnexpectedEnd, ReproduceableJSONUnexpectedSymbol } from './errors.js'
import { getTokens } from './tokenizer.js'
import { SCALARS, NAME_TO_SYMBOL, AState, OState, TState, JSym } from './types.js'
import { getLinesFromJson } from './util.js'
import { readdir } from 'node:fs/promises'
import { statSync } from 'node:fs'


/**
  * @import {Token, ParseContext, JVal} from './type-helper.d.ts'
  * @import {LineInfo} from './util.js'
  */

const MAX_DEPTH = 100


/** @type {(prefill: Partial<ParseContext>) => ParseContext} */
const getNewContext = (prefill = {}) => ({
  stateType: TState.Root,
  current: [],
  startTok: { row: -1, col: -1, length: -1, symbol: JSym.End, whitespace: '' },
  id: randomUUID(),
  ...prefill,
})

/**
  * @typedef {{
  *   currContext: ParseContext,
  *   token: Token,
  *   isFirstToken: boolean,
  *   handleCloseContext: () => ParseContext,
  *   lines: LineInfo[],
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
  const lines = getLinesFromJson(jsonStr)
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


const stringifyProp = (k, v, indent, indentCount) => {
  const getIndent = getGetIndent(indentCount)
  return `${getIndent(indent)}${JSON.stringify(k)}: ${stringifyReproduceableJSONRecurse(v, indent, true, indentCount)}`
}
const getGetIndent = count => level => level === 0 ? '' : (new Array(level * count)).fill(' ').join('')

/** @type {(obj: JVal, indent?: number, isValue?: boolean, indentCount?: number) => string} */
const stringifyReproduceableJSONRecurse = (obj, indent = 0, isValue = false, indentCount = 2) => {
  const getIndent = getGetIndent(indentCount)
  const indentation = isValue ? '' : getIndent(indent)

  if (obj === undefined) return ''
  if (obj instanceof Map) {
    if (obj.size === 0) return `${indentation}{}`
    return `${indentation}{\n${[...obj].map(([k, v]) => stringifyProp(k, v, indent + 1, indentCount)).join(',\n')}\n${getIndent(indent)}}`
  }
  if (obj === null) return `${indentation}null`
  if (['string', 'boolean', 'number'].includes(typeof obj)) {
    return `${indentation}${JSON.stringify(obj)}`
  }
  if (Array.isArray(obj)) {
    if (obj.length === 0) return indentation + '[]'
    return `${indentation}[\n${obj.map(v => stringifyReproduceableJSONRecurse(v, indent + 1, false, indentCount)).join(',\n')}\n${getIndent(indent)}]`
  }
  throw new Error(`OH NOOOOO!!!! '${obj}'`)
}

export const stringifyReproduceableJSON = (obj, indentCount = 2) => {
  const stringified = stringifyReproduceableJSONRecurse(obj, 0, false, indentCount)

  if (stringified.indexOf('\n') >= 0) return stringified + '\n'
}

