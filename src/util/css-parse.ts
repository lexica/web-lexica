import * as R from "ramda"
import { useEffect, useState } from "react"
import { ElementIdentifier, useElementSize } from "./hooks"
import { logger } from "./logger"

const toCamelCaseReplaceFn = (_: string, wordSoFar: string, toCapitalize: string): string => {
  return `${wordSoFar}${toCapitalize.toUpperCase()}`
}

export const toCamelCase = (property: string) => property.replace(/(?:--)?(\w+)-(\w)/ig, toCamelCaseReplaceFn)

const getHeight = (id: string) => {
  try {
    const rawHeight = getComputedStyle(document.getElementById(id) as HTMLElement).height
    const height = parseFloat(rawHeight)

    return height
  } catch {
    return 0
  }
}

// eslint-disable-next-line
const rem = (value: number) => {
  const emPerPixel = getHeight('rem-cheat')
  return value * emPerPixel
}

const vh = (value: number) => {
  const vhPerPixel = getHeight('viewport-height-cheat')
  return value * vhPerPixel
}

// eslint-disable-next-line
const vw = (value: number) => {
  const vwPerPixel = getHeight('viewport-width-cheat')
  return value * vwPerPixel
}

const px = (value: number) => value

const unitMap = { rem, vh, vw, px, '': (num: number) => num } as const

type Unit = keyof typeof unitMap

const clamp = (min: number, target: number, max: number) => {
  const clampMin = Math.max(target, min)
  const clampMax = Math.min(clampMin, max)
  return clampMax
}

const min = (a: number, b: number) => Math.min(a, b)

const max = (a: number, b: number) => Math.max(a, b)

const cssFunctionMap = {
  clamp,
  max,
  min
} as const

type ValidNames = keyof typeof cssFunctionMap

const isValidFunctionName = (fnName: string): fnName is ValidNames => (Object.keys(cssFunctionMap) as any as ValidNames).includes(fnName)

const getCssFunctionName = (expression: string): keyof typeof cssFunctionMap => {
  const firstParenIndex = expression.indexOf('(')
  if (firstParenIndex === -1) throw new Error(`${expression} has no function call`)
  const untrimmedFnName = expression.substring(0, firstParenIndex)
  const fnName = untrimmedFnName.trim()
  if (isValidFunctionName(fnName)) return fnName

  throw new Error(`${fnName} is not a supported css function name, expression: ${expression}`)
}

const getParenCounts = (expression: string) => {
  let left = 0, right = 0
  expression.split('').forEach(char => {
    if (char === '(') left++
    if (char === ')') right++
  })

  return { left, right }
}

const stitchParensReducer = (acc: string[], value: string, index: number, arr: string[]) => {
  const { left, right } = getParenCounts(value)
  if (left > right) return [...acc, `${value}, ${arr[index + 1]}`]
  if (right > left) return acc
  return [...acc, value]
}

const isCssFunction = (arg: string) => {
  return arg.indexOf('(') !== -1
}

const isValidUint = (arg: string): arg is keyof typeof unitMap => unitMap.hasOwnProperty(arg)

const getUnit = (arg: string): Unit => {
  const result = /([a-z%]+)/.exec(arg)
  const unit = result && result.length ? result[0] : ''

  if (!isValidUint(unit)) throw new Error(`${unit} is not a supported/valid css unit. argument: ${arg}`)

  return unit
}

const factor = (ops: string[]): [number, string[]] => {
  const arg = ops.shift()
  if (!arg?.length) return [0, []]

  const number = arg.replace(/([\d.]*)/, '$1')
  const unit = getUnit(arg)
  const parsedNumber = parseFloat(number)

  if (!unit.length) return [parsedNumber, ops]

  return [unitMap[unit](parsedNumber), ops]
}

const isTerm = (op: string) => ['*', '/'].includes(op)

const term = (ops: string[]): [number, string[]] => {
  let [result, remainingOps] = factor(ops)
  while (remainingOps.length && isTerm(remainingOps[0])) {
    const operation = remainingOps.shift()
    const [factorResult, unusedOps] = factor(ops)
    remainingOps = unusedOps
    if (operation === '*') {
      result *= factorResult
    } else {
      result /= factorResult
    }
  }

  return [result, remainingOps]
}

const isExpression = (op: string) => ['+', '-'].includes(op)

const expression = (ops: string[]): [number, string[]] => {
  let [result, remainingOps] = factor(ops)
  while (remainingOps.length && isExpression(remainingOps[0])) {
    const op = remainingOps.shift()
    const [termResult, unusedOps] = term(remainingOps)
    remainingOps = unusedOps
    result = result + (op === '+' ? termResult : -termResult)
  }
  return [result, remainingOps]
}

const evaluateStatement = (arg: string): number => {
  if (isCssFunction(arg)) return evaluateFunction(arg)

  const ops = arg
    .replace(/([\d\w.]+)/g, ' $1 ')
    .split(' ')
    .filter(({ length }) => length)
    .map(op => op.trim())

  const [result] = expression(ops)

  return result
}

const evaluateFunction = (expression: string): number => {
  const fnName = getCssFunctionName(expression)
  const rest = expression.replace(fnName, '').trim()
  const args = rest
    .replace(/\((.*)\);?$/, '$1')
    .split(',')
    .map(w => w.trim())
    .filter(w => w.length > 0)
    .reduce<string[]>(stitchParensReducer, [] as string[])
    .map(w => w.trim())

  try {
    const values = args.map(evaluateStatement)

    if (fnName === 'clamp' && values.length !== 3) throw new Error(`${values} is not the right number of arguments for ${fnName}, ${expression}`)
    if (fnName === 'max' && values.length !== 2) throw new Error(`${values} is not the right number of arguments for ${fnName}, ${expression}`)
    if (fnName === 'min' && values.length !== 2) throw new Error(`${values} is not the right number of arguments for ${fnName}, ${expression}`)

    return cssFunctionMap[fnName](...(values as [any, any, any]))

  } catch (err: any) {
    throw new Error(`${err.message}, parent expression: ${expression}`)
  }
}

const argToString = (arg: any, expression: string) => {
  const keys = Object.keys(unitMap).filter(({ length }) => length)


  const isUnit = RegExp(`^(${keys.join('|')})\\s`)
  if (R.isNil(arg)) return isUnit.test(expression) ? '0' : ''

  return arg.toString()
}

const makeExpression = (strings: TemplateStringsArray, ...args: any[]) => {
  let expression = ''
  for (let i = args.length; i > 0; i--) {
    expression = `${strings[i]}${expression}`
    const arg = args[i - 1]
    const argString = argToString(arg, strings[i])
    expression = `${argString}${expression}`
  }
  return `${strings[0]}${expression}`
}

export const cssExp = (strings: TemplateStringsArray, ...args: any[]) => {
  const expression = makeExpression(strings, ...args)
  if (isCssFunction(expression)) return evaluateFunction(expression)
  return evaluateStatement(expression)
}

export const useCssExp = (expression: TemplateStringsArray, ...args: any[]) => {
  const [result, setResult] = useState(cssExp(expression, ...args))

  const { size: { width, height } } = useElementSize(ElementIdentifier.Type, 'body')

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = [width, height]

    logger.debug('running useCssExp useEffect...')

    setResult(cssExp(expression, ...args))
  }, [width, height, setResult, expression, args])

  return result
}

export const __test = {
  makeExpression,
  evaluateStatement,
  getHeight
}
